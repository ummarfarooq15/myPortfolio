/* ============================================================
   UMMAR FAROOQ — DIGITAL ARCHITECT
   PRODUCTION BACKEND ENGINE
   ============================================================ */

"use strict";

const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { promisify } = require("util");
require("dotenv").config();

const app = express();

/* ============================================================
   CONFIGURATION
   ============================================================ */

const PORT = Number(process.env.PORT) || 5000;

const HOST =
    process.env.HOST ||
    "0.0.0.0";

const ROOT_DIR =
    __dirname;

const DATA_DIR = process.env.DATA_DIR || path.join(ROOT_DIR, "private-data");

const DATA_FILE =
    path.join(DATA_DIR, "messages.json");

const MAX_BODY_SIZE =
    "1mb";

const RATE_WINDOW =
    60 * 1000;

const RATE_LIMIT =
    20;
const MAX_STORED_MESSAGES = 5000;
const MAX_DATABASE_BYTES = 25 * 1024 * 1024;

const SESSION_TTL = 8 * 60 * 60 * 1000;
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const SESSION_SECRET = process.env.SESSION_SECRET || "";
const SESSION_COOKIE = "uf_admin_session";
const scrypt = promisify(crypto.scrypt);
const sessions = new Map();
let writeQueue = Promise.resolve();


/* ============================================================
   DATA INITIALIZATION
   ============================================================ */

function initializeStorage() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(
                DATA_DIR,
                { recursive: true }
            );
        }

        if (!fs.existsSync(DATA_FILE)) {
            const legacyFile = path.join(ROOT_DIR, "data", "messages.json");
            if (DATA_FILE !== legacyFile && fs.existsSync(legacyFile)) {
                fs.copyFileSync(legacyFile, DATA_FILE);
            } else {
                fs.writeFileSync(DATA_FILE, "[]", { encoding: "utf8", mode: 0o600 });
            }
        }
        fs.chmodSync(DATA_DIR, 0o700);
        fs.chmodSync(DATA_FILE, 0o600);
    } catch (error) {
        console.error(
            "Storage initialization failed:",
            error
        );

        process.exit(1);
    }
}

initializeStorage();


/* ============================================================
   APP CONFIGURATION
   ============================================================ */

app.disable("x-powered-by");

app.use((req, res, next) => {
    res.setHeader("Cache-Control", req.path.startsWith("/api/") ? "no-store" : "public, max-age=0, must-revalidate");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; img-src 'self' data: https:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
    if (process.env.NODE_ENV === "production") {
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
});


app.use(
    express.json({
        limit:
            MAX_BODY_SIZE
    })
);

app.use(
    express.urlencoded({
        extended: false,
        limit:
            MAX_BODY_SIZE
    })
);

app.use(["/data", "/private-data"], (req, res) => res.sendStatus(404));
const privatePathFromRoot = path.relative(ROOT_DIR, path.resolve(DATA_DIR));
if (privatePathFromRoot && !privatePathFromRoot.startsWith(`..${path.sep}`) && privatePathFromRoot !== "..") {
    app.use(`/${privatePathFromRoot.split(path.sep).join("/")}`, (req, res) => res.sendStatus(404));
}

app.use((req, res, next) => {
    let requestPath = req.path;
    try { requestPath = decodeURIComponent(req.path); } catch { return res.sendStatus(400); }
    if (/^\/(?:server\.js|package(?:-lock)?\.json|\.env(?:\..*)?|\.gitignore|README\.md|node_modules(?:\/|$)|data(?:\/|$)|private-data(?:\/|$))/i.test(requestPath)) {
        return res.sendStatus(404);
    }
    next();
});


/* ============================================================
   STATIC WEBSITE
   ============================================================ */

app.use(
    express.static(
        ROOT_DIR,
        {
            index: "index.html",
            extensions: [
                "html"
            ],
            maxAge:
                process.env.NODE_ENV === "production"
                    ? "1d"
                    : 0
        }
    )
);


/* ============================================================
   SIMPLE MEMORY RATE LIMITER
   ============================================================ */

const requests = new Map();

function rateLimit(
    req,
    res,
    next
) {
    if (requests.size > 10000) {
        for (const [key, value] of requests) {
            if (Date.now() - value.start > RATE_WINDOW) requests.delete(key);
        }
    }
    const ip = req.socket.remoteAddress || "unknown";

    const now =
        Date.now();

    const existing =
        requests.get(ip);

    if (
        !existing ||
        now - existing.start >
            RATE_WINDOW
    ) {
        requests.set(
            ip,
            {
                start: now,
                count: 1
            }
        );

        return next();
    }

    existing.count++;

    if (
        existing.count >
        RATE_LIMIT
    ) {
        return res
            .status(429)
            .json({
                success: false,
                message:
                    "Too many requests. Please try again later."
            });
    }

    next();
}

function parseCookies(header = "") {
    return Object.fromEntries(header.split(";").map(part => {
        const index = part.indexOf("=");
        if (index < 0) return ["", ""];
        const value = part.slice(index + 1).trim();
        try { return [part.slice(0, index).trim(), decodeURIComponent(value)]; }
        catch { return [part.slice(0, index).trim(), ""]; }
    }).filter(([key]) => key));
}

function sessionKey(token) {
    return crypto.createHmac("sha256", SESSION_SECRET).update(token).digest("hex");
}

function requireAdmin(req, res, next) {
    const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    const key = token && SESSION_SECRET ? sessionKey(token) : "";
    const session = key && sessions.get(key);
    if (!session || session.expiresAt < Date.now()) {
        if (key) sessions.delete(key);
        return res.status(401).json({ success: false, message: "Admin sign-in required." });
    }
    session.expiresAt = Date.now() + SESSION_TTL;
    next();
}

function sameSecret(a = "", b = "") {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    return left.length === right.length && crypto.timingSafeEqual(left, right);
}


app.get("/admin.html", (req, res) => res.sendFile(path.join(ROOT_DIR, "admin.html")));

app.post("/api/admin/login", rateLimit, async (req, res) => {
    if (!ADMIN_PASSWORD_HASH || SESSION_SECRET.length < 32) {
        return res.status(503).json({ success: false, message: "Admin authentication is not configured. Set ADMIN_PASSWORD_HASH and SESSION_SECRET." });
    }
    const username = cleanText(req.body?.username, 100);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const [salt, expected] = ADMIN_PASSWORD_HASH.split(":");
    if (!salt || !expected || !sameSecret(username, ADMIN_USER) || password.length > 256) {
        return res.status(401).json({ success: false, message: "Invalid username or password." });
    }
    try {
        const derived = await scrypt(password, salt, 64);
        if (!sameSecret(derived.toString("hex"), expected)) {
            return res.status(401).json({ success: false, message: "Invalid username or password." });
        }
        const token = crypto.randomBytes(32).toString("hex");
        sessions.set(sessionKey(token), { expiresAt: Date.now() + SESSION_TTL });
        res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${SESSION_TTL / 1000}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
        return res.json({ success: true });
    } catch (error) {
        console.error("Admin authentication error:", error);
        return res.status(500).json({ success: false, message: "Sign-in failed." });
    }
});

app.post("/api/admin/logout", (req, res) => {
    const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    if (token && SESSION_SECRET.length >= 32) sessions.delete(sessionKey(token));
    res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
    res.json({ success: true });
});

app.get("/api/admin/session", requireAdmin, (req, res) => res.json({ success: true }));

app.get("/api/admin/messages", requireAdmin, (req, res) => {
    const messages = readMessages().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: messages.length, messages });
});

app.get("/api/admin/messages/:id", requireAdmin, (req, res) => {
    const message = readMessages().find(item => item.id === req.params.id);
    if (!message) return res.status(404).json({ success: false, message: "Message not found." });
    res.json({ success: true, message });
});



/* ============================================================
   INPUT UTILITIES
   ============================================================ */

function cleanText(
    value,
    maxLength
) {
    if (
        typeof value !== "string"
    ) {
        return "";
    }

    return value
        .replace(/\0/g, "")
        .trim()
        .slice(0, maxLength);
}

function isValidEmail(
    email
) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


/* ============================================================
   FILE DATABASE HELPERS
   ============================================================ */

function readMessages() {
    try {
        const raw =
            fs.readFileSync(
                DATA_FILE,
                "utf8"
            );

        const parsed =
            JSON.parse(raw);

        return Array.isArray(parsed)
            ? parsed
            : [];
    } catch (error) {
        console.error(
            "Database read failed:",
            error
        );
        throw new Error("Contact database could not be read.", { cause: error });
    }
}

function writeMessages(messages) {
    const temporaryFile =
        `${DATA_FILE}.tmp`;

    fs.writeFileSync(
        temporaryFile,
        JSON.stringify(
            messages,
            null,
            2
        ),
        { encoding: "utf8", mode: 0o600 }
    );

    fs.renameSync(
        temporaryFile,
        DATA_FILE
    );
}

function appendMessage(message) {
    const task = writeQueue.catch(() => {}).then(() => {
        const messages = readMessages();
        if (messages.length >= MAX_STORED_MESSAGES) {
            const error = new Error("Contact inbox is full.");
            error.code = "DATABASE_CAPACITY";
            throw error;
        }
        messages.push(message);
        const serialized = JSON.stringify(messages, null, 2);
        if (Buffer.byteLength(serialized, "utf8") > MAX_DATABASE_BYTES) {
            const error = new Error("Contact inbox has reached its storage limit.");
            error.code = "DATABASE_CAPACITY";
            throw error;
        }
        writeMessages(messages);
    });
    writeQueue = task;
    return task;
}


/* ============================================================
   HEALTH / SYSTEM STATUS
   ============================================================ */

app.get(
    "/api/health",
    (req, res) => {
        res.json({
            success: true,
            system:
                "UMMAR DIGITAL CORE",
            status:
                "ONLINE",
            uptime:
                process.uptime(),
            timestamp:
                new Date().toISOString(),
            environment:
                process.env.NODE_ENV ||
                "development",
            node:
                process.version
        });
    }
);


/* ============================================================
   CONTACT — CREATE MESSAGE
   ============================================================ */

app.post(
    "/api/contact",
    rateLimit,
    async (req, res) => {

        try {

            const name =
                cleanText(
                    req.body?.name,
                    100
                );

            const email =
                cleanText(
                    req.body?.email,
                    180
                );

            const subject =
                cleanText(
                    req.body?.subject,
                    180
                );

            const message =
                cleanText(
                    req.body?.message,
                    5000
                );


            /* VALIDATION */

            if (
                !name ||
                !email ||
                !subject ||
                !message
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "All fields are required."
                    });
            }

            if (
                !isValidEmail(email)
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Please provide a valid email address."
                    });
            }

            if (
                name.length < 2
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Name is too short."
                    });
            }

            if (
                subject.length < 2
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Subject is too short."
                    });
            }

            if (
                message.length < 5
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Message is too short."
                    });
            }


            /* CREATE MESSAGE */

            const newMessage = {
                id:
                    crypto.randomUUID(),

                name,

                email,

                subject,

                message,

                createdAt:
                    new Date()
                        .toISOString(),

            };


            /* SAVE */

            await appendMessage(newMessage);


            /* RESPONSE */

            return res
                .status(201)
                .json({
                    success: true,
                    message:
                        "Transmission successful.",
                    id:
                        newMessage.id
                });

        } catch (error) {

            console.error(
                "Contact API error:",
                error
            );

            return res
                .status(error.code === "DATABASE_CAPACITY" ? 507 : 500)
                .json({
                    success: false,
                    message:
                        "Internal server error."
                });
        }
    }
);


/* ============================================================
   CONTACT — READ MESSAGES
   ============================================================ */

app.get(
    "/api/contact/messages",
    (req, res) => {
        return res.status(410).json({
            success: false,
            message: "Message browsing is disabled. Use the protected admin dashboard."
        });
    }
);


/* ============================================================
   CONTACT — SINGLE MESSAGE
   ============================================================ */

app.get(
    "/api/contact/messages/:id",
    (req, res) => {
        return res.status(410).json({
            success: false,
            message: "Message browsing is disabled."
        });
    }
);


/* ============================================================
   404 API HANDLER
   ============================================================ */

app.use(
    "/api",
    (req, res) => {
        res
            .status(404)
            .json({
                success: false,
                message:
                    "API endpoint not found."
            });
    }
);


/* ============================================================
   GLOBAL ERROR HANDLER
   ============================================================ */

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "Unhandled server error:",
            error
        );

        if (
            res.headersSent
        ) {
            return next(error);
        }

        res
            .status(500)
            .json({
                success: false,
                message:
                    "Unexpected server error."
            });
    }
);


/* ============================================================
   GRACEFUL SHUTDOWN
   ============================================================ */

function shutdown(
    signal
) {
    console.log(
        `\n${signal} received.`
    );

    server.close(
        () => {
            console.log(
                "Digital Core shutdown complete."
            );

            process.exit(0);
        }
    );
}

process.on(
    "SIGINT",
    () =>
        shutdown("SIGINT")
);

process.on(
    "SIGTERM",
    () =>
        shutdown("SIGTERM")
);


/* ============================================================
   START SERVER
   ============================================================ */

const server =
    app.listen(
        PORT,
        HOST,
        () => {

            console.log(
                "\n==============================================="
            );

            console.log(
                "   UMMAR FAROOQ — DIGITAL CORE"
            );

            console.log(
                "==============================================="
            );

            console.log(
                ` STATUS   : ONLINE`
            );

            console.log(
                ` PORT     : ${PORT}`
            );

            console.log(
                ` URL      : http://localhost:${PORT}`
            );

            console.log(
                ` API      : http://localhost:${PORT}/api/health`
            );

            console.log(
                ` CONTACT  : /api/contact`
            );

            console.log(
                " DATABASE : local JSON storage"
            );

            console.log(
                "===============================================\n"
            );
        }
    );

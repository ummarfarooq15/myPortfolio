/* ============================================================
   UMMAR FAROOQ — DIGITAL ARCHITECT
   MASTER FRONTEND ENGINE
   ============================================================ */

(() => {
    "use strict";

    /* =========================================================
       01 — CORE HELPERS
       ========================================================= */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        Array.from(parent.querySelectorAll(selector));

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const lerp = (a, b, t) =>
        a + (b - a) * t;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const coarsePointer = window.matchMedia(
        "(pointer: coarse)"
    ).matches;

    const supportsHover =
        window.matchMedia("(hover: hover)").matches;

    const html = document.documentElement;
    const body = document.body;


    /* =========================================================
       02 — GLOBAL STATE
       ========================================================= */

    const state = {
        theme: "dark",

        menuOpen: false,
        jarvisOpen: false,

        scrollY: window.scrollY,
        lastScrollY: window.scrollY,

        mouseX: window.innerWidth / 2,
        mouseY: window.innerHeight / 2,

        smoothMouseX: window.innerWidth / 2,
        smoothMouseY: window.innerHeight / 2,

        pageProgress: 0,

        typingWordIndex: 0,
        typingCharacterIndex: 0,
        typingDeleting: false,

        terminalHistory: [],
        terminalHistoryIndex: -1,

        toastTimer: null,

        voice: {
            recognition: null,
            active: false
        },

        three: {
            loaded: false,
            active: false,
            scene: null,
            camera: null,
            renderer: null,
            group: null,
            earth: null,
            innerEarth: null,
            atmosphere: null,
            ringA: null,
            ringB: null,
            points: null,
            glow: null,
            animationFrame: null
        }
    };


    /* =========================================================
       03 — DOM REFERENCES
       ========================================================= */

    const bootScreen =
        $("#boot-screen");

    const bootPercentage =
        $("#boot-percentage");

    const bootProgress =
        $("#boot-progress-bar");

    const themeToggle =
        $("#theme-toggle");

    const themeOverlay =
        $("#theme-overlay");

    const header =
        $(".site-header");

    const menuToggle =
        $(".menu-toggle");

    const mobileMenu =
        $("#mobile-menu");

    const typingTarget =
        $("#hero-typing");

    const cursorDot =
        $(".cursor-dot");

    const cursorOutline =
        $(".cursor-outline");

    const cursorLabel =
        $(".cursor-label");

    const particleCanvas =
        $("#particle-canvas");

    const galaxyCanvas =
        $("#galaxy");

    const particleBackground =
        $("#particles-bg");

    const earthCanvas =
        $("#earth-canvas");

    const earthContainer =
        $("#earth-container");

    const jarvisPanel =
        $("#jarvis-panel");

    const jarvisButton =
        $("#jarvis-button");

    const jarvisClose =
        $("#jarvis-close");

    const jarvisForm =
        $("#jarvis-form");

    const jarvisInput =
        $("#jarvis-input");

    const jarvisOutput =
        $("#jarvis-output");

    const terminalInput =
        $("#terminal-input");

    const terminalOutput =
        $("#terminal-output");

    const contactForm =
        $("#contact-form");

    const formStatus =
        $("#form-status");

    const toast =
        $("#toast");

    const toastMessage =
        $("#toast-message");

    const dynamicTime =
        $(".dynamic-island-time");

    const aiStatusText =
        $(".ai-status-text");

    const timelineProgress =
        $(".timeline-progress");

    const trailContainer =
        $("#trail-container");


    /* =========================================================
       04 — SAFE STORAGE
       ========================================================= */

    const STORAGE_KEY =
        "ummar-portfolio-theme";

    function getStoredTheme() {
        try {
            const value =
                localStorage.getItem(
                    STORAGE_KEY
                );

            return value === "light"
                ? "light"
                : "dark";

        } catch {
            return "dark";
        }
    }

    function saveTheme(theme) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                theme
            );
        } catch {
            /* Ignore storage errors. */
        }
    }


    /* =========================================================
       05 — THEME ENGINE
       ========================================================= */

    function updateThemeMeta() {
        const themeMeta =
            $('meta[name="theme-color"]');

        if (themeMeta) {
            themeMeta.setAttribute(
                "content",
                state.theme === "light"
                    ? "#f4f7fa"
                    : "#05070a"
            );
        }
    }

    function updateThemeButton() {
        if (!themeToggle) return;

        const icon =
            $("i", themeToggle);

        const label =
            $("span", themeToggle);

        if (state.theme === "light") {

            icon?.classList.remove(
                "fa-moon"
            );

            icon?.classList.add(
                "fa-sun"
            );

            if (label) {
                label.textContent =
                    "Light";
            }

        } else {

            icon?.classList.remove(
                "fa-sun"
            );

            icon?.classList.add(
                "fa-moon"
            );

            if (label) {
                label.textContent =
                    "Dark";
            }
        }
    }

    function applyTheme(
        theme,
        animate = false
    ) {
        const nextTheme =
            theme === "light"
                ? "light"
                : "dark";

        state.theme =
            nextTheme;

        const apply = () => {

            body.classList.toggle(
                "light",
                nextTheme === "light"
            );

            html.dataset.theme =
                nextTheme;

            updateThemeButton();
            updateThemeMeta();
            saveTheme(nextTheme);
        };

        if (
            animate &&
            themeOverlay &&
            !reducedMotion
        ) {

            themeOverlay.style.display =
                "block";

            themeOverlay.style.opacity =
                "1";

            themeOverlay.style.clipPath =
                "circle(0% at 0% 0%)";

            requestAnimationFrame(() => {

                themeOverlay.style.transition =
                    "clip-path .9s cubic-bezier(.77,0,.18,1), opacity .35s ease";

                themeOverlay.style.clipPath =
                    "circle(170% at 100% 100%)";
            });

            setTimeout(() => {

                apply();

                setTimeout(() => {
                    themeOverlay.style.opacity =
                        "0";
                }, 100);

                setTimeout(() => {
                    themeOverlay.style.display =
                        "none";

                    themeOverlay.style.transition =
                        "";

                    themeOverlay.style.clipPath =
                        "circle(0% at 0% 0%)";
                }, 550);

            }, 520);

        } else {
            apply();
        }
    }

    applyTheme(
        getStoredTheme(),
        false
    );

    themeToggle?.addEventListener(
        "click",
        () => {

            applyTheme(
                state.theme === "dark"
                    ? "light"
                    : "dark",
                true
            );
        }
    );


    /* =========================================================
       06 — BOOT SEQUENCE
       ========================================================= */

    function runBootSequence() {

        if (!bootScreen) {
            return;
        }

        const startedAt = performance.now();
        const minimumDuration = reducedMotion ? 180 : 950;
        let value = 0;

        const finish = () => {
            bootScreen.classList.add("boot-complete");
            window.setTimeout(() => {
                bootScreen.remove();
                document.dispatchEvent(new CustomEvent("portfolio:ready"));
            }, reducedMotion ? 30 : 520);
        };

        const update = () => {
            const elapsed = performance.now() - startedAt;
            const ready = document.readyState === "complete";
            value = Math.max(value, Math.min(96, Math.round(8 + elapsed / minimumDuration * (ready ? 88 : 68))));
            if (bootPercentage) bootPercentage.textContent = `${String(value).padStart(3, "0")}%`;
            if (bootProgress) bootProgress.style.width = `${value}%`;

            if (elapsed >= minimumDuration && ready) {
                if (bootPercentage) bootPercentage.textContent = "100%";
                if (bootProgress) bootProgress.style.width = "100%";
                finish();
                return;
            }
            requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
    }


    /* =========================================================
       07 — CLOCK
       ========================================================= */

    function updateClock() {

        if (!dynamicTime) {
            return;
        }

        const now =
            new Date();

        const h =
            String(
                now.getHours()
            ).padStart(2, "0");

        const m =
            String(
                now.getMinutes()
            ).padStart(2, "0");

        const s =
            String(
                now.getSeconds()
            ).padStart(2, "0");

        dynamicTime.textContent =
            `${h}:${m}:${s}`;
    }

    updateClock();
    window.setInterval(updateClock, 1000);


    /* =========================================================
       08 — MOBILE NAVIGATION
       ========================================================= */

    function closeMobileMenu() {

        state.menuOpen = false;

        mobileMenu?.classList.remove(
            "is-open"
        );

        mobileMenu?.setAttribute(
            "aria-hidden",
            "true"
        );
        if (mobileMenu) mobileMenu.inert = true;

        menuToggle?.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    function toggleMobileMenu() {

        state.menuOpen =
            !state.menuOpen;

        mobileMenu?.classList.toggle(
            "is-open",
            state.menuOpen
        );

        mobileMenu?.setAttribute(
            "aria-hidden",
            String(!state.menuOpen)
        );
        if (mobileMenu) mobileMenu.inert = !state.menuOpen;

        menuToggle?.setAttribute(
            "aria-expanded",
            String(state.menuOpen)
        );
    }

    menuToggle?.addEventListener(
        "click",
        toggleMobileMenu
    );

    $$(".mobile-menu a").forEach(
        link => {

            link.addEventListener(
                "click",
                closeMobileMenu
            );
        }
    );


    /* =========================================================
       09 — SMOOTH INTERNAL LINKS
       ========================================================= */

    $$('a[href^="#"]').forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    const href =
                        link.getAttribute(
                            "href"
                        );

                    if (
                        !href ||
                        href === "#"
                    ) {
                        return;
                    }

                    const target =
                        document.querySelector(
                            href
                        );

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior:
                            reducedMotion
                                ? "auto"
                                : "smooth",

                        block: "start"
                    });

                    closeMobileMenu();
                }
            );
        }
    );


    /* =========================================================
       10 — SCROLL SYSTEM
       ========================================================= */

    let scrollTicking = false;

    function updateScroll() {

        const y =
            window.scrollY;

        state.scrollY = y;

        if (header) {

            header.classList.toggle(
                "is-scrolled",
                y > 30
            );

            const goingDown =
                y > state.lastScrollY;

            if (
                goingDown &&
                y > 180 &&
                !state.menuOpen &&
                !state.jarvisOpen
            ) {

                header.classList.add(
                    "header-hidden"
                );

            } else {

                header.classList.remove(
                    "header-hidden"
                );
            }
        }

        const pageHeight =
            document.documentElement
                .scrollHeight -
            window.innerHeight;

        state.pageProgress =
            pageHeight > 0
                ? clamp(
                    y / pageHeight,
                    0,
                    1
                )
                : 0;

        if (timelineProgress) {
            timelineProgress.style.setProperty(
                "--timeline-progress",
                `${state.pageProgress * 100}%`
            );
        }

        html.style.setProperty("--page-progress", `${state.pageProgress * 100}%`);

        state.lastScrollY =
            y;

        scrollTicking = false;
    }

    window.addEventListener(
        "scroll",
        () => {

            if (!scrollTicking) {

                requestAnimationFrame(
                    updateScroll
                );

                scrollTicking =
                    true;
            }
        },
        {
            passive: true
        }
    );

    updateScroll();


    /* =========================================================
       11 — ACTIVE SECTION NAV
       ========================================================= */

    const sections =
        $$("main section[id]");

    const navItems =
        $$(".nav-item");

    if (sections.length) {

        const sectionObserver =
            new IntersectionObserver(
                entries => {

                    const visible =
                        entries
                            .filter(
                                entry =>
                                    entry.isIntersecting
                            )
                            .sort(
                                (
                                    a,
                                    b
                                ) =>
                                    b.intersectionRatio -
                                    a.intersectionRatio
                            )[0];

                    if (!visible) {
                        return;
                    }

                    navItems.forEach(
                        item => {

                            const href =
                                item.getAttribute(
                                    "href"
                                );

                            item.classList.toggle(
                                "active",
                                href ===
                                    `#${visible.target.id}`
                            );
                        }
                    );
                },
                {
                    threshold: [
                        0.1,
                        0.25,
                        0.5
                    ],

                    rootMargin:
                        "-25% 0px -55% 0px"
                }
            );

        sections.forEach(
            section => {
                sectionObserver.observe(
                    section
                );
            }
        );
    }


    /* =========================================================
       12 — REVEAL ENGINE
       ========================================================= */

    const revealElements =
        $$(".reveal");

    if (
        reducedMotion ||
        !("IntersectionObserver" in window)
    ) {

        revealElements.forEach(
            element => {
                element.classList.add(
                    "reveal-visible"
                );
            }
        );

    } else {

        const revealObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                !entry.isIntersecting
                            ) {
                                return;
                            }

                            const target = entry.target;
                            const siblings = target.parentElement
                                ? Array.from(target.parentElement.children).filter(child => child.classList.contains("reveal"))
                                : [];
                            const index = siblings.indexOf(target);
                            target.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 85}ms`);
                            target.classList.add("reveal-visible");

                            revealObserver.unobserve(
                                entry.target
                            );
                        }
                    );
                },
                {
                    threshold: 0.08,
                    rootMargin:
                        "0px 0px -35px 0px"
                }
            );

        revealElements.forEach(
            element => {
                revealObserver.observe(
                    element
                );
            }
        );
    }

    // Add a lightweight scroll progress cue without adding more DOM to the page.
    const pageProgressBar = document.createElement("div");
    pageProgressBar.className = "page-progress-bar";
    pageProgressBar.setAttribute("aria-hidden", "true");
    document.body.appendChild(pageProgressBar);


    /* =========================================================
       13 — NUMBER COUNTERS
       ========================================================= */

    function animateCounter(
        element
    ) {

        const target =
            Number(
                element.dataset.count
            );

        if (
            !Number.isFinite(target)
        ) {
            return;
        }

        if (reducedMotion) {

            element.textContent =
                String(target);

            return;
        }

        const duration =
            1300;

        const start =
            performance.now();

        function frame(now) {

            const progress =
                clamp(
                    (now - start) /
                        duration,
                    0,
                    1
                );

            const eased =
                1 -
                Math.pow(
                    1 - progress,
                    3
                );

            element.textContent =
                String(
                    Math.floor(
                        target *
                        eased
                    )
                );

            if (
                progress < 1
            ) {

                requestAnimationFrame(
                    frame
                );

            } else {

                element.textContent =
                    String(target);
            }
        }

        requestAnimationFrame(
            frame
        );
    }

    const counters =
        $$("[data-count]");

    if (counters.length) {

        const counterObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                !entry.isIntersecting
                            ) {
                                return;
                            }

                            animateCounter(
                                entry.target
                            );

                            counterObserver.unobserve(
                                entry.target
                            );
                        }
                    );
                },
                {
                    threshold: 0.65
                }
            );

        counters.forEach(
            counter => {
                counterObserver.observe(
                    counter
                );
            }
        );
    }


    /* =========================================================
       14 — HERO TYPEWRITER
       ========================================================= */

    const typingWords = [
        "FULL STACK DEVELOPER",
        "AI BUILDER",
        "DIGITAL ARCHITECT",
        "FUTURE ENGINEER",
        "CREATIVE DEVELOPER",
        "AUTOMATION ENGINEER"
    ];

    function typeHero() {

        if (!typingTarget) {
            return;
        }

        const word =
            typingWords[
                state.typingWordIndex
            ];

        if (
            !state.typingDeleting
        ) {

            state.typingCharacterIndex++;

            typingTarget.textContent =
                word.slice(
                    0,
                    state.typingCharacterIndex
                );

            if (
                state.typingCharacterIndex >=
                word.length
            ) {

                state.typingDeleting =
                    true;

                setTimeout(
                    typeHero,
                    1300
                );

                return;
            }

        } else {

            state.typingCharacterIndex--;

            typingTarget.textContent =
                word.slice(
                    0,
                    state.typingCharacterIndex
                );

            if (
                state.typingCharacterIndex <=
                0
            ) {

                state.typingDeleting =
                    false;

                state.typingWordIndex =
                    (
                        state.typingWordIndex +
                        1
                    ) %
                    typingWords.length;
            }
        }

        setTimeout(
            typeHero,
            state.typingDeleting
                ? 38
                : 68
        );
    }

    if (
        typingTarget &&
        !reducedMotion
    ) {

        typingTarget.textContent =
            "";

        setTimeout(
            typeHero,
            400
        );
    }


    /* =========================================================
       15 — MAGNETIC CONTROLS
       ========================================================= */

    if (
        supportsHover &&
        !coarsePointer &&
        !reducedMotion
    ) {

        $$(".magnetic").forEach(
            element => {

                element.addEventListener(
                    "pointermove",
                    event => {

                        const rect =
                            element.getBoundingClientRect();

                        const x =
                            event.clientX -
                            (
                                rect.left +
                                rect.width / 2
                            );

                        const y =
                            event.clientY -
                            (
                                rect.top +
                                rect.height / 2
                            );

                        element.style.transform =
                            `translate3d(${x * 0.12}px, ${y * 0.12}px, 0)`;
                    }
                );

                element.addEventListener(
                    "pointerleave",
                    () => {
                        element.style.transform =
                            "";
                    }
                );
            }
        );
    }


    /* =========================================================
       16 — CUSTOM CURSOR
       ========================================================= */

    if (
        supportsHover &&
        !coarsePointer &&
        !reducedMotion &&
        !document.hidden &&
        cursorDot &&
        cursorOutline
    ) {

        let cursorX =
            window.innerWidth / 2;

        let cursorY =
            window.innerHeight / 2;

        let outlineX =
            cursorX;

        let outlineY =
            cursorY;

        window.addEventListener(
            "pointermove",
            event => {

                cursorX =
                    event.clientX;

                cursorY =
                    event.clientY;

                state.mouseX =
                    cursorX;

                state.mouseY =
                    cursorY;

                cursorDot.style.transform =
                    `translate3d(${cursorX}px, ${cursorY}px, 0)`;
            },
            {
                passive: true
            }
        );

        let cursorFrame = 0;
        function animateCursor() {

            outlineX =
                lerp(
                    outlineX,
                    cursorX,
                    0.16
                );

            outlineY =
                lerp(
                    outlineY,
                    cursorY,
                    0.16
                );

            cursorOutline.style.transform =
                `translate3d(${outlineX}px, ${outlineY}px, 0)`;

            if (cursorLabel) {

                cursorLabel.style.transform =
                    `translate3d(${outlineX + 18}px, ${outlineY + 18}px, 0)`;
            }

            cursorFrame = requestAnimationFrame(animateCursor);
        }

        cursorFrame = requestAnimationFrame(animateCursor);
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) cancelAnimationFrame(cursorFrame);
            else cursorFrame = requestAnimationFrame(animateCursor);
        });

        $$(
            "a, button, input, textarea, .project-card, .skill-card, .capability-card"
        ).forEach(
            element => {

                element.addEventListener(
                    "pointerenter",
                    () => {

                        cursorOutline.classList.add(
                            "is-active"
                        );

                        if (cursorLabel) {
                            cursorLabel.textContent =
                                element.matches(
                                    "input, textarea"
                                )
                                    ? "TYPE"
                                    : "OPEN";
                        }
                    }
                );

                element.addEventListener(
                    "pointerleave",
                    () => {

                        cursorOutline.classList.remove(
                            "is-active"
                        );

                        if (cursorLabel) {
                            cursorLabel.textContent =
                                "INTERACT";
                        }
                    }
                );
            }
        );
    }


    /* =========================================================
       17 — GLOBAL MOUSE VARIABLES
       ========================================================= */

    if (
        !coarsePointer &&
        !reducedMotion
    ) {

        window.addEventListener(
            "pointermove",
            event => {

                const x =
                    (
                        event.clientX /
                        window.innerWidth -
                        0.5
                    ) * 2;

                const y =
                    (
                        event.clientY /
                        window.innerHeight -
                        0.5
                    ) * 2;

                html.style.setProperty(
                    "--mouse-x",
                    x
                );

                html.style.setProperty(
                    "--mouse-y",
                    y
                );

                state.mouseX =
                    event.clientX;

                state.mouseY =
                    event.clientY;
            },
            {
                passive: true
            }
        );
    }


    /* =========================================================
       18 — SMOOTH HERO PARALLAX
       ========================================================= */

    let parallaxFrame = 0;
    function animateParallax() {

        state.smoothMouseX =
            lerp(
                state.smoothMouseX,
                state.mouseX,
                0.045
            );

        state.smoothMouseY =
            lerp(
                state.smoothMouseY,
                state.mouseY,
                0.045
            );

        if (
            !coarsePointer &&
            !reducedMotion
        ) {

            const px =
                (
                    state.smoothMouseX -
                    window.innerWidth / 2
                ) /
                (window.innerWidth / 2);

            const py =
                (
                    state.smoothMouseY -
                    window.innerHeight / 2
                ) /
                (window.innerHeight / 2);

            const heroCopy =
                $(".hero-copy");

            if (heroCopy) {

                heroCopy.style.transform =
                    `translate3d(${px * -6}px, ${py * -4}px, 0)`;
            }

            if (earthContainer) {

                earthContainer.style.marginTop =
                    `${py * -8}px`;
            }

            if (particleBackground) {

                particleBackground.style.backgroundPosition =
                    `${px * 18}px ${py * 18}px`;
            }
        }

        if (!document.hidden && !reducedMotion && !coarsePointer) {
            parallaxFrame = requestAnimationFrame(animateParallax);
        }
    }

    if (!reducedMotion && !coarsePointer && !document.hidden) {
        parallaxFrame = requestAnimationFrame(animateParallax);
    }
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) cancelAnimationFrame(parallaxFrame);
        else if (!reducedMotion && !coarsePointer) parallaxFrame = requestAnimationFrame(animateParallax);
    });


    /* =========================================================
       19 — PROJECT 3D TILT
       ========================================================= */

    if (
        supportsHover &&
        !coarsePointer &&
        !reducedMotion
    ) {

        $$(".project-card").forEach(
            card => {

                card.addEventListener(
                    "pointermove",
                    event => {

                        const rect =
                            card.getBoundingClientRect();

                        const x =
                            (
                                event.clientX -
                                rect.left
                            ) /
                            rect.width;

                        const y =
                            (
                                event.clientY -
                                rect.top
                            ) /
                            rect.height;

                        const rotateY =
                            (
                                x - 0.5
                            ) * 8;

                        const rotateX =
                            (
                                y - 0.5
                            ) * -8;

                        card.style.transform =
                            `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
                    }
                );

                card.addEventListener(
                    "pointerleave",
                    () => {
                        card.style.transform =
                            "";
                    }
                );
            }
        );
    }


    /* =========================================================
       20 — PARTICLE CANVAS
       ========================================================= */

    class ParticleEngine {

        constructor(canvas) {

            this.canvas =
                canvas;

            this.ctx =
                canvas.getContext(
                    "2d"
                );

            this.width =
                0;

            this.height =
                0;

            this.dpr =
                1;

            this.particles =
                [];

            this.resize =
                this.resize.bind(this);

            this.animate =
                this.animate.bind(this);

            this.init();
        }

        resize() {

            this.dpr =
                Math.min(
                    window.devicePixelRatio ||
                        1,
                    1.5
                );

            this.width =
                window.innerWidth;

            this.height =
                window.innerHeight;

            this.canvas.width =
                this.width *
                this.dpr;

            this.canvas.height =
                this.height *
                this.dpr;

            this.canvas.style.width =
                `${this.width}px`;

            this.canvas.style.height =
                `${this.height}px`;

            this.ctx.setTransform(
                this.dpr,
                0,
                0,
                this.dpr,
                0,
                0
            );
        }

        createParticles() {

            const mobile =
                window.innerWidth < 800;

            const count =
                mobile
                    ? 30
                    : 72;

            this.particles =
                [];

            for (
                let i = 0;
                i < count;
                i++
            ) {

                this.particles.push({

                    x:
                        Math.random() *
                        this.width,

                    y:
                        Math.random() *
                        this.height,

                    radius:
                        Math.random() *
                        1.2 +
                        0.25,

                    speed:
                        Math.random() *
                        0.18 +
                        0.02,

                    drift:
                        Math.random() *
                        0.25 -
                        0.125,

                    alpha:
                        Math.random() *
                        0.4 +
                        0.08
                });
            }
        }

        init() {

            this.resize();

            this.createParticles();

            window.addEventListener(
                "resize",
                () => {

                    this.resize();

                    this.createParticles();
                },
                {
                    passive: true
                }
            );

            this.running = false;
            this.setRunning = shouldRun => {
                if (this.running === shouldRun) return;
                this.running = shouldRun;
                if (shouldRun) this.frame = requestAnimationFrame(this.animate);
                else cancelAnimationFrame(this.frame);
            };
            document.addEventListener("visibilitychange", () => this.setRunning(!document.hidden));
            this.setRunning(!document.hidden);
        }

        animate() {

            this.ctx.clearRect(
                0,
                0,
                this.width,
                this.height
            );

            for (
                const particle of
                this.particles
            ) {

                particle.y -=
                    particle.speed;

                particle.x +=
                    particle.drift;

                if (
                    particle.y <
                    -10
                ) {
                    particle.y =
                        this.height + 10;
                }

                if (
                    particle.x <
                    -10
                ) {
                    particle.x =
                        this.width + 10;
                }

                if (
                    particle.x >
                    this.width + 10
                ) {
                    particle.x =
                        -10;
                }

                this.ctx.beginPath();

                this.ctx.arc(
                    particle.x,
                    particle.y,
                    particle.radius,
                    0,
                    Math.PI * 2
                );

                this.ctx.fillStyle =
                    `rgba(71,221,255,${particle.alpha})`;

                this.ctx.fill();
            }

            if (this.running) this.frame = requestAnimationFrame(this.animate);
        }
    }

    if (
        particleCanvas &&
        !reducedMotion
    ) {
        new ParticleEngine(
            particleCanvas
        );
    }


    /* =========================================================
       21 — GALAXY ENGINE
       ========================================================= */

    class GalaxyEngine {

        constructor(canvas) {

            this.canvas =
                canvas;

            this.ctx =
                canvas.getContext(
                    "2d"
                );

            this.width =
                0;

            this.height =
                0;

            this.dpr =
                1;

            this.stars =
                [];

            this.resize =
                this.resize.bind(this);

            this.animate =
                this.animate.bind(this);

            this.init();
        }

        resize() {

            this.dpr =
                Math.min(
                    window.devicePixelRatio ||
                        1,
                    1.4
                );

            this.width =
                window.innerWidth;

            this.height =
                window.innerHeight;

            this.canvas.width =
                this.width *
                this.dpr;

            this.canvas.height =
                this.height *
                this.dpr;

            this.canvas.style.width =
                `${this.width}px`;

            this.canvas.style.height =
                `${this.height}px`;

            this.ctx.setTransform(
                this.dpr,
                0,
                0,
                this.dpr,
                0,
                0
            );
        }

        createStars() {

            const mobile =
                window.innerWidth < 800;

            const count =
                mobile
                    ? 90
                    : 220;

            this.stars =
                [];

            for (
                let i = 0;
                i < count;
                i++
            ) {

                this.stars.push({

                    x:
                        Math.random() *
                        this.width,

                    y:
                        Math.random() *
                        this.height,

                    size:
                        Math.random() *
                        1.1 +
                        0.1,

                    speed:
                        Math.random() *
                        0.045 +
                        0.008,

                    phase:
                        Math.random() *
                        Math.PI *
                        2
                });
            }
        }

        init() {

            this.resize();

            this.createStars();

            window.addEventListener(
                "resize",
                () => {

                    this.resize();

                    this.createStars();
                },
                {
                    passive: true
                }
            );

            this.running = false;
            this.setRunning = shouldRun => {
                if (this.running === shouldRun) return;
                this.running = shouldRun;
                if (shouldRun) this.frame = requestAnimationFrame(this.animate);
                else cancelAnimationFrame(this.frame);
            };
            document.addEventListener("visibilitychange", () => this.setRunning(!document.hidden));
            this.setRunning(!document.hidden);
        }

        animate(time) {

            this.ctx.clearRect(
                0,
                0,
                this.width,
                this.height
            );

            for (
                const star of
                this.stars
            ) {

                star.y +=
                    star.speed;

                if (
                    star.y >
                    this.height
                ) {
                    star.y = -2;
                }

                const alpha =
                    0.12 +
                    (
                        Math.sin(
                            time * 0.001 +
                            star.phase
                        ) + 1
                    ) * 0.17;

                this.ctx.beginPath();

                this.ctx.arc(
                    star.x,
                    star.y,
                    star.size,
                    0,
                    Math.PI * 2
                );

                this.ctx.fillStyle =
                    `rgba(185,230,255,${alpha})`;

                this.ctx.fill();
            }

            if (this.running) this.frame = requestAnimationFrame(this.animate);
        }
    }

    if (
        galaxyCanvas &&
        !reducedMotion
    ) {
        new GalaxyEngine(
            galaxyCanvas
        );
    }


    /* =========================================================
       22 — TERMINAL ENGINE
       ========================================================= */

    const terminalCommands = {

        help: `
AVAILABLE COMMANDS
────────────────────────────────
help       Show command list
whoami     Developer identity
about      Developer profile
skills     Technology architecture
projects   Project matrix
contact    Contact channels
status     System diagnostics
date       Current system date
clear      Clear terminal
        `,

        whoami: `
UMMAR FAROOQ
DIGITAL ARCHITECT
FULL STACK DEVELOPER
AI / AUTOMATION / SYSTEMS
        `,

        about: `
Developer focused on full-stack
engineering, artificial intelligence,
automation, interactive interfaces,
APIs, performance and emerging technology.
        `,

        skills: `
FRONTEND
HTML5 • CSS3 • JavaScript • React

BACKEND
Node.js • Express • REST APIs

PROGRAMMING
Python • Automation • Scripting

DATA
SQL • MongoDB • JSON

AI
LLM • AI APIs • Agents • Automation

CREATIVE
Three.js • WebGL • Canvas • 3D UI

TOOLS
Git • GitHub • CLI • VS Code
        `,

        projects: `
PROJECT MATRIX
────────────────────────────────
01  AI COMMAND CENTER
02  FUTURISTIC PORTFOLIO ENGINE
03  DEVELOPER AUTOMATION CONSOLE
04  INTELLIGENT API ARCHITECTURE
05  SECURE WEB SYSTEM
        `,

        contact: `
EMAIL
ummarfarooq808@gmail.com

PHONE
+91 7973959714

LOCATION
Bangalore, India
        `,

        status: `
SYSTEM DIAGNOSTICS
────────────────────────────────
CORE          ONLINE
INTERFACE     ACTIVE
AI            READY
AUTOMATION    READY
SECURITY      ENABLED
NETWORK       ${navigator.onLine ? "ONLINE" : "OFFLINE"}
WEBGL         ${window.WebGLRenderingContext ? "AVAILABLE" : "UNAVAILABLE"}
        `,

        date: () =>
            new Date().toString()
    };

    function writeTerminal(
        command,
        output
    ) {

        if (!terminalOutput) {
            return;
        }

        const commandLine =
            document.createElement(
                "div"
            );

        commandLine.className =
            "terminal-line";

        commandLine.innerHTML = `
            <span class="terminal-prompt">root@ummar</span>
            <span>$ ${escapeHTML(command)}</span>
        `;

        terminalOutput.appendChild(
            commandLine
        );

        if (output) {

            const result =
                document.createElement(
                    "div"
                );

            result.className =
                "terminal-line";

            const text =
                document.createElement(
                    "span"
                );

            text.style.whiteSpace =
                "pre-wrap";

            text.textContent =
                output;

            result.appendChild(
                text
            );

            terminalOutput.appendChild(
                result
            );
        }

        terminalOutput.scrollTop =
            terminalOutput.scrollHeight;
    }

    function escapeHTML(
        value
    ) {

        return String(
            value ?? ""
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );
    }

    function executeTerminal(
        rawCommand
    ) {

        const command =
            String(
                rawCommand || ""
            )
                .trim()
                .toLowerCase();

        if (!command) {
            return;
        }

        state.terminalHistory.push(
            command
        );

        state.terminalHistoryIndex =
            state.terminalHistory.length;

        if (
            command ===
            "clear"
        ) {

            terminalOutput.innerHTML =
                "";

            return;
        }

        if (
            !Object.prototype
                .hasOwnProperty.call(
                    terminalCommands,
                    command
                )
        ) {

            writeTerminal(
                command,
                `Command not found: ${command}\nType "help" to view available commands.`
            );

            return;
        }

        const value =
            terminalCommands[
                command
            ];

        const output =
            typeof value ===
            "function"
                ? value()
                : value;

        writeTerminal(
            command,
            output
        );
    }

    terminalInput?.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                executeTerminal(
                    terminalInput.value
                );

                terminalInput.value =
                    "";
            }

            if (
                event.key ===
                "ArrowUp"
            ) {

                event.preventDefault();

                if (
                    !state.terminalHistory.length
                ) {
                    return;
                }

                state.terminalHistoryIndex =
                    Math.max(
                        0,
                        state
                            .terminalHistoryIndex -
                            1
                    );

                terminalInput.value =
                    state
                        .terminalHistory[
                            state
                                .terminalHistoryIndex
                        ] || "";
            }

            if (
                event.key ===
                "ArrowDown"
            ) {

                event.preventDefault();

                state.terminalHistoryIndex =
                    Math.min(
                        state
                            .terminalHistory.length,
                        state
                            .terminalHistoryIndex +
                            1
                    );

                terminalInput.value =
                    state
                        .terminalHistory[
                            state
                                .terminalHistoryIndex
                        ] || "";
            }
        }
    );

    $$(
        "[data-terminal-command]"
    ).forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    executeTerminal(
                        button.dataset
                            .terminalCommand ||
                            ""
                    );

                    terminalInput?.focus();
                }
            );
        }
    );


    /* =========================================================
       23 — JARVIS
       ========================================================= */

    function openJarvis() {

        if (!jarvisPanel) {
            return;
        }

        state.jarvisOpen =
            true;

        jarvisPanel.classList.add(
            "is-open"
        );

        jarvisPanel.setAttribute(
            "aria-hidden",
            "false"
        );

        closeMobileMenu();

        setTimeout(
            () => {
                jarvisInput?.focus();
            },
            250
        );
    }

    function closeJarvis() {

        if (!jarvisPanel) {
            return;
        }

        state.jarvisOpen =
            false;

        jarvisPanel.classList.remove(
            "is-open"
        );

        jarvisPanel.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    jarvisButton?.addEventListener(
        "click",
        openJarvis
    );

    jarvisClose?.addEventListener(
        "click",
        closeJarvis
    );

    function addJarvisMessage(
        text,
        sender = "ai"
    ) {

        if (!jarvisOutput) {
            return;
        }

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            `jarvis-message ${sender}`;

        const label =
            document.createElement(
                "span"
            );

        label.className =
            "message-label";

        label.textContent =
            sender === "user"
                ? "YOU"
                : "JARVIS";

        const message =
            document.createElement(
                "p"
            );

        message.textContent =
            text;

        wrapper.appendChild(
            label
        );

        wrapper.appendChild(
            message
        );

        jarvisOutput.appendChild(
            wrapper
        );

        jarvisOutput.scrollTop =
            jarvisOutput.scrollHeight;
    }

    function jarvisThink(
        input
    ) {

        const text =
            String(input || "")
                .trim()
                .toLowerCase();

        if (!text) {
            return "Enter a request and I will process it.";
        }

        if (
            /\b(hello|hi|hey)\b/.test(
                text
            )
        ) {

            return "Hello. JARVIS online. All primary systems are operational.";
        }

        if (
            text.includes("who") ||
            text.includes("ummar") ||
            text.includes("developer")
        ) {

            return "Ummar Farooq is a developer focused on full-stack software, AI, automation, interactive interfaces and future-oriented digital systems.";
        }

        if (
            text.includes("skill") ||
            text.includes("stack") ||
            text.includes("technology")
        ) {

            return "The technology stack covers HTML, CSS, JavaScript, React, Node.js, Express, Python, REST APIs, SQL, MongoDB, Git, AI workflows, Three.js, WebGL and Canvas.";
        }

        if (
            text.includes("project")
        ) {

            return "The Project Lab contains an AI Command Center, Futuristic Portfolio Engine, Developer Automation Console, Intelligent API Architecture and Secure Web System.";
        }

        if (
            text.includes("contact") ||
            text.includes("email") ||
            text.includes("phone")
        ) {

            return "Contact Ummar at ummarfarooq808@gmail.com or +91 7973959714. Bangalore, India.";
        }

        if (
            text.includes("about")
        ) {

            document
                .querySelector(
                    "#about"
                )
                ?.scrollIntoView({
                    behavior:
                        reducedMotion
                            ? "auto"
                            : "smooth"
                });

            return "Opening developer identity and architecture.";
        }

        if (
            text.includes("terminal")
        ) {

            document
                .querySelector(
                    "#terminal"
                )
                ?.scrollIntoView({
                    behavior:
                        reducedMotion
                            ? "auto"
                            : "smooth"
                });

            return "Command terminal located.";
        }

        if (
            text.includes("capabilit")
        ) {

            document
                .querySelector(
                    "#capabilities"
                )
                ?.scrollIntoView({
                    behavior:
                        reducedMotion
                            ? "auto"
                            : "smooth"
                });

            return "Opening engineering capabilities.";
        }

        if (
            text.includes("ai")
        ) {

            document
                .querySelector(
                    "#ai-lab"
                )
                ?.scrollIntoView({
                    behavior:
                        reducedMotion
                            ? "auto"
                            : "smooth"
                });

            return "AI laboratory interface activated.";
        }

        return "Request received. This local JARVIS system can currently answer questions about Ummar, skills, projects, AI, capabilities, terminal and contact.";
    }

    function sendJarvis(
        input
    ) {

        const message =
            String(
                input || ""
            ).trim();

        if (!message) {
            return;
        }

        addJarvisMessage(
            message,
            "user"
        );

        if (jarvisInput) {
            jarvisInput.value =
                "";
        }

        const thinking =
            document.createElement(
                "div"
            );

        thinking.className =
            "jarvis-message ai";

        thinking.innerHTML = `
            <span class="message-label">JARVIS</span>
            <p>Processing...</p>
        `;

        jarvisOutput?.appendChild(
            thinking
        );

        jarvisOutput.scrollTop =
            jarvisOutput.scrollHeight;

        setTimeout(
            () => {

                thinking.remove();

                addJarvisMessage(
                    jarvisThink(
                        message
                    ),
                    "ai"
                );
            },
            reducedMotion
                ? 0
                : 430
        );
    }

    jarvisForm?.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            sendJarvis(
                jarvisInput?.value ||
                ""
            );
        }
    );

    $$(
        "[data-jarvis]"
    ).forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    sendJarvis(
                        button.dataset
                            .jarvis ||
                            ""
                    );
                }
            );
        }
    );


    /* =========================================================
       24 — VOICE CONTROL
       ========================================================= */

    function setupVoice() {

        const Recognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (
            !Recognition ||
            !jarvisButton
        ) {
            return;
        }

        const recognition =
            new Recognition();

        recognition.lang =
            "en-US";

        recognition.interimResults =
            false;

        recognition.maxAlternatives =
            1;

        recognition.onstart = () => {

            state.voice.active =
                true;

            if (aiStatusText) {
                aiStatusText.textContent =
                    "VOICE LISTENING";
            }

            jarvisButton.classList.add(
                "voice-active"
            );

            showToast(
                "Voice command active."
            );
        };

        recognition.onresult =
            event => {

                const speech =
                    event
                        .results[0][0]
                        .transcript
                        .trim();

                const lower =
                    speech.toLowerCase();

                if (
                    lower.includes(
                        "project"
                    )
                ) {

                    document
                        .querySelector(
                            "#projects"
                        )
                        ?.scrollIntoView({
                            behavior:
                                "smooth"
                        });

                    return;
                }

                if (
                    lower.includes(
                        "skill"
                    )
                ) {

                    document
                        .querySelector(
                            "#skills"
                        )
                        ?.scrollIntoView({
                            behavior:
                                "smooth"
                        });

                    return;
                }

                if (
                    lower.includes(
                        "contact"
                    )
                ) {

                    document
                        .querySelector(
                            "#contact"
                        )
                        ?.scrollIntoView({
                            behavior:
                                "smooth"
                        });

                    return;
                }

                if (
                    lower.includes(
                        "terminal"
                    )
                ) {

                    document
                        .querySelector(
                            "#terminal"
                        )
                        ?.scrollIntoView({
                            behavior:
                                "smooth"
                        });

                    return;
                }

                openJarvis();

                sendJarvis(
                    speech
                );
            };

        recognition.onerror = () => {

            showToast(
                "Voice recognition unavailable."
            );
        };

        recognition.onend = () => {

            state.voice.active =
                false;

            if (aiStatusText) {
                aiStatusText.textContent =
                    "AI CORE ONLINE";
            }

            jarvisButton.classList.remove(
                "voice-active"
            );
        };

        state.voice.recognition =
            recognition;

        jarvisButton.addEventListener(
            "dblclick",
            event => {

                event.preventDefault();

                if (
                    state.voice.active
                ) {

                    recognition.stop();

                } else {

                    try {

                        recognition.start();

                    } catch {

                        showToast(
                            "Voice engine is busy."
                        );
                    }
                }
            }
        );
    }

    setupVoice();


    /* =========================================================
       25 — TOAST
       ========================================================= */

    function showToast(
        message
    ) {

        if (
            !toast ||
            !toastMessage
        ) {
            return;
        }

        toastMessage.textContent =
            message;

        toast.classList.add(
            "show"
        );

        clearTimeout(
            state.toastTimer
        );

        state.toastTimer =
            setTimeout(
                () => {
                    toast.classList.remove(
                        "show"
                    );
                },
                3200
            );
    }


    /* =========================================================
       26 — CONTACT FORM
       ========================================================= */

    contactForm?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!formStatus) {
                return;
            }

            const formData =
                new FormData(
                    contactForm
                );

            const payload = {

                name:
                    String(
                        formData.get(
                            "name"
                        ) || ""
                    ).trim(),

                email:
                    String(
                        formData.get(
                            "email"
                        ) || ""
                    ).trim(),

                subject:
                    String(
                        formData.get(
                            "subject"
                        ) || ""
                    ).trim(),

                message:
                    String(
                        formData.get(
                            "message"
                        ) || ""
                    ).trim()
            };

            if (
                !payload.name ||
                !payload.email ||
                !payload.subject ||
                !payload.message
            ) {

                formStatus.textContent =
                    "Please complete all fields.";

                return;
            }

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !emailPattern.test(
                    payload.email
                )
            ) {

                formStatus.textContent =
                    "Enter a valid email address.";

                return;
            }

            const submitButton =
                $(
                    'button[type="submit"]',
                    contactForm
                );

            if (submitButton) {
                submitButton.disabled =
                    true;
            }

            formStatus.textContent =
                "TRANSMITTING...";

            try {

                const response =
                    await fetch(
                        "/api/contact",
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Accept:
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );

                let result = {};

                try {
                    result =
                        await response.json();
                } catch {
                    result = {};
                }

                if (
                    !response.ok
                ) {
                    throw new Error(
                        result.message ||
                        `HTTP ${response.status}`
                    );
                }

                formStatus.textContent =
                    "TRANSMISSION SUCCESSFUL.";

                contactForm.reset();

                showToast(
                    "Message sent successfully."
                );

            } catch (error) {

                console.error(
                    "Contact transmission error:",
                    error
                );

                formStatus.replaceChildren(document.createTextNode("Server unavailable. "));
                const emailLink = document.createElement("a");
                emailLink.href = "mailto:ummarfarooq808@gmail.com";
                emailLink.textContent = "Email directly";
                formStatus.append(emailLink, document.createTextNode("."));

                showToast(
                    "Transmission failed."
                );

            } finally {

                if (submitButton) {
                    submitButton.disabled =
                        false;
                }
            }
        }
    );


    /* =========================================================
       27 — ENERGY TRAIL
       ========================================================= */

    if (
        trailContainer &&
        supportsHover &&
        !coarsePointer &&
        !reducedMotion
    ) {

        let lastTrail =
            0;

        window.addEventListener(
            "pointermove",
            event => {

                const now =
                    performance.now();

                if (
                    now -
                    lastTrail <
                    45
                ) {
                    return;
                }

                lastTrail =
                    now;

                const particle =
                    document.createElement(
                        "span"
                    );

                particle.className =
                    "energy-particle";

                particle.style.left =
                    `${event.clientX}px`;

                particle.style.top =
                    `${event.clientY}px`;

                trailContainer.appendChild(
                    particle
                );

                setTimeout(
                    () => {
                        particle.remove();
                    },
                    850
                );
            },
            {
                passive: true
            }
        );
    }


    /* =========================================================
       28 — ONLINE/OFFLINE
       ========================================================= */

    function updateNetworkStatus() {

        if (!aiStatusText) {
            return;
        }

        aiStatusText.textContent =
            navigator.onLine
                ? "AI CORE ONLINE"
                : "NETWORK OFFLINE";
    }

    window.addEventListener(
        "online",
        () => {

            updateNetworkStatus();

            showToast(
                "Network restored."
            );
        }
    );

    window.addEventListener(
        "offline",
        () => {

            updateNetworkStatus();

            showToast(
                "Network connection lost."
            );
        }
    );

    updateNetworkStatus();


    /* =========================================================
       29 — KEYBOARD CONTROL
       ========================================================= */

    document.addEventListener(
        "keydown",
        event => {

            const element =
                event.target;

            const typing =
                element instanceof
                    HTMLInputElement ||
                element instanceof
                    HTMLTextAreaElement;

            if (
                event.key ===
                "Escape"
            ) {

                closeMobileMenu();

                if (
                    state.jarvisOpen
                ) {
                    closeJarvis();
                }

                return;
            }

            if (typing) {
                return;
            }

            if (
                event.key.toLowerCase() ===
                "j"
            ) {

                event.preventDefault();

                state.jarvisOpen
                    ? closeJarvis()
                    : openJarvis();

                return;
            }

            if (
                event.key ===
                "/"
            ) {

                event.preventDefault();

                document
                    .querySelector(
                        "#terminal"
                    )
                    ?.scrollIntoView({
                        behavior:
                            reducedMotion
                                ? "auto"
                                : "smooth"
                    });

                setTimeout(
                    () => {
                        terminalInput?.focus();
                    },
                    350
                );
            }
        }
    );


    /* =========================================================
       30 — FORM FIELD STATES
       ========================================================= */

    $$(
        ".form-field input, .form-field textarea"
    ).forEach(
        field => {

            field.addEventListener(
                "focus",
                () => {
                    field.closest(
                        ".form-field"
                    )?.classList.add(
                        "is-focused"
                    );
                }
            );

            field.addEventListener(
                "blur",
                () => {
                    field.closest(
                        ".form-field"
                    )?.classList.remove(
                        "is-focused"
                    );
                }
            );
        }
    );


    /* =========================================================
       31 — THREE.JS 3D EARTH
       ========================================================= */

    async function initializeEarth() {

        if (
            !earthCanvas ||
            reducedMotion ||
            !window.WebGLRenderingContext ||
            state.three.active
        ) {
            return;
        }

        try {

            const THREE =
                await import(
                    "https://unpkg.com/three@0.162.0/build/three.module.js"
                );

            state.three.loaded =
                true;

            const scene =
                new THREE.Scene();

            const camera =
                new THREE.PerspectiveCamera(
                    38,
                    1,
                    0.1,
                    100
                );

            camera.position.z =
                3.1;

            const renderer =
                new THREE.WebGLRenderer({
                    canvas:
                        earthCanvas,

                    alpha:
                        true,

                    antialias:
                        window.devicePixelRatio <
                        1.5,

                    powerPreference:
                        "high-performance"
                });

            renderer.setPixelRatio(
                Math.min(
                    window.devicePixelRatio ||
                        1,
                    1.35
                )
            );

            renderer.outputColorSpace =
                THREE.SRGBColorSpace;

            const group =
                new THREE.Group();

            scene.add(
                group
            );


            /* EARTH WIREFRAME */

            const earthGeometry =
                new THREE.SphereGeometry(
                    1,
                    80,
                    80
                );

            const earthMaterial =
                new THREE.MeshBasicMaterial({
                    color:
                        0x07516b,

                    wireframe:
                        true,

                    transparent:
                        true,

                    opacity:
                        0.82
                });

            const earth =
                new THREE.Mesh(
                    earthGeometry,
                    earthMaterial
                );

            group.add(
                earth
            );


            /* INNER CORE */

            const innerGeometry =
                new THREE.SphereGeometry(
                    0.91,
                    48,
                    48
                );

            const innerMaterial =
                new THREE.MeshBasicMaterial({
                    color:
                        0x001924,

                    transparent:
                        true,

                    opacity:
                        0.33
                });

            const innerEarth =
                new THREE.Mesh(
                    innerGeometry,
                    innerMaterial
                );

            group.add(
                innerEarth
            );


            /* ATMOSPHERE */

            const atmosphereGeometry =
                new THREE.SphereGeometry(
                    1.08,
                    48,
                    48
                );

            const atmosphereMaterial =
                new THREE.MeshBasicMaterial({
                    color:
                        0x00bfff,

                    transparent:
                        true,

                    opacity:
                        0.065,

                    side:
                        THREE.BackSide
                });

            const atmosphere =
                new THREE.Mesh(
                    atmosphereGeometry,
                    atmosphereMaterial
                );

            group.add(
                atmosphere
            );


            /* ORBIT A */

            const ringGeometry =
                new THREE.TorusGeometry(
                    1.28,
                    0.004,
                    8,
                    160
                );

            const ringMaterial =
                new THREE.MeshBasicMaterial({
                    color:
                        0x00bfff,

                    transparent:
                        true,

                    opacity:
                        0.25
                });

            const ringA =
                new THREE.Mesh(
                    ringGeometry,
                    ringMaterial
                );

            ringA.rotation.x =
                Math.PI *
                0.58;

            ringA.rotation.z =
                Math.PI *
                0.12;

            group.add(
                ringA
            );


            /* ORBIT B */

            const ringB =
                new THREE.Mesh(
                    ringGeometry.clone(),
                    ringMaterial.clone()
                );

            ringB.scale.set(
                1.16,
                1.16,
                1.16
            );

            ringB.rotation.x =
                Math.PI *
                0.34;

            ringB.rotation.y =
                Math.PI *
                0.42;

            group.add(
                ringB
            );


            /* DATA POINTS */

            const pointCount =
                window.innerWidth < 800
                    ? 160
                    : 420;

            const positions =
                new Float32Array(
                    pointCount *
                    3
                );

            for (
                let i = 0;
                i < pointCount;
                i++
            ) {

                const theta =
                    Math.random() *
                    Math.PI *
                    2;

                const phi =
                    Math.acos(
                        2 *
                        Math.random() -
                        1
                    );

                const radius =
                    1.13 +
                    Math.random() *
                    0.18;

                positions[
                    i * 3
                ] =
                    radius *
                    Math.sin(phi) *
                    Math.cos(theta);

                positions[
                    i * 3 + 1
                ] =
                    radius *
                    Math.cos(phi);

                positions[
                    i * 3 + 2
                ] =
                    radius *
                    Math.sin(phi) *
                    Math.sin(theta);
            }

            const pointGeometry =
                new THREE.BufferGeometry();

            pointGeometry.setAttribute(
                "position",
                new THREE.BufferAttribute(
                    positions,
                    3
                )
            );

            const pointMaterial =
                new THREE.PointsMaterial({
                    color:
                        0x47ddff,

                    size:
                        window.innerWidth <
                        800
                            ? 0.015
                            : 0.01,

                    transparent:
                        true,

                    opacity:
                        0.65,

                    sizeAttenuation:
                        true
                });

            const points =
                new THREE.Points(
                    pointGeometry,
                    pointMaterial
                );

            group.add(
                points
            );


            /* CENTRAL GLOW */

            const glowGeometry =
                new THREE.SphereGeometry(
                    0.2,
                    24,
                    24
                );

            const glowMaterial =
                new THREE.MeshBasicMaterial({
                    color:
                        0x00bfff,

                    transparent:
                        true,

                    opacity:
                        0.13
                });

            const glow =
                new THREE.Mesh(
                    glowGeometry,
                    glowMaterial
                );

            group.add(
                glow
            );


            /* RESIZE */

            function resize() {

                const parent =
                    earthCanvas.parentElement;

                if (!parent) {
                    return;
                }

                const rect =
                    parent.getBoundingClientRect();

                const width =
                    Math.max(
                        1,
                        rect.width
                    );

                const height =
                    Math.max(
                        1,
                        rect.height
                    );

                camera.aspect =
                    width / height;

                camera.updateProjectionMatrix();

                renderer.setSize(
                    width,
                    height,
                    false
                );
            }

            resize();

            window.addEventListener(
                "resize",
                resize,
                {
                    passive: true
                }
            );


            /* POINTER ROTATION */

            let targetX = 0;
            let targetY = 0;

            if (!coarsePointer) {

                window.addEventListener(
                    "pointermove",
                    event => {

                        targetY =
                            (
                                event.clientX /
                                window.innerWidth -
                                0.5
                            ) * 0.45;

                        targetX =
                            (
                                event.clientY /
                                window.innerHeight -
                                0.5
                            ) * 0.24;
                    },
                    {
                        passive: true
                    }
                );
            }


            /* ANIMATION */

            let time = 0;

            function animate() {

                if (document.hidden) {
                    state.three.animationFrame = null;
                    return;
                }

                time +=
                    0.004;

                group.rotation.y +=
                    (
                        targetY -
                        group.rotation.y
                    ) * 0.025;

                group.rotation.x +=
                    (
                        targetX -
                        group.rotation.x
                    ) * 0.025;

                earth.rotation.y +=
                    0.0013;

                innerEarth.rotation.y -=
                    0.0004;

                atmosphere.rotation.y +=
                    0.0003;

                ringA.rotation.z +=
                    0.0013;

                ringB.rotation.z -=
                    0.0009;

                points.rotation.y +=
                    0.0006;

                const pulse =
                    1 +
                    Math.sin(
                        time * 1.4
                    ) *
                    0.05;

                glow.scale.set(
                    pulse,
                    pulse,
                    pulse
                );

                renderer.render(
                    scene,
                    camera
                );

                state.three.animationFrame =
                    requestAnimationFrame(
                        animate
                    );
            }

            state.three.scene =
                scene;

            state.three.camera =
                camera;

            state.three.renderer =
                renderer;

            state.three.group =
                group;

            state.three.earth =
                earth;

            state.three.innerEarth =
                innerEarth;

            state.three.atmosphere =
                atmosphere;

            state.three.ringA =
                ringA;

            state.three.ringB =
                ringB;

            state.three.points =
                points;

            state.three.glow =
                glow;

            state.three.active =
                true;

            state.three.animate = animate;

            animate();

        } catch (error) {

            console.warn(
                "Three.js could not initialize:",
                error
            );

            if (aiStatusText) {
                aiStatusText.textContent =
                    "AI CORE ONLINE";
            }
        }
    }


    /* =========================================================
       32 — LOAD THREE.JS AFTER PAGE IS READY
       ========================================================= */

    if (earthCanvas && !reducedMotion && "IntersectionObserver" in window) {
        const earthObserver = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            earthObserver.disconnect();
            initializeEarth();
        }, { rootMargin: "180px" });
        earthObserver.observe(earthCanvas);
    }


    /* =========================================================
       33 — RESPONSIVE CLEANUP
       ========================================================= */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth >
                980
            ) {
                closeMobileMenu();
            }
        },
        {
            passive: true
        }
    );


    /* =========================================================
       34 — VISIBILITY OPTIMIZATION
       ========================================================= */

    document.addEventListener("visibilitychange", () => {
        if (document.hidden && state.three.animationFrame) {
            cancelAnimationFrame(state.three.animationFrame);
            state.three.animationFrame = null;
        } else if (!document.hidden && state.three.active && !state.three.animationFrame) {
            state.three.animate?.();
        }
    });


    /* =========================================================
       35 — IMAGE OPTIMIZATION
       ========================================================= */

    $$("img").forEach(
        image => {

            if (!image.hasAttribute(
                "decoding"
            )) {
                image.setAttribute(
                    "decoding",
                    "async"
                );
            }

            if (
                !image.hasAttribute(
                    "loading"
                ) &&
                !image.classList.contains(
                    "profile-image"
                )
            ) {
                image.setAttribute(
                    "loading",
                    "lazy"
                );
            }
        }
    );


    /* =========================================================
       36 — INITIALIZE
       ========================================================= */

    runBootSequence();

    console.log(
        "%c UMMAR FAROOQ ",
        "background:#00bfff;color:#001018;font-size:16px;font-weight:900;padding:8px 12px;border-radius:6px;"
    );

    console.log(
        "%c DIGITAL CORE — ONLINE ",
        "color:#00ff9d;font-weight:900;"
    );

    console.log(
        "%c J = JARVIS   / = TERMINAL   DOUBLE-CLICK JARVIS = VOICE ",
        "color:#47ddff;font-weight:700;"
    );

})();

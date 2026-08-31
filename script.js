"use strict";


/* ==========================================================
   UMMAR FAROOQ — FUTURE PORTFOLIO ENGINE
   ========================================================== */


document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* ==================================================
           ELEMENTS
        ================================================== */

        const body =
            document.body;

        const loader =
            document.getElementById(
                "page-loader"
            );

        const header =
            document.querySelector(
                ".site-header"
            );

        const sections =
            document.querySelectorAll(
                "main section[id]"
            );

        const navLinks =
            document.querySelectorAll(
                ".nav-item"
            );

        const mobileMenu =
            document.querySelector(
                ".mobile-menu"
            );

        const menuToggle =
            document.querySelector(
                ".menu-toggle"
            );

        const cursorDot =
            document.querySelector(
                ".cursor-dot"
            );

        const cursorOutline =
            document.querySelector(
                ".cursor-outline"
            );


        /* ==================================================
           PAGE LOADER
        ================================================== */

        window.addEventListener(
            "load",
            () => {

                setTimeout(
                    () => {

                        loader?.classList.add(
                            "loaded"
                        );

                        body.classList.remove(
                            "loading"
                        );

                    },
                    500
                );

            }
        );


        /* ==================================================
           SMOOTH SCROLL
        ================================================== */

        const scrollToTarget = (
            selector
        ) => {

            const target =
                document.querySelector(
                    selector
                );

            if (!target) return;

            const headerHeight =
                header?.offsetHeight || 0;

            const position =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight;

            window.scrollTo({

                top:
                    Math.max(
                        0,
                        position
                    ),

                behavior:
                    "smooth"

            });

        };


        document.querySelectorAll(
            'a[href^="#"]'
        ).forEach(
            link => {

                link.addEventListener(
                    "click",
                    event => {

                        const target =
                            link.getAttribute(
                                "href"
                            );

                        if (
                            !target ||
                            target === "#"
                        ) {
                            return;
                        }

                        if (
                            document.querySelector(
                                target
                            )
                        ) {

                            event.preventDefault();

                            scrollToTarget(
                                target
                            );

                        }

                    }
                );

            }
        );


        /* ==================================================
           MOBILE MENU
        ================================================== */

        const closeMobileMenu = () => {

            mobileMenu?.classList.remove(
                "open"
            );

            menuToggle?.setAttribute(
                "aria-expanded",
                "false"
            );

        };


        menuToggle?.addEventListener(
            "click",
            () => {

                const isOpen =
                    mobileMenu?.classList.toggle(
                        "open"
                    );

                menuToggle.setAttribute(
                    "aria-expanded",
                    String(Boolean(isOpen))
                );

            }
        );


        mobileMenu?.querySelectorAll(
            "a"
        ).forEach(
            link => {

                link.addEventListener(
                    "click",
                    closeMobileMenu
                );

            }
        );


        /* ==================================================
           ACTIVE NAVIGATION
        ================================================== */

        if (
            "IntersectionObserver"
            in window
        ) {

            const sectionObserver =
                new IntersectionObserver(
                    entries => {

                        entries.forEach(
                            entry => {

                                if (
                                    !entry.isIntersecting
                                ) {
                                    return;
                                }

                                const id =
                                    entry.target.id;

                                navLinks.forEach(
                                    link => {

                                        const active =
                                            link.getAttribute(
                                                "href"
                                            ) ===
                                            `#${id}`;

                                        link.classList.toggle(
                                            "active",
                                            active
                                        );

                                    }
                                );

                            }
                        );

                    },
                    {
                        rootMargin:
                            "-40% 0px -50% 0px",

                        threshold:
                            0
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


        /* ==================================================
           HEADER
        ================================================== */

        let lastScroll =
            window.scrollY;

        let headerTicking =
            false;


        const updateHeader =
            () => {

                const current =
                    window.scrollY;


                header?.classList.toggle(
                    "is-scrolled",
                    current > 30
                );


                if (
                    current > 150 &&
                    current > lastScroll
                ) {

                    header?.classList.add(
                        "header-hidden"
                    );

                } else {

                    header?.classList.remove(
                        "header-hidden"
                    );

                }


                lastScroll =
                    current;

                headerTicking =
                    false;

            };


        window.addEventListener(
            "scroll",
            () => {

                if (
                    !headerTicking
                ) {

                    requestAnimationFrame(
                        updateHeader
                    );

                    headerTicking =
                        true;

                }

            },
            {
                passive: true
            }
        );


        /* ==================================================
           REVEAL ANIMATIONS
        ================================================== */

        const revealElements =
            document.querySelectorAll(
                ".reveal"
            );


        if (
            "IntersectionObserver"
            in window
        ) {

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

                                entry.target.classList.add(
                                    "reveal-visible"
                                );

                                revealObserver.unobserve(
                                    entry.target
                                );

                            }
                        );

                    },
                    {
                        threshold:
                            0.12,

                        rootMargin:
                            "0px 0px -40px 0px"
                    }
                );


            revealElements.forEach(
                element => {

                    revealObserver.observe(
                        element
                    );

                }
            );

        } else {

            revealElements.forEach(
                element => {

                    element.classList.add(
                        "reveal-visible"
                    );

                }
            );

        }


        /* ==================================================
           SKILL BAR ANIMATION
        ================================================== */

        const progressBars =
            document.querySelectorAll(
                "progress"
            );


        const animateProgress =
            element => {

                const target =
                    Number(
                        element.value
                    );

                if (
                    Number.isNaN(
                        target
                    )
                ) {
                    return;
                }


                element.value =
                    0;


                const duration =
                    1200;

                const start =
                    performance.now();


                const frame =
                    now => {

                        const elapsed =
                            now - start;

                        const progress =
                            Math.min(
                                elapsed /
                                duration,
                                1
                            );


                        const eased =
                            1 -
                            Math.pow(
                                1 - progress,
                                3
                            );


                        element.value =
                            target *
                            eased;


                        if (
                            progress < 1
                        ) {

                            requestAnimationFrame(
                                frame
                            );

                        } else {

                            element.value =
                                target;

                        }

                    };


                requestAnimationFrame(
                    frame
                );

            };


        if (
            "IntersectionObserver"
            in window
        ) {

            const skillObserver =
                new IntersectionObserver(
                    entries => {

                        entries.forEach(
                            entry => {

                                if (
                                    !entry.isIntersecting
                                ) {
                                    return;
                                }

                                animateProgress(
                                    entry.target
                                );

                                skillObserver.unobserve(
                                    entry.target
                                );

                            }
                        );

                    },
                    {
                        threshold:
                            0.5
                    }
                );


            progressBars.forEach(
                bar => {

                    skillObserver.observe(
                        bar
                    );

                }
            );

        }


        /* ==================================================
           CUSTOM CURSOR
        ================================================== */

        const desktopCursor =
            window.matchMedia(
                "(pointer: fine)"
            ).matches;


        if (
            desktopCursor &&
            cursorDot &&
            cursorOutline
        ) {

            let mouseX = 0;
            let mouseY = 0;

            let outlineX = 0;
            let outlineY = 0;


            document.addEventListener(
                "mousemove",
                event => {

                    mouseX =
                        event.clientX;

                    mouseY =
                        event.clientY;


                    cursorDot.style.left =
                        `${mouseX}px`;

                    cursorDot.style.top =
                        `${mouseY}px`;

                }
            );


            const animateCursor =
                () => {

                    outlineX +=
                        (
                            mouseX -
                            outlineX
                        ) * 0.15;

                    outlineY +=
                        (
                            mouseY -
                            outlineY
                        ) * 0.15;


                    cursorOutline.style.left =
                        `${outlineX}px`;

                    cursorOutline.style.top =
                        `${outlineY}px`;


                    requestAnimationFrame(
                        animateCursor
                    );

                };


            animateCursor();


            const interactiveElements =
                document.querySelectorAll(
                    "a, button, .skill-card, .project-card"
                );


            interactiveElements.forEach(
                element => {

                    element.addEventListener(
                        "mouseenter",
                        () => {

                            cursorOutline.style.width =
                                "60px";

                            cursorOutline.style.height =
                                "60px";

                        }
                    );


                    element.addEventListener(
                        "mouseleave",
                        () => {

                            cursorOutline.style.width =
                                "35px";

                            cursorOutline.style.height =
                                "35px";

                        }
                    );

                }
            );

        }


        /* ==================================================
           MAGNETIC BUTTONS
        ================================================== */

        if (desktopCursor) {

            document.querySelectorAll(
                ".magnetic"
            ).forEach(
                element => {

                    element.addEventListener(
                        "mousemove",
                        event => {

                            const rect =
                                element.getBoundingClientRect();

                            const x =
                                event.clientX -
                                rect.left -
                                rect.width / 2;

                            const y =
                                event.clientY -
                                rect.top -
                                rect.height / 2;


                            element.style.transform =
                                `translate(${x * 0.12}px, ${y * 0.12}px)`;

                        }
                    );


                    element.addEventListener(
                        "mouseleave",
                        () => {

                            element.style.transform =
                                "";

                        }
                    );

                }
            );

        }


        /* ==================================================
           HERO PARALLAX
        ================================================== */

        const hero =
            document.querySelector(
                ".hero-section"
            );

        const heroContent =
            document.querySelector(
                ".hero-content"
            );


        const reducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;


        if (
            hero &&
            heroContent &&
            !reducedMotion
        ) {

            let parallaxTicking =
                false;


            window.addEventListener(
                "scroll",
                () => {

                    if (
                        parallaxTicking
                    ) {
                        return;
                    }


                    requestAnimationFrame(
                        () => {

                            const scroll =
                                window.scrollY;

                            const heroHeight =
                                hero.offsetHeight;


                            if (
                                scroll <=
                                heroHeight
                            ) {

                                heroContent.style.transform =
                                    `translate3d(0, ${scroll * 0.08}px, 0)`;

                            }


                            parallaxTicking =
                                false;

                        }
                    );


                    parallaxTicking =
                        true;

                },
                {
                    passive: true
                }
            );

        }


        /* ==================================================
           ESCAPE KEY
        ================================================== */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape"
                ) {

                    closeMobileMenu();

                }

            }
        );


        /* ==================================================
           RESIZE
        ================================================== */

        window.addEventListener(
            "resize",
            () => {

                if (
                    window.innerWidth >
                    900
                ) {

                    closeMobileMenu();

                }

            }
        );


        /* ==================================================
           CONSOLE
        ================================================== */

        console.log(
            "%c🚀 Ummar Farooq Portfolio",
            "font-size:18px;font-weight:bold;"
        );

        console.log(
            "%cFull Stack Developer • Future Builder",
            "font-size:12px;"
        );


    }
);
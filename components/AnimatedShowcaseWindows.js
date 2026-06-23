(function () {
    function initAnimatedShowcaseWindows() {
        const section = document.querySelector("[data-showcase-windows]");
        if (!section) return;

        const windows = {
            first: section.querySelector('[data-showcase-window="1"]'),
            second: section.querySelector('[data-showcase-window="2"]'),
            third: section.querySelector('[data-showcase-window="3"]'),
            fourth: section.querySelector('[data-showcase-window="4"]')
        };

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            section.classList.add("showcase-no-motion");
            return;
        }

        if (!window.gsap || !window.ScrollTrigger) {
            initNativeScrollShowcase(section, windows);
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        const ease = "expo.out";
        const media = gsap.matchMedia();

        media.add("(min-width: 769px)", function () {
            const timeline = gsap.timeline({
                defaults: { ease: ease },
                scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.32
                }
            });

            timeline
                .fromTo(windows.first, {
                    xPercent: -26,
                    yPercent: 5,
                    rotate: -6,
                    opacity: 0
                }, {
                    xPercent: 0,
                    yPercent: 0,
                    rotate: -3,
                    opacity: 1,
                    duration: 0.34
                }, 0.02)
                .fromTo(windows.second, {
                    xPercent: 26,
                    yPercent: 6,
                    rotate: 6,
                    opacity: 0
                }, {
                    xPercent: 0,
                    yPercent: 0,
                    rotate: 3,
                    opacity: 1,
                    duration: 0.34
                }, 0.06)
                .fromTo(windows.third, {
                    yPercent: 26,
                    scale: 0.95,
                    rotate: 1.5,
                    opacity: 0
                }, {
                    yPercent: 0,
                    scale: 1,
                    rotate: -1,
                    opacity: 1,
                    duration: 0.36
                }, 0.1)
                .fromTo(windows.fourth, {
                    yPercent: 28,
                    scale: 0.98,
                    rotate: 0,
                    opacity: 0
                }, {
                    yPercent: -18,
                    scale: 1,
                    rotate: 2,
                    opacity: 1,
                    duration: 0.42
                }, 0.08);
        });

        media.add("(max-width: 768px)", function () {
            gsap.set(Object.values(windows), { opacity: 0, y: 22, rotate: 0, scale: 0.99 });

            Object.values(windows).forEach(function (windowEl, index) {
                gsap.to(windowEl, {
                    opacity: 1,
                    y: index === 3 ? -10 : 0,
                    scale: 1,
                    duration: 0.46,
                    ease: ease,
                    scrollTrigger: {
                        trigger: windowEl,
                        start: "top 90%",
                        end: "top 58%",
                        scrub: 0.28
                    }
                });
            });
        });
    }

    function initNativeScrollShowcase(section, windows) {
        const windowList = Object.values(windows);
        let ticking = false;

        const clamp = function (value) {
            return Math.max(0, Math.min(1, value));
        };

        const ease = function (value) {
            const t = clamp(value);
            return t * t * (3 - (2 * t));
        };

        const interpolate = function (from, to, progress) {
            return from + ((to - from) * progress);
        };

        const applyTransform = function (element, state) {
            element.style.opacity = String(state.opacity);
            element.style.transform = [
                "translate3d(" + state.x + "%, " + state.y + "%, 0)",
                "rotate(" + state.rotate + "deg)",
                "scale(" + state.scale + ")"
            ].join(" ");
        };

        const renderDesktop = function () {
            const rect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height));
            const p1 = ease((progress - 0.04) / 0.32);
            const p2 = ease((progress - 0.08) / 0.32);
            const p3 = ease((progress - 0.12) / 0.34);
            const p4 = ease((progress - 0.1) / 0.38);

            applyTransform(windows.first, {
                x: interpolate(-26, 0, p1),
                y: interpolate(5, 0, p1),
                rotate: interpolate(-6, -3, p1),
                scale: 1,
                opacity: p1
            });
            applyTransform(windows.second, {
                x: interpolate(26, 0, p2),
                y: interpolate(6, 0, p2),
                rotate: interpolate(6, 3, p2),
                scale: 1,
                opacity: p2
            });
            applyTransform(windows.third, {
                x: 0,
                y: interpolate(26, 0, p3),
                rotate: interpolate(1.5, -1, p3),
                scale: interpolate(0.95, 1, p3),
                opacity: p3
            });
            applyTransform(windows.fourth, {
                x: 0,
                y: interpolate(28, -18, p4),
                rotate: interpolate(0, 2, p4),
                scale: interpolate(0.98, 1, p4),
                opacity: p4
            });
        };

        const renderMobile = function () {
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

            windowList.forEach(function (element, index) {
                const rect = element.getBoundingClientRect();
                const start = viewportHeight * 0.9;
                const end = viewportHeight * 0.58;
                const progress = ease((start - rect.top) / (start - end));

                applyTransform(element, {
                    x: 0,
                    y: interpolate(22, index === 3 ? -10 : 0, progress),
                    rotate: 0,
                    scale: interpolate(0.98, 1, progress),
                    opacity: progress
                });
            });
        };

        const render = function () {
            ticking = false;
            if (window.matchMedia("(max-width: 768px)").matches) {
                renderMobile();
            } else {
                renderDesktop();
            }
        };

        const requestRender = function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(render);
        };

        window.addEventListener("scroll", requestRender, { passive: true });
        window.addEventListener("resize", requestRender);
        requestRender();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAnimatedShowcaseWindows);
    } else {
        initAnimatedShowcaseWindows();
    }
}());

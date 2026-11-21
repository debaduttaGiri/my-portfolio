
function setActiveNavigation(targetId) {
    document.querySelectorAll(".nav-links a").forEach(link => {
        const isActive = link.getAttribute("href") === targetId;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "page");

            // Keep the active item visible in the horizontal navbar
            if (window.innerWidth <= 768) {
                link.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center"
                });
            }
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

/* ========================================
   COMPONENT LOADING
======================================== */

async function loadComponent(elementId, filePath, append = false) {
    const response = await fetch(filePath);

    if (!response.ok) {
        throw new Error(`Failed to load ${filePath}: ${response.status}`);
    }

    const html = await response.text();
    const element = document.getElementById(elementId);

    if (!element) {
        throw new Error(`Element #${elementId} not found`);
    }

    if (append) {
        element.insertAdjacentHTML("beforeend", html);
    } else {
        element.innerHTML = html;
    }
}

/* ========================================
   NAVIGATION
======================================== */

function initializeNavigation() {
    const menuButton = document.getElementById("menuButton");
    const navLinksContainer = document.querySelector(".nav-links");

    if (!navLinksContainer) return;

    const links = navLinksContainer.querySelectorAll('a[href^="#"]');

    // Mobile menu
    menuButton?.addEventListener("click", () => {
        navLinksContainer.classList.toggle("active");

        const isOpen = navLinksContainer.classList.contains("active");

        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.textContent = isOpen ? "✕" : "☰";
    });

    // Navigation clicks
    links.forEach(link => {
        link.addEventListener("click", event => {
            const targetId = link.getAttribute("href");
            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            const navbar = document.querySelector(".navbar");
            const navbarHeight = navbar?.getBoundingClientRect().height || 0;

            const targetPosition =
                window.scrollY +
                target.getBoundingClientRect().top -
                navbarHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

            history.replaceState(null, "", targetId);

            navLinksContainer.classList.remove("active");

            menuButton?.setAttribute("aria-expanded", "false");

            if (menuButton) {
                menuButton.textContent = "☰";
            }

            setActiveNavigation(targetId);
        });
    });

    // Update active link while scrolling
    function updateActiveNavigation() {
        const sections = document.querySelectorAll("section[id]");
        const navbarHeight =
            document.querySelector(".navbar")?.offsetHeight || 0;

        let currentSection = "#home";

        sections.forEach(section => {
            if (
                section.getBoundingClientRect().top <=
                navbarHeight + 100
            ) {
                currentSection = `#${section.id}`;
            }
        });

        setActiveNavigation(currentSection);
    }

    window.addEventListener("scroll", updateActiveNavigation);
    updateActiveNavigation();
}

function setActiveNavigation(targetId) {
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === targetId
        );
    });
}

/* ========================================
   ROLE TEXT ANIMATION
======================================== */

function startRoleAnimation() {
    const roleText = document.getElementById("roleText");

    if (!roleText) return;

    const roles = [
    "Full Stack .NET Developer",
    "Angular Developer",
    "SQL Server Developer",
    "AWS Cloud Developer"
];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeRole() {
        const currentRole = roles[roleIndex];

        if (!isDeleting) {
            roleText.textContent = currentRole.substring(
                0,
                charIndex + 1
            );

            charIndex++;

            if (charIndex === currentRole.length) {
                isDeleting = true;
                setTimeout(typeRole, 1800);
                return;
            }

            setTimeout(typeRole, 80);
        } else {
            roleText.textContent = currentRole.substring(
                0,
                charIndex - 1
            );

            charIndex--;

            if (charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                setTimeout(typeRole, 300);
                return;
            }

            setTimeout(typeRole, 45);
        }
    }

    typeRole();
}

/* ========================================
   SCROLL REVEAL
======================================== */

function initializeReveal() {
    const elements = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
        elements.forEach(element => {
            element.classList.add("visible");
        });
        return;
    }

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15
        }
    );

    elements.forEach(element => observer.observe(element));
}

/* ========================================
   MAGIC NAME ERASER
======================================== */

function initializeNameErase() {
    const heading = document.getElementById("erasableName");

    if (!heading || heading.dataset.initialized) return;

    heading.dataset.initialized = "true";

    const originalText = heading.textContent.trim();

    let holdTimer;
    let isErasing = false;
    let activePointerId = null;
    let magicCursor = null;

    // Convert name characters into individual spans
    function renderName() {
        heading.innerHTML = [...originalText].map(char => {
            if (char === " ") {
                return '<span class="name-space">&nbsp;</span>';
            }

            return `<span>${char}</span>`;
        }).join("");
    }

    function createCursor() {
        if (magicCursor) return;

        magicCursor = document.createElement("div");
        magicCursor.className = "magic-cursor";

        document.body.appendChild(magicCursor);
    }

    function createParticles(x, y) {
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement("div");

            particle.className = "magic-particle";
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            particle.style.setProperty(
                "--particle-x",
                `${(Math.random() - 0.5) * 90}px`
            );

            particle.style.setProperty(
                "--particle-y",
                `${(Math.random() - 0.5) * 90}px`
            );

            document.body.appendChild(particle);

            particle.addEventListener("animationend", () => {
                particle.remove();
            });
        }
    }

    function stopErasing(event) {
        if (
            activePointerId !== null &&
            event.pointerId !== activePointerId
        ) {
            return;
        }

        clearTimeout(holdTimer);

        isErasing = false;
        activePointerId = null;

        heading.classList.remove("erasing");

        magicCursor?.remove();
        magicCursor = null;
    }

    // Start long press
    heading.addEventListener("pointerdown", event => {
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        activePointerId = event.pointerId;
        isErasing = false;

        holdTimer = setTimeout(() => {
            isErasing = true;
            suppressNextClick = true;
            heading.classList.add("erasing");
            createCursor();
        }, 400);
    });

    // Move eraser and remove letters
    document.addEventListener("pointermove", event => {
        if (!isErasing || event.pointerId !== activePointerId) {
            return;
        }

        if (magicCursor) {
            magicCursor.style.left = `${event.clientX}px`;
            magicCursor.style.top = `${event.clientY}px`;
        }

        const element = document.elementFromPoint(
            event.clientX,
            event.clientY
        );

        const letter = element?.closest(
            "#erasableName span:not(.name-space)"
        );

        if (!letter || letter.classList.contains("erased")) {
            return;
        }

        const rect = letter.getBoundingClientRect();

        letter.style.setProperty(
            "--fly-x",
            `${(Math.random() - 0.5) * 150}px`
        );

        letter.style.setProperty(
            "--fly-y",
            `${(Math.random() - 0.5) * 130 - 40}px`
        );

        letter.style.setProperty(
            "--fly-rotate",
            `${(Math.random() - 0.5) * 100}deg`
        );

        letter.classList.add("erased");

        createParticles(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
        );
    });

    document.addEventListener("pointerup", stopErasing);
    document.addEventListener("pointercancel", stopErasing);

    // Single-click to restore the name
let suppressNextClick = false;

heading.addEventListener("pointerdown", () => {
    suppressNextClick = false;
});

heading.addEventListener("click", () => {
    if (suppressNextClick) {
        suppressNextClick = false;
        return;
    }

    stopErasing({
        pointerId: activePointerId
    });

    renderName();
});

    renderName();
}

/* ========================================
   CONTACT FORM
======================================== */

function initializeContactForm() {
    document.addEventListener("submit", event => {
        if (event.target.id !== "contactForm") return;

        event.preventDefault();

        const name = document.getElementById("contactName").value.trim();
        const email = document.getElementById("contactEmail").value.trim();
        const subject = document.getElementById("contactSubject").value.trim();
        const message = document.getElementById("contactMessage").value.trim();

        const recipient = "debaduttagiridev@gmail.com";

        const body = `Name: ${name}
Email: ${email}

Message:
${message}`;

        const mailto =
            `mailto:${recipient}` +
            `?subject=${encodeURIComponent(subject)}` +
            `&body=${encodeURIComponent(body)}`;

        window.location.href = mailto;
    });
}

/* ========================================
   APPLICATION INITIALIZATION
======================================== */

async function init() {
    try {
        // Load navbar
        await loadComponent("navbar", "components/navbar.html");

        // Load all page sections
        await loadComponent("content", "sections/home.html");
        await loadComponent("content", "sections/about.html", true);
        await loadComponent("content", "sections/skills.html", true);
        await loadComponent("content", "sections/projects.html", true);
        await loadComponent("content", "sections/contact.html", true);

        // Initialize features after HTML is loaded
        initializeNavigation();
        initializeTheme();
        initializeReveal();
        initializeNameErase();
        startRoleAnimation();
        initializeContactForm();
        initializeThanosEffect();

    } catch (error) {
        console.error("Portfolio initialization failed:", error);
    }
}
function initializeTheme() {
    const themeToggle = document.getElementById("themeToggle");

    if (!themeToggle) return;

    const savedTheme = localStorage.getItem("portfolio-theme") || "dark";

    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeButton(savedTheme);

    themeToggle.addEventListener("click", () => {
        const currentTheme =
            document.documentElement.getAttribute("data-theme");

        const newTheme = currentTheme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("portfolio-theme", newTheme);

        updateThemeButton(newTheme);
    });

    function updateThemeButton(theme) {
        themeToggle.textContent = theme === "dark" ? "☀" : "☾";

        themeToggle.setAttribute(
            "aria-label",
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        );

        themeToggle.title =
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    }
}










function initializeThanosEffect() {
    const img = document.getElementById("thanosImage");
    const wrapper = document.querySelector(".image-wrapper");

    if (!img || !wrapper) return;

    if (img.dataset.thanosInitialized === "true") return;
    img.dataset.thanosInitialized = "true";

    const canvas = document.createElement("canvas");
    canvas.id = "thanosCanvas";
    wrapper.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    const DURATION = 12000;
    const PARTICLE_LIFETIME = 9000;
    const GAP = 5;
    const EXTRA_WIND_SPACE = 1100;

    // Soft diagonal transition.
    const FEATHER = 0.045;

    // Preserve the original bottom fade.
    const BOTTOM_FADE_START = 0.65;

    let particles = [];
    let animationFrame = null;
    let startTime = 0;
    let state = "ready";

    let imageWidth = 0;
    let imageHeight = 0;

    // Preserve original inline mask styles.
    const originalInlineMask = img.style.maskImage;
    const originalInlineWebkitMask = img.style.webkitMaskImage;

    const originalInlineMaskComposite = img.style.maskComposite;
    const originalInlineWebkitMaskComposite =
        img.style.webkitMaskComposite;

    const originalInlineMaskSize = img.style.maskSize;
    const originalInlineWebkitMaskSize = img.style.webkitMaskSize;

    const originalInlineMaskRepeat = img.style.maskRepeat;
    const originalInlineWebkitMaskRepeat =
        img.style.webkitMaskRepeat;

    // Capture original CSS masks.
    const originalComputedStyle = getComputedStyle(img);

    const originalComputedMask =
        originalComputedStyle.maskImage !== "none"
            ? originalComputedStyle.maskImage
            : "linear-gradient(black, black)";

    const originalComputedWebkitMask =
        originalComputedStyle.webkitMaskImage !== "none"
            ? originalComputedStyle.webkitMaskImage
            : "linear-gradient(black, black)";

    const originalComputedMaskSize =
        originalComputedStyle.maskSize;

    const originalComputedWebkitMaskSize =
        originalComputedStyle.webkitMaskSize;

    const originalComputedMaskRepeat =
        originalComputedStyle.maskRepeat;

    const originalComputedWebkitMaskRepeat =
        originalComputedStyle.webkitMaskRepeat;

    function splitCssLayers(value) {
        const layers = [];
        let depth = 0;
        let current = "";
        let quote = null;

        for (let i = 0; i < value.length; i++) {
            const char = value[i];

            if (quote) {
                current += char;

                if (char === quote && value[i - 1] !== "\\") {
                    quote = null;
                }

                continue;
            }

            if (char === '"' || char === "'") {
                quote = char;
                current += char;
                continue;
            }

            if (char === "(") depth++;
            if (char === ")") depth--;

            if (char === "," && depth === 0) {
                layers.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }

        if (current.trim()) {
            layers.push(current.trim());
        }

        return layers;
    }

    const maskLayers = splitCssLayers(originalComputedMask);
    const webkitMaskLayers =
        splitCssLayers(originalComputedWebkitMask);

    function repeatOperator(operator, count) {
        return Array(Math.max(1, count))
            .fill(operator)
            .join(", ");
    }

    const maskComposite = repeatOperator(
        "intersect",
        maskLayers.length
    );

    const webkitMaskComposite = repeatOperator(
        "source-in",
        webkitMaskLayers.length
    );

    function setupCanvas() {
        const rect = img.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();

        imageWidth = img.naturalWidth;
        imageHeight = img.naturalHeight;

        if (!imageWidth || !imageHeight || !rect.width) return;

        const scale = imageWidth / rect.width;
        const extraWidth = EXTRA_WIND_SPACE * scale;

        canvas.width = Math.ceil(imageWidth + extraWidth);
        canvas.height = imageHeight;

        canvas.style.position = "absolute";
        canvas.style.display = "none";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "2";

        canvas.style.width =
            `calc(100% + ${EXTRA_WIND_SPACE}px)`;

        canvas.style.height = "100%";

        canvas.style.left =
            `${rect.left - wrapperRect.left}px`;

        canvas.style.top =
            `${rect.top - wrapperRect.top}px`;
    }

    /*
     * Soft diagonal + bottom fade.
     *
     * Top-right = 0
     * Bottom-left = 1
     *
     * The animated SVG now contains an additional
     * bottom fade from 65% to 100%.
     */
    function applySoftMask(progress) {

        if (progress <= 0) {
            restoreOriginalMask();
            return;
        }

        const transparentMask =
            "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))";

        if (progress >= 1) {
            img.style.maskImage =
                `${transparentMask}, ${originalComputedMask}`;

            img.style.webkitMaskImage =
                `${transparentMask}, ${originalComputedWebkitMask}`;

            img.style.maskComposite = maskComposite;
            img.style.webkitMaskComposite = webkitMaskComposite;

            img.style.maskSize =
                `100% 100%, ${originalComputedMaskSize}`;

            img.style.webkitMaskSize =
                `100% 100%, ${originalComputedWebkitMaskSize}`;

            img.style.maskRepeat =
                `no-repeat, ${originalComputedMaskRepeat}`;

            img.style.webkitMaskRepeat =
                `no-repeat, ${originalComputedWebkitMaskRepeat}`;

            return;
        }

        const start = Math.max(0, progress - FEATHER);
        const end = Math.min(1, progress + FEATHER);

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 1000 1000">

                <defs>

                    <!-- Diagonal dissolve gradient -->
                    <linearGradient
                        id="softDissolve"
                        x1="1000"
                        y1="0"
                        x2="0"
                        y2="1000"
                        gradientUnits="userSpaceOnUse">

                        <stop
                            offset="${start * 100}%"
                            stop-color="white"
                            stop-opacity="0"/>

                        <stop
                            offset="${end * 100}%"
                            stop-color="white"
                            stop-opacity="1"/>

                    </linearGradient>

                    <!-- Additional bottom fade -->
                    <linearGradient
                        id="bottomFade"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1000"
                        gradientUnits="userSpaceOnUse">

                        <stop
                            offset="0%"
                            stop-color="white"
                            stop-opacity="1"/>

                        <stop
                            offset="${BOTTOM_FADE_START * 100}%"
                            stop-color="white"
                            stop-opacity="1"/>

                        <stop
                            offset="100%"
                            stop-color="white"
                            stop-opacity="0"/>

                    </linearGradient>

                    <!-- Combine both masks -->
                    <mask id="bottomMask">
                        <rect
                            width="1000"
                            height="1000"
                            fill="url(#bottomFade)"/>
                    </mask>

                </defs>

                <rect
                    width="1000"
                    height="1000"
                    fill="url(#softDissolve)"
                    mask="url(#bottomMask)"/>

            </svg>
        `;

        const animatedMask =
            `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

        // Animated mask + original CSS masks.
        img.style.maskImage =
            `${animatedMask}, ${originalComputedMask}`;

        img.style.webkitMaskImage =
            `${animatedMask}, ${originalComputedWebkitMask}`;

        img.style.maskComposite = maskComposite;
        img.style.webkitMaskComposite = webkitMaskComposite;

        img.style.maskSize =
            `100% 100%, ${originalComputedMaskSize}`;

        img.style.webkitMaskSize =
            `100% 100%, ${originalComputedWebkitMaskSize}`;

        img.style.maskRepeat =
            `no-repeat, ${originalComputedMaskRepeat}`;

        img.style.webkitMaskRepeat =
            `no-repeat, ${originalComputedWebkitMaskRepeat}`;
    }

    function restoreOriginalMask() {
        img.style.maskImage = originalInlineMask;
        img.style.webkitMaskImage = originalInlineWebkitMask;

        img.style.maskComposite = originalInlineMaskComposite;
        img.style.webkitMaskComposite =
            originalInlineWebkitMaskComposite;

        img.style.maskSize = originalInlineMaskSize;
        img.style.webkitMaskSize = originalInlineWebkitMaskSize;

        img.style.maskRepeat = originalInlineMaskRepeat;
        img.style.webkitMaskRepeat = originalInlineWebkitMaskRepeat;
    }

    function createParticles() {
        const tempCanvas = document.createElement("canvas");

        tempCanvas.width = imageWidth;
        tempCanvas.height = imageHeight;

        const tempCtx = tempCanvas.getContext("2d", {
            willReadFrequently: true
        });

        tempCtx.drawImage(
            img,
            0,
            0,
            imageWidth,
            imageHeight
        );

        const imageData = tempCtx.getImageData(
            0,
            0,
            imageWidth,
            imageHeight
        ).data;

        particles = [];

        for (let y = 0; y < imageHeight; y += GAP) {
            for (let x = 0; x < imageWidth; x += GAP) {

                const index = (y * imageWidth + x) * 4;
                const alpha = imageData[index + 3];

                if (alpha < 80) continue;

                const red = imageData[index];
                const green = imageData[index + 1];
                const blue = imageData[index + 2];

                // Top-right = 0, bottom-left = 1.
                const progress =
                    0.5 * (1 - x / imageWidth) +
                    0.5 * (y / imageHeight);

                particles.push({
                    x,
                    y,
                    originX: x,
                    originY: y,
                    progress,

                    color: `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`,

                    size: 1.2 + Math.random() * 2.2,

                    speed: 0.7 + Math.random() * 0.8,
                    phase: Math.random() * Math.PI * 2,
                    turbulence: 5 + Math.random() * 15,

                    rotation: Math.random() * Math.PI,
                    rotationSpeed: (Math.random() - 0.5) * 0.04
                });
            }
        }
    }

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;

        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / DURATION, 1);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        applySoftMask(progress);

        for (const p of particles) {

            const releaseTime = p.progress * DURATION;
            const particleAge = (elapsed - releaseTime) / 1000;

            if (
                particleAge < 0 ||
                particleAge > PARTICLE_LIFETIME / 1000
            ) {
                continue;
            }

            const windX =
                (180 + p.speed * 100) * particleAge +
                55 * particleAge * particleAge;

            const windY =
                -(25 + p.speed * 35) * particleAge -
                5 * particleAge * particleAge;

            const flowX =
                (Math.sin(elapsed * 0.00065 + p.phase) -
                    Math.sin(p.phase)) * p.turbulence * 2;

            const flowY =
                (Math.sin(elapsed * 0.0005 + p.phase * 1.3) -
                    Math.sin(p.phase * 1.3)) * p.turbulence * 1.5;

            const driftX =
                Math.sin(elapsed * 0.0003 + p.phase) *
                particleAge * 8;

            const driftY =
                Math.cos(elapsed * 0.0004 + p.phase) *
                particleAge * 7;

            p.x = p.originX + windX + flowX + driftX;
            p.y = p.originY + windY + flowY + driftY;

            p.rotation += p.rotationSpeed;

            const fade = Math.max(
                0,
                1 - particleAge / (PARTICLE_LIFETIME / 1000)
            );

            const size = p.size * fade;

            if (size <= 0.1) continue;

            ctx.save();

            ctx.globalAlpha = fade;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            ctx.fillStyle = p.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = p.color;

            ctx.fillRect(
                -size / 2,
                -size / 2,
                size,
                size
            );

            ctx.restore();
        }

        if (progress < 1) {
            animationFrame = requestAnimationFrame(animate);
        } else {
            applySoftMask(1);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            canvas.style.display = "none";

            state = "gone";
            animationFrame = null;
        }
    }

    function startDisintegration() {
        if (state === "disintegrating") return;

        if (state === "gone") {
            restoreImage();
            return;
        }

        if (!img.complete || !img.naturalWidth) return;

        state = "disintegrating";

        setupCanvas();

        if (!canvas.width || !canvas.height) {
            state = "ready";
            return;
        }

        createParticles();

        canvas.style.display = "block";

        startTime = 0;

        animationFrame = requestAnimationFrame(animate);
    }

    function restoreImage() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles = [];

        restoreOriginalMask();

        canvas.style.display = "none";

        state = "ready";
        startTime = 0;
    }

    img.addEventListener("click", startDisintegration);

    img.style.cursor = "pointer";

    if (img.complete && img.naturalWidth) {
        setupCanvas();
    } else {
        img.addEventListener("load", setupCanvas, { once: true });
    }
}

document.addEventListener("DOMContentLoaded", initializeThanosEffect);











document.addEventListener("DOMContentLoaded", init);


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

    if (!img || !wrapper || img.dataset.thanosInitialized === "true") return;

    img.dataset.thanosInitialized = "true";

    // ================= CONFIGURATION =================

    const DURATION = 12000;
    const PARTICLE_LIFETIME = 6500;
    const PARTICLE_STEP = 5;

    const UPWARD_MIN = 75;
    const UPWARD_MAX = 220;

    const RIGHT_MIN = 15;
    const RIGHT_MAX = 155;

    const TOP_SPACE = 300;
    const RIGHT_SPACE = 500;
    const BOTTOM_SPACE = 60;

    const RELEASE_VARIATION = 0.12;

    // Must match the CSS bottom fade.
    const BOTTOM_FADE_START = 0.90;

    // =================================================

    const canvas = document.createElement("canvas");
    canvas.id = "thanosCanvas";

    Object.assign(canvas.style, {
        position: "absolute",
        pointerEvents: "none",
        display: "none",
        zIndex: "5",
        maxWidth: "none"
    });

    wrapper.appendChild(canvas);

    const gl = canvas.getContext("webgl2", {
        alpha: true,
        antialias: false,
        premultipliedAlpha: false
    });

    if (!gl) {
        console.error("WebGL2 is not supported.");
        canvas.remove();
        return;
    }

    // Preserve original image masks.
    const originalMask = img.style.maskImage;
    const originalWebkitMask = img.style.webkitMaskImage;
    const originalMaskComposite = img.style.maskComposite;
    const originalWebkitMaskComposite = img.style.webkitMaskComposite;
    const originalMaskSize = img.style.maskSize;
    const originalWebkitMaskSize = img.style.webkitMaskSize;
    const originalMaskRepeat = img.style.maskRepeat;
    const originalWebkitMaskRepeat = img.style.webkitMaskRepeat;

    const computed = getComputedStyle(img);

    const baseMask = computed.maskImage;
    const baseWebkitMask = computed.webkitMaskImage;
    const baseMaskSize = computed.maskSize;
    const baseWebkitMaskSize = computed.webkitMaskSize;
    const baseMaskRepeat = computed.maskRepeat;
    const baseWebkitMaskRepeat = computed.webkitMaskRepeat;

    let program = null;
    let texture = null;
    let buffer = null;

    let particleCount = 0;
    let animationFrame = null;
    let startTime = 0;
    let state = "ready";

    let imageWidth = 0;
    let imageHeight = 0;
    let imageCssWidth = 0;
    let imageCssHeight = 0;
    let dpr = 1;

    const uniforms = {};

    // ================= MASKED SOURCE IMAGE =================

    function createMaskedSourceCanvas() {
        const sourceCanvas = document.createElement("canvas");

        sourceCanvas.width = img.naturalWidth;
        sourceCanvas.height = img.naturalHeight;

        const ctx = sourceCanvas.getContext("2d");

        ctx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
        ctx.drawImage(img, 0, 0);

        // Horizontal fade.
        ctx.globalCompositeOperation = "destination-in";

        const horizontalGradient = ctx.createLinearGradient(
            0, 0,
            sourceCanvas.width, 0
        );

        horizontalGradient.addColorStop(0, "rgba(0,0,0,0)");
        horizontalGradient.addColorStop(0.35, "rgba(0,0,0,1)");
        horizontalGradient.addColorStop(0.65, "rgba(0,0,0,1)");
        horizontalGradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = horizontalGradient;
        ctx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);

        // Bottom fade.
        const verticalGradient = ctx.createLinearGradient(
            0, 0,
            0, sourceCanvas.height
        );

        verticalGradient.addColorStop(0, "rgba(0,0,0,1)");
        verticalGradient.addColorStop(
            BOTTOM_FADE_START,
            "rgba(0,0,0,1)"
        );
        verticalGradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = verticalGradient;
        ctx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);

        ctx.globalCompositeOperation = "source-over";

        return sourceCanvas;
    }

    // ================= VERTEX SHADER =================

    const vertexShaderSource = `#version 300 es
        precision highp float;

        in vec2 a_uv;

        uniform float u_elapsed;
        uniform float u_duration;
        uniform float u_lifetime;

        uniform float u_imageWidth;
        uniform float u_imageHeight;

        uniform float u_canvasWidth;
        uniform float u_canvasHeight;

        uniform float u_topSpace;
        uniform float u_pixelSize;

        uniform float u_upwardMin;
        uniform float u_upwardMax;

        uniform float u_rightMin;
        uniform float u_rightMax;

        uniform float u_releaseVariation;

        out vec2 v_uv;
        out float v_alpha;

        float randomValue(vec2 p) {
            return fract(
                sin(dot(p, vec2(127.1, 311.7))) *
                43758.5453123
            );
        }

        void main() {
            vec2 pixelPosition = floor(
                a_uv * vec2(u_imageWidth, u_imageHeight)
            );

            float random1 = randomValue(pixelPosition);
            float random2 = randomValue(pixelPosition + 17.31);
            float random3 = randomValue(pixelPosition + 43.17);
            float random4 = randomValue(pixelPosition + 91.73);

            // Release from top-right towards bottom-left.
            float releaseProgress =
                0.5 * (1.0 - a_uv.x) +
                0.5 * a_uv.y;

            float releaseJitter =
                (random1 - 0.5) * u_releaseVariation;

            float releaseTime =
                clamp(
                    releaseProgress + releaseJitter,
                    0.0,
                    1.0
                ) * u_duration;

            float age = u_elapsed - releaseTime;

            v_uv = a_uv;

            if (age < 0.0 || age > u_lifetime) {
                gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
                gl_PointSize = 0.0;
                v_alpha = 0.0;
                return;
            }

            // Original position.
            float originalX = a_uv.x * u_imageWidth;
            float originalY = a_uv.y * u_imageHeight;

            float upwardSpeed = mix(
                u_upwardMin,
                u_upwardMax,
                random2
            );

            float rightSpeed = mix(
                u_rightMin,
                u_rightMax,
                random3
            );

            float upwardAcceleration =
                12.0 + random4 * 28.0;

            float horizontalAcceleration =
                4.0 + random1 * 20.0;

            float upward =
                upwardSpeed * age +
                0.5 * upwardAcceleration * age * age;

            float horizontal =
                rightSpeed * age +
                0.5 * horizontalAcceleration * age * age;

            // Airflow turbulence.
            float phase = random1 * 6.28318530718;

            float turbulenceX =
                sin(age * (2.0 + random2 * 2.0) + phase)
                * (5.0 + random3 * 18.0) * age;

            float turbulenceY =
                cos(age * (1.5 + random4 * 2.0) + phase)
                * (3.0 + random1 * 12.0) * age;

            float spreadX =
                (random2 - 0.5) * 22.0 * age;

            float spreadY =
                (random3 - 0.5) * 12.0 * age;

            float x =
                originalX +
                horizontal +
                turbulenceX +
                spreadX;

            float y =
                u_topSpace +
                originalY -
                upward +
                turbulenceY +
                spreadY;

            float ndcX =
                (x / u_canvasWidth) * 2.0 - 1.0;

            float ndcY =
                1.0 - (y / u_canvasHeight) * 2.0;

            gl_Position = vec4(ndcX, ndcY, 0.0, 1.0);

            gl_PointSize = u_pixelSize;

            v_alpha = 1.0 - smoothstep(
                u_lifetime * 0.35,
                u_lifetime,
                age
            );
        }
    `;

    // ================= FRAGMENT SHADER =================

    const fragmentShaderSource = `#version 300 es
        precision highp float;

        uniform sampler2D u_image;

        in vec2 v_uv;
        in float v_alpha;

        out vec4 outColor;

        void main() {
            vec2 point = gl_PointCoord - vec2(0.5);

            float distanceFromCenter = length(point);

            float circleAlpha =
                1.0 - smoothstep(0.28, 0.5, distanceFromCenter);

            if (circleAlpha <= 0.01) discard;

            vec4 color = texture(
                u_image,
                vec2(v_uv.x, 1.0 - v_uv.y)
            );

            if (color.a < 0.01) discard;

            outColor = vec4(
                color.rgb,
                color.a * v_alpha * circleAlpha
            );
        }
    `;

    // ================= SHADER CREATION =================

    function createShader(type, source) {
        const shader = gl.createShader(type);

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    function createProgram() {
        const vertexShader = createShader(
            gl.VERTEX_SHADER,
            vertexShaderSource
        );

        const fragmentShader = createShader(
            gl.FRAGMENT_SHADER,
            fragmentShaderSource
        );

        if (!vertexShader || !fragmentShader) return null;

        const result = gl.createProgram();

        gl.attachShader(result, vertexShader);
        gl.attachShader(result, fragmentShader);
        gl.linkProgram(result);

        if (!gl.getProgramParameter(result, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(result));
            return null;
        }

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        return result;
    }

    function getUniform(name) {
        return gl.getUniformLocation(program, name);
    }

    // ================= TEXTURE =================

    function createTexture() {
        texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MIN_FILTER,
            gl.NEAREST
        );

        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MAG_FILTER,
            gl.NEAREST
        );

        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_WRAP_S,
            gl.CLAMP_TO_EDGE
        );

        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_WRAP_T,
            gl.CLAMP_TO_EDGE
        );

        const maskedCanvas = createMaskedSourceCanvas();

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            maskedCanvas
        );
    }

    // ================= PIXEL SAMPLING =================

    function createPixelVertices() {
        const columns = Math.ceil(imageWidth / PARTICLE_STEP);
        const rows = Math.ceil(imageHeight / PARTICLE_STEP);

        const vertices = new Float32Array(columns * rows * 2);

        let index = 0;

        for (let y = 0; y < imageHeight; y += PARTICLE_STEP) {
            for (let x = 0; x < imageWidth; x += PARTICLE_STEP) {
                const sampleX = Math.min(
                    x + PARTICLE_STEP / 2,
                    imageWidth - 0.5
                );

                const sampleY = Math.min(
                    y + PARTICLE_STEP / 2,
                    imageHeight - 0.5
                );

                vertices[index++] = sampleX / imageWidth;
                vertices[index++] = sampleY / imageHeight;
            }
        }

        particleCount = index / 2;

        buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.bufferData(
            gl.ARRAY_BUFFER,
            vertices,
            gl.STATIC_DRAW
        );

        const location = gl.getAttribLocation(
            program,
            "a_uv"
        );

        gl.enableVertexAttribArray(location);

        gl.vertexAttribPointer(
            location,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );
    }

    // ================= CANVAS SETUP =================

    function setup() {
        const rect = img.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();

        imageWidth = img.naturalWidth;
        imageHeight = img.naturalHeight;

        if (!imageWidth || !imageHeight || !rect.width || !rect.height) {
            return;
        }

        imageCssWidth = rect.width;
        imageCssHeight = rect.height;

        dpr = Math.min(window.devicePixelRatio || 1, 2);

        // Extra room on right, top and bottom.
        const canvasCssWidth = rect.width + RIGHT_SPACE;
        const canvasCssHeight =
            rect.height + TOP_SPACE + BOTTOM_SPACE;

        canvas.width = Math.ceil(canvasCssWidth * dpr);
        canvas.height = Math.ceil(canvasCssHeight * dpr);

        canvas.style.width = `${canvasCssWidth}px`;
        canvas.style.height = `${canvasCssHeight}px`;

        canvas.style.left =
            `${rect.left - wrapperRect.left}px`;

        canvas.style.top =
            `${rect.top - wrapperRect.top - TOP_SPACE}px`;

        gl.viewport(0, 0, canvas.width, canvas.height);

        if (!program) {
            program = createProgram();
            if (!program) return;

            gl.useProgram(program);

            const names = [
                "u_elapsed",
                "u_duration",
                "u_lifetime",
                "u_imageWidth",
                "u_imageHeight",
                "u_canvasWidth",
                "u_canvasHeight",
                "u_topSpace",
                "u_pixelSize",
                "u_upwardMin",
                "u_upwardMax",
                "u_rightMin",
                "u_rightMax",
                "u_releaseVariation",
                "u_image"
            ];

            for (const name of names) {
                uniforms[name] = getUniform(name);
            }

            createTexture();
            createPixelVertices();
        }

        gl.useProgram(program);

        gl.uniform1f(
            uniforms.u_imageWidth,
            imageCssWidth * dpr
        );

        gl.uniform1f(
            uniforms.u_imageHeight,
            imageCssHeight * dpr
        );

        gl.uniform1f(
            uniforms.u_canvasWidth,
            canvas.width
        );

        gl.uniform1f(
            uniforms.u_canvasHeight,
            canvas.height
        );

        gl.uniform1f(
            uniforms.u_topSpace,
            TOP_SPACE * dpr
        );

        gl.uniform1f(
            uniforms.u_pixelSize,
            Math.max(2, PARTICLE_STEP * dpr * 0.8)
        );

        gl.uniform1f(
            uniforms.u_duration,
            DURATION / 1000
        );

        gl.uniform1f(
            uniforms.u_lifetime,
            PARTICLE_LIFETIME / 1000
        );

        gl.uniform1f(
            uniforms.u_upwardMin,
            UPWARD_MIN * dpr
        );

        gl.uniform1f(
            uniforms.u_upwardMax,
            UPWARD_MAX * dpr
        );

        gl.uniform1f(
            uniforms.u_rightMin,
            RIGHT_MIN * dpr
        );

        gl.uniform1f(
            uniforms.u_rightMax,
            RIGHT_MAX * dpr
        );

        gl.uniform1f(
            uniforms.u_releaseVariation,
            RELEASE_VARIATION
        );

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.uniform1i(uniforms.u_image, 0);
    }

    // ================= IMAGE MASK =================

    function restoreMask() {
        img.style.maskImage = originalMask;
        img.style.webkitMaskImage = originalWebkitMask;

        img.style.maskComposite = originalMaskComposite;
        img.style.webkitMaskComposite = originalWebkitMaskComposite;

        img.style.maskSize = originalMaskSize;
        img.style.webkitMaskSize = originalWebkitMaskSize;

        img.style.maskRepeat = originalMaskRepeat;
        img.style.webkitMaskRepeat = originalWebkitMaskRepeat;
    }

    function applyDissolveMask(progress) {
        const start = Math.max(0, progress - 0.08);
const end = Math.min(1, progress + 0.08);

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg"
                 preserveAspectRatio="none"
                 viewBox="0 0 1000 1000">

                <linearGradient
                    id="dissolve"
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

                <rect
                    width="1000"
                    height="1000"
                    fill="url(#dissolve)"/>
            </svg>
        `;

        const animatedMask =
            `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

        img.style.maskImage =
            `${animatedMask}, ${baseMask}`;

        img.style.webkitMaskImage =
            `${animatedMask}, ${baseWebkitMask}`;

        img.style.maskComposite =
            "intersect, intersect";

        img.style.webkitMaskComposite =
            "source-in, source-in";

        img.style.maskSize =
            `100% 100%, ${baseMaskSize}`;

        img.style.webkitMaskSize =
            `100% 100%, ${baseWebkitMaskSize}`;

        img.style.maskRepeat =
            `no-repeat, ${baseMaskRepeat}`;

        img.style.webkitMaskRepeat =
            `no-repeat, ${baseWebkitMaskRepeat}`;
    }

    // ================= ANIMATION =================

    function render(timestamp) {
        if (!startTime) startTime = timestamp;

        const elapsed = (timestamp - startTime) / 1000;

        const progress = Math.min(
            elapsed / (DURATION / 1000),
            1
        );

        applyDissolveMask(progress);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        gl.uniform1f(
            uniforms.u_elapsed,
            elapsed
        );

        gl.enable(gl.BLEND);

        gl.blendFunc(
            gl.SRC_ALPHA,
            gl.ONE_MINUS_SRC_ALPHA
        );

        gl.drawArrays(
            gl.POINTS,
            0,
            particleCount
        );

        const animationEnd =
            DURATION / 1000 +
            PARTICLE_LIFETIME / 1000;

        if (elapsed < animationEnd) {
            animationFrame = requestAnimationFrame(render);
        } else {
            gl.clear(gl.COLOR_BUFFER_BIT);

            canvas.style.display = "none";

            img.style.maskImage =
                "linear-gradient(transparent, transparent)";

            img.style.webkitMaskImage =
                "linear-gradient(transparent, transparent)";

            state = "gone";
            animationFrame = null;
        }
    }

    // ================= START / RESTORE =================

    function startDisintegration() {
        if (state === "disintegrating") return;

        if (state === "gone") {
            restoreImage();
            return;
        }

        if (!img.complete || !img.naturalWidth) return;

        setup();

        if (!program) return;

        state = "disintegrating";

        canvas.style.display = "block";

        startTime = 0;

        animationFrame = requestAnimationFrame(render);
    }

    function restoreImage() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }

        gl.clear(gl.COLOR_BUFFER_BIT);

        canvas.style.display = "none";

        restoreMask();

        state = "ready";
        startTime = 0;
    }

    img.addEventListener("click", startDisintegration);
    img.addEventListener("contextmenu", event => event.preventDefault());
    img.style.cursor = "pointer";

    if (img.complete && img.naturalWidth) {
        setup();
    } else {
        img.addEventListener("load", setup, { once: true });
    }

    window.addEventListener("resize", () => {
        if (state === "ready") {
            setup();
        }
    });
}


document.addEventListener(
    "DOMContentLoaded",
    initializeThanosEffect
);










document.addEventListener("DOMContentLoaded", init);

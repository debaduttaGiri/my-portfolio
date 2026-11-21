
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

document.addEventListener("DOMContentLoaded", init);

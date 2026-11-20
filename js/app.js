// Load HTML without replacing existing sections
async function appendComponent(elementId, filePath) {

    const response = await fetch(filePath);

    if (!response.ok) {
        throw new Error(`Failed to load ${filePath}`);
    }

    const html = await response.text();

    document.getElementById(elementId)
        .insertAdjacentHTML("beforeend", html);
}
async function loadComponent(elementId, filePath) {
    const response = await fetch(filePath);
    const html = await response.text();

    document.getElementById(elementId).innerHTML = html;
}


// =========================
// NAVBAR
// =========================

async function loadNavbar() {

    await loadComponent("navbar", "components/navbar.html");

    const menuButton = document.getElementById("menuButton");
    const navLinksContainer = document.querySelector(".nav-links");

    const links = navLinksContainer.querySelectorAll("a");


    // Mobile menu
    if (menuButton) {

        menuButton.addEventListener("click", function () {

            navLinksContainer.classList.toggle("active");

            const isOpen =
                navLinksContainer.classList.contains("active");

            menuButton.setAttribute(
                "aria-expanded",
                isOpen
            );

            menuButton.textContent =
                isOpen ? "✕" : "☰";
        });

    }


    // Navigation clicks
    links.forEach(function (link) {

        link.addEventListener("click", function () {

            // Active navigation
            links.forEach(function (item) {
                item.classList.remove("active");
            });

            this.classList.add("active");


            // Close mobile menu
            if (navLinksContainer) {

                navLinksContainer.classList.remove("active");

            }

            if (menuButton) {

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuButton.textContent = "☰";

            }

        });

    });
}


// =========================
// ROLE ANIMATION
// =========================

function startRoleAnimation() {

    const roles = [
        "Full Stack .NET Developer",
        "Angular Developer",
        "SQL Developer",
        "AWS Developer"
    ];

    const roleText =
        document.getElementById("roleText");

    if (!roleText) {
        return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;


    function typeRole() {

        const currentRole =
            roles[roleIndex];


        // Typing
        if (!isDeleting) {

            roleText.textContent =
                currentRole.substring(
                    0,
                    charIndex + 1
                );

            charIndex++;


            // Finished typing
            if (charIndex === currentRole.length) {

                isDeleting = true;

                setTimeout(typeRole, 1800);

                return;
            }


            setTimeout(typeRole, 80);

        }

        // Deleting
        else {

            roleText.textContent =
                currentRole.substring(
                    0,
                    charIndex - 1
                );

            charIndex--;


            // Finished deleting
            if (charIndex === 0) {

                isDeleting = false;

                roleIndex =
                    (roleIndex + 1) % roles.length;

                setTimeout(typeRole, 300);

                return;
            }


            setTimeout(typeRole, 45);

        }

    }


    typeRole();
}


// =========================
// ACTIVE NAVIGATION
// =========================

function setupScrollNavigation() {

    // IMPORTANT:
    // Query AFTER navbar/content are loaded

    const navLinks =
        document.querySelectorAll(".nav-links a");

    const sections =
        document.querySelectorAll("section");


    function setActiveLink() {

        let currentSection = "";


        sections.forEach(function (section) {

            const sectionTop =
                section.offsetTop - 150;

            const sectionHeight =
                section.offsetHeight;


            if (
                window.scrollY >= sectionTop &&
                window.scrollY <
                    sectionTop + sectionHeight
            ) {

                currentSection =
                    section.getAttribute("id");

            }

        });


        navLinks.forEach(function (link) {

            link.classList.remove("active");


            if (
                link.getAttribute("href") ===
                "#" + currentSection
            ) {

                link.classList.add("active");

            }

        });

    }


    window.addEventListener(
        "scroll",
        setActiveLink
    );


    // Set Home active initially
    setActiveLink();
}





async function init() {
    try {
        // 1. Load navbar
        await loadNavbar();

        // 2. Load Home
        await loadComponent(
            "content",
            "sections/home.html"
        );

        // 3. Load About
        await appendComponent(
            "content",
            "sections/about.html"
        );

        // 4. Load Skills
        await appendComponent(
            "content",
            "sections/skills.html"
        );

        // 5. Load Projects
        await appendComponent(
            "content",
            "sections/projects.html"
        );

        // 6. Load Contact
        await appendComponent(
            "content",
            "sections/contact.html"
        );

        // Initialize everything after loading
        initializeReveal();
        initializeNameErase();
        startRoleAnimation();
        setupScrollNavigation();

    }
    catch (error) {
        console.error(
            "Portfolio initialization failed:",
            error
        );
    }
}

// Initialize only ONCE
document.addEventListener("DOMContentLoaded", init);


// Initialize application only once
document.addEventListener("DOMContentLoaded", init);


document.addEventListener("DOMContentLoaded", init);


// Initialize application only once
document.addEventListener("DOMContentLoaded", init);


document.addEventListener("DOMContentLoaded", init);


// document.addEventListener("DOMContentLoaded", () => {

//     const observer = new IntersectionObserver(
//         (entries) => {
//             entries.forEach(entry => {
//                 if (entry.isIntersecting) {
//                     entry.target.classList.add("visible");
//                     observer.unobserve(entry.target);
//                 }
//             });
//         },
//         {
//             threshold: 0.15
//         }
//     );

//     document.querySelectorAll(".reveal").forEach(element => {
//         observer.observe(element);
//     });

// });

// =========================
// SCROLL REVEAL
// =========================

function initializeReveal() {

    const observer = new IntersectionObserver(
        (entries) => {

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

    document.querySelectorAll(".reveal").forEach(element => {
        observer.observe(element);
    });
}



// =================================
// MAGIC NAME ERASER
// =================================

function initializeNameErase() {

    const heading = document.getElementById("erasableName");

    if (!heading || heading.dataset.initialized) return;

    heading.dataset.initialized = "true";

    const originalText = heading.textContent.trim();

    // Convert each character into an individual element
    function renderName() {

        heading.innerHTML = [...originalText].map(char => {

            if (char === " ") {
                return '<span class="name-space">&nbsp;</span>';
            }

            return `<span>${char}</span>`;

        }).join("");

    }

    renderName();

    let holdTimer;
    let isErasing = false;
    let activePointerId = null;
    let magicCursor = null;

    // Create glowing cursor
    function createCursor() {

        magicCursor = document.createElement("div");
        magicCursor.className = "magic-cursor";

        document.body.appendChild(magicCursor);

    }

    // Create sparkle particles
    function createParticles(x, y) {

        for (let i = 0; i < 5; i++) {

            const particle = document.createElement("div");

            particle.className = "magic-particle";

            particle.style.left = x + "px";
            particle.style.top = y + "px";

            particle.style.setProperty(
                "--particle-x",
                (Math.random() - .5) * 90 + "px"
            );

            particle.style.setProperty(
                "--particle-y",
                (Math.random() - .5) * 90 + "px"
            );

            document.body.appendChild(particle);

            particle.addEventListener("animationend", () => {
                particle.remove();
            });

        }

    }

    // Start long press
    heading.addEventListener("pointerdown", e => {

        if (e.pointerType === "mouse" && e.button !== 0) return;

        activePointerId = e.pointerId;
        isErasing = false;

        holdTimer = setTimeout(() => {

            isErasing = true;

            heading.classList.add("erasing");

            createCursor();

        }, 400);

    });

    // Move magic eraser
    document.addEventListener("pointermove", e => {

        if (!isErasing || e.pointerId !== activePointerId) return;

        if (magicCursor) {

            magicCursor.style.left = e.clientX + "px";
            magicCursor.style.top = e.clientY + "px";

        }

        const element = document.elementFromPoint(
            e.clientX,
            e.clientY
        );

        const letter = element?.closest(
            "#erasableName span:not(.name-space)"
        );

        if (letter && !letter.classList.contains("erased")) {

            const rect = letter.getBoundingClientRect();

            // Random flying direction
            letter.style.setProperty(
                "--fly-x",
                (Math.random() - .5) * 150 + "px"
            );

            letter.style.setProperty(
                "--fly-y",
                (Math.random() - .5) * 130 - 40 + "px"
            );

            letter.style.setProperty(
                "--fly-rotate",
                (Math.random() - .5) * 100 + "deg"
            );

            letter.classList.add("erased");

            createParticles(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2
            );

        }

    });

    // Stop erasing
    function stopErasing(e) {

        if (e.pointerId !== activePointerId) return;

        clearTimeout(holdTimer);

        isErasing = false;
        activePointerId = null;

        heading.classList.remove("erasing");

        magicCursor?.remove();
        magicCursor = null;

    }

    document.addEventListener("pointerup", stopErasing);
    document.addEventListener("pointercancel", stopErasing);

    // Double-click to restore the name
    heading.addEventListener("dblclick", () => {

        clearTimeout(holdTimer);

        isErasing = false;
        heading.classList.remove("erasing");

        magicCursor?.remove();
        magicCursor = null;

        renderName();

    });

// Load additional sections without replacing existing HTML
async function appendComponent(elementId, filePath) {

    const response = await fetch(filePath);

    if (!response.ok) {
        throw new Error(`Failed to load ${filePath}`);
    }

    const html = await response.text();

    document.getElementById(elementId)
        .insertAdjacentHTML("beforeend", html);
}


}


// ==========================================
// CONTACT FORM
// ==========================================

document.addEventListener("submit", function (e) {

    if (e.target.id !== "contactForm") return;

    e.preventDefault();

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const subject = document.getElementById("contactSubject").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    const recipient = "YOUR_EMAIL@example.com";

    const body = `
Name: ${name}
Email: ${email}

Message:
${message}
`;

    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;

});


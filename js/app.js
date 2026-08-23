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


// =========================
// INITIALIZE
// =========================

async function init() {

    // 1. Load navbar
    await loadNavbar();


    // 2. Load page content
    await loadComponent(
        "content",
        "sections/home.html"
    );


    // 3. Start typing animation
    startRoleAnimation();


    // 4. Setup navigation AFTER
    //    everything has been loaded
    setupScrollNavigation();

}


init();
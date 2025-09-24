const burger = document.getElementById("burger") as HTMLButtonElement | null;
const navLinks = document.getElementById("nav-links") as HTMLUListElement | null;

if (burger && navLinks) {
    const toggleMenu = () => {
        const expanded = burger.getAttribute("aria-expanded") === "true";
        burger.setAttribute("aria-expanded", String(!expanded));
        navLinks.classList.toggle("active", !expanded);
    };

    burger.addEventListener("click", toggleMenu);

    navLinks.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
        link.addEventListener("click", () => {
            if (burger.getAttribute("aria-expanded") === "true") {
                toggleMenu();
            }
        });
    });
}

const sections = document.querySelectorAll<HTMLElement>("section[id]");

if (sections.length) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        },
        {
            threshold: 0.2,
        }
    );

    sections.forEach((section) => observer.observe(section));

    const navItems = document.querySelectorAll<HTMLAnchorElement>(".nav-links a");
    const highlightObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                navItems.forEach((link) => {
                    const targetId = link.getAttribute("href")?.replace("#", "");
                    const isActive = targetId === entry.target.id;
                    link.classList.toggle("active", isActive);
                });
            });
        },
        {
            threshold: 0.55,
        }
    );

    sections.forEach((section) => highlightObserver.observe(section));
}

const canvas = document.getElementById("bg-canvas") as HTMLCanvasElement | null;

if (canvas) {
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Impossible d'obtenir le contexte 2D du canvas.");
    }

    const particles: Particle[] = [];
    const density = 90;

    class Particle {
        x!: number;
        y!: number;
        vx!: number;
        vy!: number;
        size: number;

        constructor() {
            this.size = Math.random() * 1.2 + 0.8;
            this.reset();
        }

        reset() {
            if (!canvas) {
                throw new Error("Canvas is null.");
            }
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (!canvas || this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }

            this.draw();
        }

        draw() {
            const gradient = ctx!.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 8);
            gradient.addColorStop(0, "rgba(79, 158, 237, 0.8)");
            gradient.addColorStop(1, "rgba(79, 158, 237, 0)");
            if (!ctx) {
                throw new Error("Canvas rendering context is null.");
            }
            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const resizeCanvas = () => {
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * pixelRatio;
        canvas.height = window.innerHeight * pixelRatio;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.scale(pixelRatio, pixelRatio);
    };

    resizeCanvas();

    for (let i = 0; i < density; i += 1) {
        particles.push(new Particle());
    }

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((particle) => particle.update());
        requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener("resize", () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        resizeCanvas();
        particles.forEach((particle) => particle.reset());
    });
}

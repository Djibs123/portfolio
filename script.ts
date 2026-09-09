const burger = document.getElementById("burger") as HTMLButtonElement | null;
const navLinks = document.getElementById("nav-links") as HTMLUListElement | null;
const header = document.querySelector<HTMLElement>(".site-header");
const progressBar = document.getElementById("scroll-progress-bar");
let lastDialogTrigger: HTMLElement | null = null;

if (burger && navLinks) {
  const toggleMenu = (force?: boolean) => {
    const expanded = force === undefined ? burger.getAttribute("aria-expanded") !== "true" : force;
    burger.setAttribute("aria-expanded", String(expanded));
    navLinks.classList.toggle("active", expanded);
  };
  burger.addEventListener("click", () => toggleMenu());
  navLinks.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => link.addEventListener("click", () => toggleMenu(false)));
}

const updateScrollState = () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight * 100 : 0;
  if (progressBar) progressBar.style.width = String(Math.min(100, Math.max(0, progress))) + "%";
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
};
window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sections = document.querySelectorAll<HTMLElement>(".reveal");
if (reducedMotion || !("IntersectionObserver" in window)) {
  sections.forEach((section) => section.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  sections.forEach((section) => revealObserver.observe(section));
}

const navItems = document.querySelectorAll<HTMLAnchorElement>(".nav-links a");
const navigableSections = document.querySelectorAll<HTMLElement>("main section[id]");
if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver((entries) => {
    const activeEntry = entries.find((entry) => entry.isIntersecting);
    if (!activeEntry) return;
    navItems.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === "#" + activeEntry.target.id));
  }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
  navigableSections.forEach((section) => navObserver.observe(section));
}

document.querySelectorAll<HTMLButtonElement>(".detail-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const dialog = document.getElementById(trigger.dataset.dialog ?? "");
    if (!(dialog instanceof HTMLDialogElement)) return;
    lastDialogTrigger = trigger;
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>(".dialog-close")?.focus();
  });
});

document.querySelectorAll<HTMLDialogElement>(".project-dialog").forEach((dialog) => {
  const closeDialog = () => dialog.close();
  dialog.querySelector<HTMLButtonElement>(".dialog-close")?.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener("close", () => {
    lastDialogTrigger?.focus();
    lastDialogTrigger = null;
  });
});

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const DESTINATIONS = [
  { id: "overview", label: "Dashboard", href: "#overview" },
  { id: "nutrition", label: "Nutrition", href: "#nutrition" },
  { id: "training", label: "Training", href: "#features-card" },
  { id: "recovery", label: "Recovery", href: "#features-card" },
  { id: "weekly-progress", label: "Weekly progress", href: "#features-card" },
];

function getSamePageTarget(href) {
  const url = new URL(href, window.location.href);
  const current = window.location;
  if (
    url.protocol !== current.protocol ||
    url.host !== current.host ||
    url.pathname !== current.pathname ||
    url.search !== current.search ||
    !url.hash
  ) {
    return null;
  }

  try {
    return document.getElementById(decodeURIComponent(url.hash.slice(1)));
  } catch {
    return null;
  }
}

function activeDestinationForHash(hash) {
  return DESTINATIONS.find((destination) => destination.href === hash) ?? DESTINATIONS[0];
}

function scrollToSection(element, { focus = true } = {}) {
  if (!element) return;

  gsap.killTweensOf(window);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finish = () => {
    if (focus) element.focus({ preventScroll: true });
  };

  if (prefersReducedMotion) {
    const top = element.getBoundingClientRect().top + window.scrollY - 18;
    window.scrollTo({ top, behavior: "auto" });
    finish();
    return;
  }

  gsap.to(window, {
    duration: 0.72,
    ease: "power2.inOut",
    overwrite: "auto",
    scrollTo: { y: element, offsetY: 18, autoKill: true },
    onComplete: finish,
  });
}

export default function BottomMenu({ activeItem, onNavigate }) {
  const onNavigateRef = useRef(onNavigate);

  useEffect(() => {
    onNavigateRef.current = onNavigate;
  }, [onNavigate]);

  useEffect(() => {
    const initialTarget = getSamePageTarget(window.location.href);
    onNavigateRef.current(activeDestinationForHash(window.location.hash).id);
    if (initialTarget) requestAnimationFrame(() => scrollToSection(initialTarget, { focus: false }));

    function handlePopState() {
      onNavigateRef.current(activeDestinationForHash(window.location.hash).id);
      const target = getSamePageTarget(window.location.href);
      if (target) scrollToSection(target);
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      gsap.killTweensOf(window);
    };
  }, []);

  function handleClick(event, destination) {
    const target = getSamePageTarget(destination.href);
    if (!target) return;

    event.preventDefault();
    onNavigateRef.current(destination.id);
    if (window.location.hash !== destination.href) {
      window.history.pushState(null, "", destination.href);
    }
    scrollToSection(target);
  }

  return (
    <nav aria-label="PlateCoach sections" className="bottom-menu">
      {DESTINATIONS.map((destination) => (
        <a
          aria-current={activeItem === destination.id ? "page" : undefined}
          className={activeItem === destination.id ? "is-active" : ""}
          href={destination.href}
          key={destination.id}
          onClick={(event) => handleClick(event, destination)}
        >
          {destination.label}
        </a>
      ))}
    </nav>
  );
}

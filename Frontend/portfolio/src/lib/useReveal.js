import { useEffect } from "react";

/** Adds `.in` to every `.reveal` as it scrolls into view. */
export function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll(".reveal:not([data-in])");

    // No observer support (or nothing to watch): show everything immediately
    // rather than leaving content stuck at opacity 0.
    if (!nodes.length || !("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.setAttribute("data-in", ""));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          // An attribute, not a class: React owns className on these nodes and
          // rewrites it on re-render (e.g. when a work item toggles open),
          // which would strip a class added out-of-band and leave the element
          // stuck at opacity 0 forever, since it has already been unobserved.
          entry.target.setAttribute("data-in", "");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
    // Every `.reveal` is present at mount — sections don't lazy-mount — so one
    // pass is enough. Re-running per render would tear down the observer
    // before its callback had a chance to fire.
  }, []);
}

/** Tracks which section is currently in view, for nav highlighting. */
export function useScrollSpy(ids, onChange) {
  useEffect(() => {
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) onChange(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5] }
    );

    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [ids, onChange]);
}

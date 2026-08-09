const HEADER_OFFSET = 76;

/**
 * Scroll a section under the fixed header.
 *
 * Asks for a smooth scroll, then verifies. Some environments (automation
 * harnesses, managed browsers, OS-level reduced motion) silently ignore
 * `behavior: "smooth"` entirely — without the fallback the page simply never
 * moves, which would break both the nav and the assistant's jump-to.
 */
export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return false;

  const target = Math.max(
    0,
    el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
  );

  const start = window.scrollY;
  window.scrollTo({ top: target, behavior: "smooth" });

  window.setTimeout(() => {
    // Nothing moved and we weren't already there → smooth was ignored.
    // The fallback must pass behavior:"instant" explicitly: the stylesheet sets
    // `scroll-behavior: smooth` on <html>, which otherwise applies to this call
    // too and gets suppressed for the same reason.
    if (Math.abs(window.scrollY - start) < 2 && Math.abs(target - start) > 2) {
      window.scrollTo({ top: target, behavior: "instant" });
    }
  }, 120);

  return true;
}

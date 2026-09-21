# Mobile Navigation & Page Transition Rules

## 1. Touch Device Sticky Hover Prevention
- Wrap interactive button `:hover` pseudo-classes in `@media (hover: hover) and (pointer: fine)`.
- Invoke `.blur()` on click/tap handlers for theme and navigation buttons (`#theme-toggle`, `.mobile-toggle`).
- Prevents sticky background circles or selection highlights on mobile/touch screens.

## 2. Mobile Navigation Menu Retraction & Page Handoff
- When a mobile user selects a cross-page link from an open menu drawer:
  1. Immediately retract the menu drawer (`closeMobileMenu()`).
  2. Allow a brief 180ms cubic-bezier delay for the collapse animation and icon morphing to finish before setting `window.location.href`.
- Ensures clean visual handoff without menu freezing or abrupt layout pop.

## 3. Avoid Whole-Body Opacity Zeroing (No Blank Flash Screens)
- Never set `body.page-exiting { opacity: 0; }` during HTML page transitions.
- Fading the whole body to zero opacity exposes the window background, creating an unwanted dark/light blank flash screen.

## 4. Scroll Restoration & Header Stability
- Set `history.scrollRestoration = 'manual'` when handling custom HTML page transitions, resetting `window.scrollTo(0,0)` on page load.
- Prevents fixed headers from jumping to the bottom of the page when navigating between long pages.

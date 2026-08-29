add a premium animation system to the wedding invitation CMS.

Current context:
- The wedding invitation CMS is already implemented.
- Admin editor exists at `/admin/wedding-invitations/[id]`.
- Admin editor already has a realtime mobile device preview.
- Public invitation route exists at `/undangan/[slug]`.
- The current wedding template is `classic-elegant`.
- Project stack includes Next.js 15, React 19, Tailwind CSS 4, Prisma, MySQL, GSAP, Lenis, Motion, Lucide React.
- Parallax scroll and horizontal scroll must be supported.
- Keep the template mobile-first and wedding-focused.

Goal:
Create an animation preset system that can be configured from the admin CMS without coding.

Important:
- Do not create a free-code animation editor.
- Do not allow arbitrary JavaScript or arbitrary CSS from admin input.
- Admin should select animation presets from curated options.
- Animations should be section-based.
- Keep public `/undangan/[slug]` behavior unchanged.
- Admin preview should support animation preview, but avoid making the editor laggy.
- Respect `prefers-reduced-motion`.

Before coding:
1. Inspect the current wedding CMS implementation.
2. Inspect the current admin editor and realtime preview.
3. Inspect the current `classic-elegant` template.
4. Inspect whether GSAP and Lenis are already initialized anywhere.
5. Reuse existing patterns, components, and styling.
6. Do not rewrite working functionality.

Core concept:
Each wedding invitation can store animation settings. The admin chooses animation presets per section. The public template reads those settings and applies the selected animations.

Recommended sections:
- cover
- couple
- countdown
- events
- story
- gallery
- gift
- rsvp
- guestbook
- closing

Animation categories:
1. Global motion
2. Section entrance
3. Text motion
4. Background motion
5. Scroll motion
6. Interaction motion

Database / data design:
Add animation configuration to `WeddingInvitation`.

Preferred simple MVP approach:
Store animation settings as JSON on the parent invitation, for example:

```txt
animationProfile
animationSettingsJson
Suggested JSON shape:
{
  "global": {
    "smoothScroll": true,
    "profile": "elegant",
    "intensity": "medium",
    "reducedMotion": true
  },
  "background": {
    "effect": "parallax-soft"
  },
  "sections": {
    "cover": {
      "entrance": "cinematic-opening",
      "text": "word-stagger",
      "scroll": "image-parallax"
    },
    "couple": {
      "entrance": "fade-up-stagger",
      "scroll": "portrait-parallax"
    },
    "events": {
      "entrance": "card-reveal",
      "scroll": "none"
    },
    "story": {
      "entrance": "timeline-reveal",
      "scroll": "parallax-soft"
    },
    "gallery": {
      "entrance": "gallery-reveal",
      "scroll": "horizontal-scroll"
    },
    "gift": {
      "entrance": "soft-rise",
      "interaction": "copy-pulse"
    },
    "rsvp": {
      "entrance": "form-reveal"
    },
    "guestbook": {
      "entrance": "message-cascade"
    },
    "closing": {
      "entrance": "fade-up"
    }
  }
}
If the existing project avoids JSON fields or MySQL JSON support is inconvenient, store it as a long text string with safe JSON parse helpers. Use the style that best matches the existing Prisma schema.
Admin UI:
Add a new tab in the wedding invitation editor:
Animations
Inside the Animations tab, provide curated controls:
Global:
- Smooth scroll: on/off
- Animation profile:
  - Elegant
  - Romantic
  - Luxury
  - Minimal
- Intensity:
  - Low
  - Medium
  - High
- Background effect:
  - None
  - Parallax Soft
  - Floating Petals
  - Light Particles
  - Shimmer
Section animation controls:
For each section, show select inputs only with suitable presets.
Cover:
- None
- Fade Up
- Cinematic Opening
- Zoom Reveal
- Image Parallax
Couple:
- None
- Fade Up Stagger
- Split Reveal
- Portrait Parallax
Countdown:
- None
- Number Rise
- Soft Reveal
Events:
- None
- Card Reveal
- Timeline Reveal
Story:
- None
- Timeline Reveal
- Parallax Soft
- Pinned Story if not too complex
Gallery:
- None
- Gallery Reveal
- Soft Zoom
- Horizontal Scroll
Gift:
- None
- Soft Rise
- Card Flip
- Copy Pulse
RSVP:
- None
- Form Reveal
Guestbook:
- None
- Message Cascade
Closing:
- None
- Fade Up
- Soft Bloom
Requirements:
- The admin should be able to save animation settings.
- The realtime preview should update when animation settings change.
- The public invitation should apply the saved animation settings.
- Unknown or invalid animation presets should safely fall back to none.
- If animation settings are missing, use beautiful defaults for classic-elegant.
Animation implementation:
Use GSAP for:
- section reveal on scroll
- text stagger
- parallax scroll
- horizontal scroll gallery
- pinned story/gallery if implemented
Use Lenis for:
- smooth scrolling on the public invitation page when enabled
Use Tailwind CSS for:
- layout, transitions, responsive design, static styling
Use vanilla browser APIs where useful:
- IntersectionObserver if simpler for lightweight reveal
- Clipboard API for copy animation feedback
- matchMedia for prefers-reduced-motion
- ResizeObserver if needed for horizontal scroll measurements
Do not use arbitrary admin-provided JS/CSS.
Component structure suggestion, adjust to existing codebase:
src/lib/wedding/animation-presets.ts
src/lib/wedding/animation-settings.ts
src/components/wedding/animation/wedding-motion-provider.tsx
src/components/wedding/animation/section-motion.tsx
src/components/wedding/animation/parallax-layer.tsx
src/components/wedding/animation/horizontal-scroll-section.tsx
src/components/admin/wedding/animation-settings-form.tsx
Animation architecture:
1. animation-presets.ts
   - Contains allowed preset names.
   - Contains section-to-preset options.
   - Contains default settings for classic-elegant.
   - Contains validation/sanitization helpers.
2. WeddingMotionProvider
   - Client component.
   - Initializes Lenis when smoothScroll is enabled.
   - Checks prefers-reduced-motion.
   - Provides motion context/settings to sections.
   - Cleans up GSAP/Lenis instances on unmount.
3. SectionMotion
   - Client wrapper for individual sections.
   - Receives sectionKey.
   - Reads the selected animation preset.
   - Applies entrance/text/scroll animation.
   - Uses GSAP context for cleanup.
4. ParallaxLayer
   - Client component for safe parallax elements.
   - Supports intensity low/medium/high.
   - Disabled or reduced on mobile if performance is poor.
5. HorizontalScrollSection
   - Use for gallery only in MVP.
   - Must be mobile-safe.
   - If horizontal scroll harms UX on small screens, use regular horizontal swipe on mobile and GSAP pinned horizontal only on desktop/tablet.
   - Must not trap scroll awkwardly.
Admin preview behavior:
- Add a small preview motion mode if needed:
  - Reduced
  - Play
- Default admin preview should not autoplay music.
- Avoid heavy continuous animations in admin preview.
- Realtime preview should show selected animations where practical.
- If necessary, admin preview can use reduced intensity while public page uses full intensity.
Performance requirements:
- Mobile-first.
- Avoid heavy infinite animations.
- Avoid too many particles.
- Use CSS transforms and opacity.
- No layout thrashing.
- Cleanup all GSAP ScrollTriggers on unmount.
- Recalculate ScrollTrigger on image load or resize if needed.
- Respect reduced motion.
Visual direction:
Make the animation feel premium and cinematic, but still elegant for wedding invitations:
- soft reveal
- slow parallax
- subtle image movement
- gentle staggered text
- graceful section transitions
- not game-like
- not too flashy
- not heavy neon effects
Default animation profile for classic-elegant:
global.smoothScroll = true
global.profile = elegant
global.intensity = medium
background.effect = parallax-soft
cover.entrance = cinematic-opening
cover.text = word-stagger
cover.scroll = image-parallax
couple.entrance = fade-up-stagger
couple.scroll = portrait-parallax
countdown.entrance = number-rise
events.entrance = card-reveal
story.entrance = timeline-reveal
story.scroll = parallax-soft
gallery.entrance = gallery-reveal
gallery.scroll = horizontal-scroll
gift.entrance = soft-rise
rsvp.entrance = form-reveal
guestbook.entrance = message-cascade
closing.entrance = fade-up
Implementation phases:
1. Inspect current implementation and identify exact files.
2. Add animation settings data model and safe default helpers.
3. Add animation preset registry and validation.
4. Add Animations tab in admin editor.
5. Save animation settings through existing save action pattern.
6. Wire realtime mobile preview to use draft animation settings.
7. Add motion provider and section wrappers to the wedding template.
8. Implement core animations:
   - Lenis smooth scroll
   - Fade up reveal
   - Text stagger
   - Cinematic opening
   - Parallax scroll
   - Portrait parallax
   - Gallery reveal
   - Horizontal scroll gallery
   - Timeline reveal
   - Copy pulse interaction
9. Verify public page and admin preview.
10. Run checks.
Testing:
Run:
- npm run typecheck
- npm run lint
- npm run check
- npm run build if feasible
Manual test:
1. Open /admin/wedding-invitations/[id].
2. Open the Animations tab.
3. Change global profile and intensity.
4. Change cover animation.
5. Change gallery animation to Horizontal Scroll.
6. Confirm mobile preview updates.
7. Save settings.
8. Open /undangan/[slug].
9. Confirm Lenis smooth scroll works.
10. Confirm parallax scroll works.
11. Confirm gallery horizontal scroll works.
12. Confirm animations do not break mobile layout.
13. Confirm reduced motion disables or reduces animations.
14. Confirm admin preview does not autoplay music.
15. Confirm no hydration errors or window is not defined.
Acceptance criteria:
- Admin can choose animation presets without coding.
- Animation settings save to database.
- Realtime preview reflects animation settings.
- Public wedding template uses saved animation settings.
- Parallax scroll exists and works.
- Horizontal scroll exists and works, at least on gallery.
- Animations are mobile-friendly and elegant.
- Reduced motion is respected.
- No arbitrary JS/CSS input from admin.
- Existing CMS and public invitation behavior remains working

And from Rizky and Dinda's existing seeders, add animation to the content. So Rizky and Dinda's invitation is perfect.
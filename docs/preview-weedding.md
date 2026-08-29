Wedding Invitation Admin Realtime Mobile Preview Plan

Context:
The wedding invitation CMS is already implemented and working. The admin editor exists at `/admin/wedding-invitations/[id]`, and the public invitation page exists at `/undangan/[slug]`. The current template is `classic-elegant`.

Goal:
Improve the admin edit page so the user can edit wedding invitation content and see a realtime mobile-device preview on the same page.

Important:
- Do not rebuild the whole CMS.
- Do not change the public route behavior.
- Public `/undangan/[slug]` must still only show published invitations.
- Admin preview must be able to show draft invitations.
- Use the existing admin dashboard style.
- Use the existing wedding template renderer/components as much as possible.
- Do not create a full drag-and-drop builder.

Phase 1 — Inspect Current Implementation
1. Read the current wedding invitation admin editor:
   - `/admin/wedding-invitations/[id]/page.tsx`
   - related admin form components
   - related server actions
2. Read the public invitation renderer:
   - `/undangan/[slug]/page.tsx`
   - `classic-elegant` template components
   - template registry
3. Identify which data shape is used by the public template.
4. Identify which editor fields are already client-side controlled and which are saved through server actions.
5. Preserve existing working behavior.

Phase 2 — Create Shared Preview Data Shape
Create or reuse a normalized invitation view type, for example:

- parent invitation data
- events[]
- gallery[]
- gifts[]
- visible messages[]
- RSVP/guestbook enabled flags
- theme settings
- templateSlug

Purpose:
Both the public page and admin preview should render the same template from the same data shape.

Acceptance:
- No duplicated template logic between public page and admin preview.
- Public page can keep using server data.
- Admin preview can use local draft data.

Phase 3 — Extract Shared Template Renderer
Create or refine a shared renderer, for example:

`src/components/wedding/template-renderer.tsx`

Responsibilities:
- Receive invitation preview data as props.
- Read `templateSlug`.
- Render the correct template.
- Fallback to `classic-elegant` if template is missing.
- Work in both public route and admin preview.

Acceptance:
- `/undangan/[slug]` still renders normally.
- Admin preview can render the same template without fetching public route in an iframe unless iframe is already the cleanest existing pattern.
- Prefer component rendering over iframe so unsaved changes can preview instantly.

Phase 4 — Build Admin Editor Shell With Split Layout
On `/admin/wedding-invitations/[id]`, introduce an editor shell.

Desktop layout:
- Left: editor fields/tabs.
- Right: sticky mobile device preview.
- Suggested ratio: editor flexible width, preview around 430px.
- Preview should stay visible while scrolling the editor if practical.

Mobile/tablet layout:
- Do not force split layout.
- Use toggle/tabs:
  - `Edit`
  - `Preview`
- Default to `Edit`.

Acceptance:
- Desktop has edit panel + mobile preview side-by-side.
- Mobile has clean Edit/Preview toggle.
- Existing tabs like Main, Couple, Events, Gallery, Gifts, Settings, RSVPs, Guestbook still work.

Phase 5 — Build Mobile Device Preview Component
Create component, for example:

`src/components/admin/wedding/wedding-mobile-preview.tsx`

Visual requirements:
- Looks like a mobile phone frame.
- Width around `390px`.
- Height around `720px`, with max-height responsive to viewport.
- Rounded outer frame.
- Inner scrollable screen.
- Subtle admin-style border/shadow.
- No huge decoration.
- Preview content should scroll inside the device, not force the admin page to become awkward.
- Add small label or toolbar above frame:
  - Preview
  - Open public page
  - Copy link

Important:
- Music must not autoplay in admin preview.
- Heavy animations should be reduced or disabled in admin preview if they make editing laggy.
- Respect reduced-motion if already supported.

Acceptance:
- Preview visually reads as a phone/mobile device.
- Template is usable inside the frame.
- No text or component overflow breaks the admin layout.

Phase 6 — Realtime Draft State
Add local draft state for parent invitation fields.

Must update preview instantly:
- title
- slug if visible in link/toolbar
- brideName
- groomName
- brideFullName
- groomFullName
- brideParents
- groomParents
- openingText
- quoteText
- storyTitle
- storyText
- coverImage
- bridePhoto
- groomPhoto
- musicUrl
- primaryColor
- secondaryColor
- accentColor
- backgroundColor
- fontDisplay
- fontBody
- isMusicEnabled
- isRsvpEnabled
- isGuestbookEnabled
- templateSlug

Can update after save for MVP:
- events
- gallery
- gifts
- RSVP list
- guestbook moderation

Optional if simple:
- Keep a local draft copy of events/gallery/gifts too, so add/edit/delete also appears instantly before save.
- If this creates too much risk, leave child collections save-based.

Acceptance:
- Changing names updates preview immediately without saving.
- Changing colors updates preview immediately without saving.
- Changing font choices updates preview immediately without saving.
- Changing text fields updates preview immediately without saving.

Phase 7 — Save Behavior
Keep existing server actions.

Behavior:
- Editing form fields updates local draft state.
- Save button persists draft to database.
- Show success/error feedback.
- After save, refresh server data or update local baseline.
- Do not lose child collection behavior that already works.

Acceptance:
- Existing save still works.
- Unsaved parent edits can be previewed.
- Saved data persists after reload.

Phase 8 — Public Route Protection Check
Confirm public route remains unchanged:

- Published invitation: visible at `/undangan/[slug]`.
- Draft/archived invitation: `notFound()` or equivalent public hidden behavior.
- Admin preview can still render draft because it uses admin data directly.

Acceptance:
- Draft does not leak publicly.
- Admin can preview draft inside editor.

Phase 9 — Test & Verify
Run:

- `npm run typecheck`
- `npm run lint`
- `npm run check`
- `npm run build` if feasible

Manual test:
1. Open `/admin/wedding-invitations/[id]`.
2. Change bride/groom names.
3. Confirm mobile preview updates instantly.
4. Change color settings.
5. Confirm preview colors update instantly.
6. Change font selection.
7. Confirm preview font updates.
8. Switch editor tabs.
9. Confirm preview remains visible on desktop.
10. Test mobile admin viewport.
11. Confirm Edit/Preview toggle works.
12. Open `/undangan/[slug]`.
13. Confirm public page still works.
14. Confirm draft invitation is not publicly accessible.

Final Acceptance Criteria:
- Admin edit page includes realtime mobile device preview.
- Preview uses the same template renderer as public wedding invitation page.
- Parent/settings fields update preview before save.
- Existing save functionality remains intact.
- Public route behavior remains protected.
- UI is responsive and does not feel cramped.
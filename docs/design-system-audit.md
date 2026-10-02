> Archived: the Mint / Forest consumer redesign was rolled back at the user’s request. The earlier interface is active; business PIN security fixes remain in place.

# YemEmUnnai design system audit

Three read only subagents inspected the CSS token catalog, consumer components, and business boundaries. The primary agent applied the safe consumer refactors and verified the main flow in Chromium. This report covers all 19 files under `src/components`, the shared stylesheet, and App chrome. It is a source and browser audit, not a WCAG certification or a load capacity test.

## Token catalog

The 20 root declarations in `src/index.css:6` form the existing light business system. Consumer roles begin at `src/index.css:316` and are available only within `.consumer-ui`. Adding a campus utility to an unrelated node does not make its variables available. Never apply consumer scope around the whole business portal to fix one leaf component.

| Scope | Tokens |
| --- | --- |
| Root neumorphism | neu-surface, neu-surface-deep, neu-shadow-dark, neu-shadow-light, neu-well-dark, neu-border |
| Root brand | brand-primary, brand-primary-dark, brand-header, brand-accent, brand-accent-hover, brand-text-main, brand-text-muted, brand-live-green, brand-star-gold |
| Root legacy aliases | brand-canvas, brand-card-bg, brand-card-border, brand-inset-bg, brand-inset-border |
| Consumer primitives | forest-950, forest-900, forest-800, mint-500, mint-400, mint-600, cream-50, moss-300, saffron-500, rose-300 |
| Consumer background roles | color-bg-page, color-bg-surface, color-bg-hover, color-bg-status-live, color-bg-status-warm, color-bg-status-closed |
| Consumer text and action roles | color-text-primary, color-text-secondary, color-accent-solid, color-accent-hover, color-on-accent |
| Consumer status and structure | color-status-live, color-status-warm, color-status-closed, color-border, color-focus |

Names in this table have the CSS custom property prefix `--`. Every listed value and its intended use is visible in the stylesheet. Status backgrounds and action hover were promoted to semantic roles during this audit; their appearance is unchanged.

## Utility catalog

| Family | Classes and behavior |
| --- | --- |
| Legacy surfaces | tactile-card, tactile-inset, tactile-modal; light raised or inset wells |
| Legacy actions | btn-orange-shadow, btn-green-shadow, tactile-press |
| Legacy motion | animate-route-dash, animate-scarcity, animate-radar-ring, animate-steam-1, animate-steam-2, animate-mascot-float, animate-brand-shimmer |
| Legacy chrome | device-chassis, no-scrollbar, tabular-nums |
| Consumer type | campus-muted, field-hint, campus-eyebrow, campus-section-title, campus-price |
| Consumer surfaces and controls | campus-surface, campus-icon, campus-primary, campus-badge, campus-text-button, campus-card-action, campus-stepper |
| Status | status-live, status-warm, status-closed, campus-error |
| Discovery header | discovery-screen, discovery-header, brand-row, brand-lockup, campus-location, hero-copy, campus-search |
| Shop and category controls | shops-section, section-row, shop-carousel, shop-choice, shop-open, shop-closed, food-filters |
| Menu | menu-section, menu-count, food-grid, food-card, food-skeleton, skeleton-lines, food-photo, photo-status, food-card-body, food-meta, stock-count, food-vendor, food-location, food-price, food-reactions, menu-empty, consumer-footer |
| Detail | detail-screen, detail-nav, detail-photo, detail-body, detail-title, vendor-direction, direction-label, detail-tags, detail-actions |
| Sheets | campus-overlay, campus-sheet, sheet-handle, sheet-header, order-summary, quantity-row, checkout-note, order-success, token-number |
| Map | map-actions, campus-map, map-distance |
| Audit additions | review-stars, campus-welcome, brand-splash, brand-underline |
| Shared shell | app-shell, live-order, skip-content |

`campus-overlay` fills the fixed viewport, supplies the dimming layer and positions a sheet. `campus-sheet` sets the surface, 32px radius, maximum height, scrolling and safe area padding. `campus-primary` supplies a mint action with dark text and 52px minimum height. `campus-muted` supplies the secondary text role. `campus-card-action` is a neutral, bordered peer action with a 44px target. These classes expect consumer scope.

## Ranked findings and applied changes

| Severity | Domain | Location | Before | After or remaining work | Why |
| --- | --- | --- | --- | --- | --- |
| HIGH resolved | Accessibility and layout | `src/components/FeedbackModal.tsx:29` | Unlabeled textarea, outline removed, 440px sheet absolutely placed below 270px | Responsive scoped sheet, visible label, normal flow, focus ring and scrollable action | Keyboard and short screen users can reach and understand the review form |
| HIGH resolved | Data safety | `src/components/ErrorBoundary.tsx:45` | Reload called localStorage.clear, deleting saved orders | Reload preserves storage and describes recovery | Recovery must not silently destroy tracking |
| HIGH resolved | Layout and writing | `src/components/LocationPermissionScreen.tsx:4` | Fixed 339px panel could exceed 320px; permission button promised GPS without requesting it | Responsive campus welcome and honest Browse menu action; location remains opt in from map | Removes clipping and unsupported promises |
| MEDIUM resolved | Colors and accessibility | `src/components/InstallPrompt.tsx:75` | Separate dark palette, weak dark focus ring, 28px close button | Local consumer scope, standard sheet, primary, muted copy and 44px close target | Shared roles make focus and contrast consistent |
| MEDIUM resolved | Colors and UI | `src/components/BrandIntroSplash.tsx:48` | Separate forest and orange palette | Consumer scope, page and surface roles, warm underline | Startup now uses the same palette and focus system |
| MEDIUM resolved | Colors and writing | `src/components/ErrorBoundary.tsx:30` | Independent orange reload action and vague error copy | Scoped surface, primary action and explicit recovery | Error UI remains recognizable and actionable |
| LOW resolved | Colors | `src/index.css:333`, `src/index.css:338` | Repeated status fill and hover literals | Consumed semantic background and hover tokens | One role controls every shared state |
| LOW remaining | Colors | `src/components/WalkInMapModal.tsx:43` | Map SVG duplicates matching forest and mint literals | Replace SVG fills and strokes with role variables in a later appearance preserving cleanup | Current hues match; this is duplication, not unreadable content |
| LOW remaining | Colors | `src/index.css:476`, `src/App.tsx:152` | Shared shell, tracking, skip link and outer canvas use matching or nearby literals outside consumer scope | Give consumer owned chrome a local scope before replacing values | Unscoped var replacements would fail, and a whole App wrapper could affect vendors |
| LOW remaining | Maintenance | `src/index.css:6`, `src/index.css:322` | Seventeen root declarations and mint-600 have no current source consumers | Remove only after checking non source asset and generator consumers | Dormant declarations need no runtime migration |
| LOW remaining | Maintenance | `src/index.css:82`, `src/index.css:151`, `src/index.css:260` | tactile-modal, route dash, scarcity, radar and device-chassis have no current source use | Check artifact consumers before deletion | Unused styles are separate from active UI defects |

## Every component inspected

| Components | Result |
| --- | --- |
| HomeDiscoveryScreen, FoodItemDetailScreen, QuickOrderModal | Consumer roles already in use; browser flow and states checked |
| WalkInMapModal | Scoped shared sheet; SVG duplicates correct palette; browser handoff checked |
| FeedbackModal | Migrated to roles; rating selection, textarea labeling and short viewport checked |
| LocationPermissionScreen | Replaced fixed legacy panel with scoped welcome; narrow keyboard path checked |
| InstallPrompt | Migrated styles and touch targets; simulated install event checked |
| BrandIntroSplash | Scoped page and surface roles; reduced motion skips startup delay |
| ErrorBoundary | Scoped fallback and preserved saved orders; recovery source inspected |
| MobileDeviceShell | Tracking works and persists; correct forest literals remain in global chrome |
| BusinessDashboardScreen, MenuStockManagementScreen, AddEditFoodItemScreen, VendorLoginModal | Deliberate light business palette retained; live cafe login and responsive stock and publishing UI checked |
| SplashOnboardingScreen | Legacy fixed artboard component has no source caller; inactive |
| ui/button, ui/card, ui/input, ui/badge | Legacy light primitives have no source callers; inactive |

The business hardcodes at dashboard 147 and 200, stock 67 and 78, publishing 162 and 214, and login 78 and 89 belong to the preserved theme. A future cleanup can replace identical values with existing neu and brand variables without turning the workspace dark. These are not mislabeled consumer migration failures.

## Coverage and verification

Production rollout completed at https://yemunnai.vercel.app. Both the consumer browser checks and real business login checks passed on that deployment. Legacy Supabase API keys were disabled after verifying the modern publishable and secret keys; the exposed old service key now returns 401. All five cafe logins, token replay protection, cafe isolation and lockout were checked again after retirement. New private cafe PINs remain in the ignored local `supabase/vendor-pins.local` file.

| Domain | Evidence | Result |
| --- | --- | --- |
| Accessibility | Native controls, field labels, shared inert hook, Chromium main flow, selected rating state, 44px checks | Inspected consumer paths pass; screen reader walk not verified |
| Layout | Responsive home, detail, order and map at 320, 375, 430, 768 and 1280 widths; short 400px sheets | Passed flow checks; actual browser 200 percent zoom not verified |
| Writing | Every audited action label and recovery path read against callers | False permission and destructive recovery claims removed |
| Typography | Declared scale, wrapping, mobile 16px inputs and tabular prices | Source checked; physical device font rendering not verified |
| Colors | Eleven exact text token pairs computed with WCAG luminance | 7.04:1 to 17.73:1, all above 4.5:1; full screenshot pixel sampling not performed |
| UI | Scoped surfaces, target sizes, selected cues and reduced motion guards | Source and normal runtime checked; 10 percent animation replay not verified |

Commands: `node scripts/check_consumer_colors.cjs` passed. `PLAYWRIGHT_PACKAGE=<installed module> node scripts/check_consumer_ui.cjs` passed with backend writes intercepted. Browser cases include empty search and deals, category and closed shop filters, review form, checkout failure and retry, token persistence, map handoff, install prompt and campus welcome. RTL and 200 percent root text resizing are checked as layout smoke tests, not substitutes for physical browser zoom or assistive technology.

`npx tsc --noEmit`, `npx oxlint`, and `npm run build` pass with zero compiler or linter errors. Existing lint warnings remain, including generator unused declarations at `scripts/generate_01_svg.cjs:37`, `scripts/generate_remaining_svgs.cjs:34`, and `scripts/generate_pwa_icons.cjs:12`. No new unused variables were introduced. The build watchdog also checks every emitted JS and CSS asset against 500000 bytes and queues changes without concurrent builds. It is running for this session; restart it with `node scripts/watch_quality.cjs --watch` in a terminal when needed. PowerShell uses npx.cmd and npm.cmd because this machine blocks .ps1 launchers.

Native installation, a real screen reader, full WCAG conformance, and 300 concurrent users remain not verified. No PR or commit was created. The refactor remains reviewable in the workspace.

Approve for the inspected source and consumer flow. Remaining duplication is documented above; this verdict does not claim untested platform coverage.

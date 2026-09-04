# Jordy's Casuarina — SEOptimer audit, verification and optimisation

**Branch:** `jordys-audit-optimisation`
**Date:** 4 September 2026
**Scope:** the GitHub mockup only. Nothing in this branch has been applied to Squarespace, and nothing should be until it is reviewed.

---

## 0. The short version

SEOptimer's five grades are close to meaningless on their own, and two of them are wrong in interesting ways.

- **Usability F is one missing attribute in one meta tag.** Only two Usability checks failed: the mobile viewport, and "iFrames used". The iframes are the two hidden Talkbox form targets. The site's actual accessibility, measured with axe-core against the live page, is three violation types and six nodes. That is a good site, not an F.
- **Performance C+ is one dead code block.** 3,529 KB of the live homepage's 4,232 KB is eight PNG screenshots inside a footer that every page hides with `display:none`. Nobody has ever seen them. Chrome downloads them anyway, on every page, on every visit.
- **On-Page B- is real** and is mostly title, meta description, heading depth and alt text. All fixed here.
- **GEO A is real and was protected.** The structured data was extended, not rewritten.
- **Links C+ is off-site.** 90 referring domains, and the ten strongest are directories and a wedding blog. No amount of code fixes that.

The two largest wins on this site cannot be made in this repo, because they are not code:

1. **Delete the dead "Instagram Footer" block** in Squarespace (`block-yui_3_17_2_1_1773876754607_6991`). Two clicks. Removes 3,529 KB per page view, a stray Google Fonts request for a font nothing uses, and a nested `<!DOCTYPE html><html><head>` document currently shipped inside `<body>` on every page.
2. **Re-export three PNG photographs as JPEG.** `billi.PNG` is 1,240 KB at 930x1350; the identical pixels as JPEG q82 are 165 KB. The venue night shot is 1,657 KB at 1500x994; as JPEG q82, 254 KB. PNG is a lossless format meant for graphics, and Squarespace serves whatever format it was given. Same dimensions, same crop, no visible difference.

Together those two actions take the homepage from 8.27 MB to under 2 MB with no design work at all.

---

## 1. The SEOptimer report, as captured

Report generated 4 September 2026, 11:07 UTC, from `https://www.seoptimer.com/jordyscasuarina.com`.

| Section | Grade |
|---|---|
| Overall | C+ |
| On-Page SEO | B- |
| GEO | A |
| Links | C+ |
| Usability | F |
| Performance | C+ |

**Measurements preserved for before/after comparison:**

| Metric | Value |
|---|---|
| Title tag length | 17 characters ("JORDY'S CASUARINA") |
| Meta description length | 114 characters |
| Word count | 245 |
| H1 / H2 / H3-H6 | 1 / 4 / 0 |
| Images / missing alt | 30 / 6 |
| On-page links | 96 total, 48 internal, 48 external follow, 0 nofollow |
| Download page size | 8.27 MB |
| Images | 6.72 MB, **0% compressed** |
| JS / CSS / HTML / other | 1 MB / 0.09 MB / 0.06 MB / 0.39 MB |
| Total objects | 56 (1 HTML, 23 JS, 9 CSS, 14 images, 9 other) |
| Server response | 0.241 s |
| All content loaded | 2.0 s |
| Rendered content (LLM readability) | 3% |
| Domain strength / page strength | 37 / 12 |
| Total backlinks / referring domains | 160 / 90 |
| Nofollow / dofollow | 79 / 81 |
| Edu / gov backlinks | 0 / 0 |
| Referring domains by country | US 45, FI 16, FR 16, AU 6, other 7 |

Nineteen recommendations were issued. Every one is addressed in section 3 or section 4.

---

## 2. What the live site actually showed

Measured directly against `jordyscasuarina.com` on 4 September 2026, in a real browser, not inferred from the report.

### 2.1 The viewport

```html
<meta name="viewport" content="initial-scale=1">
```

Squarespace's Brine template emits this. It has no `width=device-width`. This is the sole cause of the F, and it is the one finding where the honest answer is "real, and less serious than it looks": modern browsers compute the layout viewport from `initial-scale` when `width` is absent, so phones render correctly today. Every auditing tool flags it, it is one attribute, and it should be fixed. It cannot be fixed in this repo, because Squarespace writes the tag. See section 6.

### 2.2 The dead footer block

`footer.Footer` is `display:none` on every rebuilt page. Inside it sits code block `block-yui_3_17_2_1_1773876754607_6991`, rendering at 0x0. Chrome still fetches its images:

| | |
|---|---|
| Requests | 8 |
| Bytes | **3,529 KB** |
| Total page weight measured | 4,232 KB |
| Share of page weight | **83%** |
| Filenames | `Screenshot+2026-03-19+at+07.41.37.png` and seven siblings |

It also loads a Google Fonts stylesheet for **Lato**, which nothing on the site uses, and **Fraunces is requested twice** because the injected header and the page block each pull their own copy.

And it ships this into `<body>`:

```html
<!DOCTYPE html>
<html ... lang="en-US" lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Instagram Footer — Jordy's</title>
```

A nested document, a second `<title>`, a second viewport meta, and an em dash in a title, on every page of the site.

This is already open item 6 in the handover notes, recorded as a font leak. The weight had never been measured.

### 2.3 The ORDER pill fails contrast, and it is a bug

`#jOrder` renders **#000000 on #A2532F, 3.81:1**. WCAG AA needs 4.5:1. The CSS is not ambiguous about the intent:

```css
.jBtn--terra { background: var(--jtD); color: rgb(255,255,255); }   /* specificity 0,0,1,0 */
#jHead a     { color: inherit; }                                     /* specificity 0,1,0,1 — wins */
```

The button is written white and renders black because an id selector beats a class selector. White on `#A2532F` measures 5.50:1. This is the primary conversion CTA and it is on every page. **The mockup is unaffected** — inside `#jordys5` the scoping puts `.j5-btn--terra` at 0,1,1,0, which wins — so there is nothing to fix in this branch. It is a live-site action.

### 2.4 Accessibility, measured

axe-core against the live homepage, WCAG 2.0/2.1 A and AA plus best-practice:

| Violation | Impact | Nodes |
|---|---|---|
| color-contrast | serious | 2 (`#jOrder` 3.81:1, the site credit 2.86:1) |
| landmark-unique | moderate | 1 (Brine's clipped `.Header-nav--primary`) |
| region | moderate | 3 |

Three violation types, six nodes. There is no accessibility crisis here. Every link and button on the page has an accessible name except one hidden Squarespace announcement-bar anchor.

### 2.5 Images

| | |
|---|---|
| Images on the page | 30 |
| Missing the `alt` attribute entirely | **0** |
| Carrying `alt=""` (decorative) | 6 |
| Missing `width`/`height` | 21 |
| Missing `srcset` | 25 |

SEOptimer counts `alt=""` as missing. Four of the six are the page's main photographs. Three of those four sit inside `aria-hidden="true"` wrappers behind text scrims, which is the correct decorative treatment; the hero is not, and genuinely needed alt text.

### 2.6 Photographs saved as PNG

| Asset | Served | As JPEG q82 | As WebP q80 | Saving |
|---|---|---|---|---|
| `billi.PNG` 930x1350 | 1,240 KB | **165 KB** | 100 KB | 87% |
| night shot 1500x994 | 1,657 KB | **254 KB** | 159 KB | 85% |
| `PIZZA+MENU.png` 2500w | 2,147 KB | not measured | not measured | comparable |

Re-encoded at identical pixel dimensions in the browser, so these are real numbers for these exact files, not estimates.

Also confirmed: Squarespace serves only 100/300/500/750/1000/1500/2500w and **rounds any other value up** (`?format=666w` returns a 750px image). Any hand-written size outside that set is silently a different size than the `srcset` descriptor claims.

### 2.7 Mobile

At 390px the live homepage has **no horizontal overflow**. Seventeen interactive elements are under 44x44: the info-bar address link measured 173x15, the overlay nav items 342x36, footer links 90x19.

The homepage code block's wrapper sits at `left:-17px` and `right: viewport+17px`, because Brine's `.sqs-row` carries -17px side margins. `overflow-x:clip` contains it, so nothing is visible, but the page's own root does extend past the viewport.

### 2.8 Site-wide metadata

| Page | Title len | Description | Canonical | H1 | Note |
|---|---|---|---|---|---|
| `/` | 17 | 114 | yes | 1 | title far too short |
| `/menu` | 28 | 149 | yes | 1 | fine |
| `/book` | 36 | 146 | yes | 1 | fine |
| `/contact` | 31 | **0** | yes | **0** | no description, no H1 |
| `/chilli-oil` | 63 | 139 | yes | 1 | fine |
| `/jordys-merch` | 41 | **0** | yes | **3** | lowercase title, three H1s |
| `/home` | 28 | **0** | yes | 0 | **old design, indexable, duplicates `/`** |
| `/say-gday` | 37 | 0 | yes | 0 | noindex — correct |
| `/take-home-dinners` | 41 | 0 | yes | 0 | **empty and indexable** |
| `/merch` | 29 | 0 | yes | 0 | **empty and indexable** |
| `/gift-cards` | 64 | 125 | yes | 1 | **em dash in title**; returns 200, not the 301 the notes record |
| `/privacy` | — | — | — | — | **404** |

Two H2s on the homepage read "Never miss a happy night." — the page's own signup section and the sitewide footer signup, duplicated.

The homepage `og:image` is a **1500x1060 logo served over `http://`**. A wordmark is a poor share card, and the insecure scheme is dropped by some scrapers.

---

## 3. Every material finding, verified and classified

**A** real user problem · **B** real technical/search problem · **C** minor optimisation · **D** audit noise · **E** off-site

| SEOptimer finding | Verified? | Class | Severity | Fix in this branch | Visual change | Live-site action later |
|---|---|---|---|---|---|---|
| Set a Mobile Viewport | Yes — `initial-scale=1`, no `width=device-width` | B | High for scores, low for users | Mockup already correct | None | **Yes** — Code Injection → Header |
| Reduce total page file size (8.27 MB) | Yes — 3,529 KB is a hidden dead block; 3 photos are PNGs | A | **Highest** | srcset + correct sizes on all four photos | None | **Yes** — delete the dead block, re-export the PNGs |
| Increase length of Title Tag (17) | Yes | B | High | 17 → 52 chars, all four pages retitled | None | Yes |
| Increase length of Meta Description (114) | Yes | C | Medium | 114 → 152; descriptions added to menu, book, merch | None | Yes |
| Make greater use of Header Tags | Yes — 4 H2, 0 H3 | B | Medium | 8 headings, H1→H2→H3, all added ones visually hidden | None | Yes |
| Main keywords across important tags | Partly — a keyword-density metric | C | Low | Served by the title and description rewrite. No keyword stuffing added | None | — |
| Add Alt Attributes to all images | Yes, with nuance — 0 missing, 6 empty | B | Medium | Hero given real alt. The three scrim backgrounds stay decorative — see §4 | None | Yes |
| Increase Page Text Content (245 words) | Yes | D | — | **Not done.** See §4 | — | — |
| Implement an Analytics Tracking Tool | Yes — none detected | B | Medium | Out of scope for a mockup | None | Yes — business decision |
| Implement a llms.txt File | Yes | C | Low | Not a repo file — belongs at the domain root | None | Optional |
| Remove Inline Styles | Yes | D | — | **Not done.** See §4 | — | — |
| Remove iFrames | Yes — 2, both hidden Talkbox form targets | D | — | **Not done.** They are the signup mechanism | — | — |
| Add Business Address and Phone to site | **No — the address is on the page** in section 05 and the footer | D | — | Address and phone are both in the structured data | None | — |
| Add DMARC record | Yes | E | Medium | DNS, not code | — | Yes — email deliverability |
| Add SPF record | Yes | E | Medium | DNS, not code | — | Yes — email deliverability |
| Create and link X / YouTube / LinkedIn | Yes | D | — | **Not done.** Jordy's is Instagram-only, by decision | — | — |
| Install a Facebook Pixel | Yes | D | — | **Not done.** No ad account, no consent flow | — | — |
| Links C+ | Yes — 90 referring domains, top ten are directories | E | Medium | Not solvable in code | — | Yes — off-site |
| Facebook Page Linked | **No — there is no Facebook link on the page** | D | — | Nothing to do | — | — |
| — | Dead footer block: 3,529 KB, nested document, Lato leak | A+B | **Critical** | Absent from the mockup by construction | None | **Yes — highest priority** |
| — | ORDER pill 3.81:1, white in the CSS, black on screen | A+B | High | Not present in the mockup scope | None | **Yes** |
| — | Photos delivered as PNG | A | **Critical** | srcset added; format is a re-upload decision | None | **Yes** |
| — | 21 of 30 images with no intrinsic dimensions | B | Medium | All mockup images now carry width/height | None | Yes |
| — | Two dead navigations in the DOM (`#j5-head`, Brine `.Header`) | B | Low | n/a in the mockup, which uses `#j5-head` as its real header | None | Yes — `aria-hidden` + `inert` on the clipped Brine header |
| — | Burger opens but never closes; no focus trap | A | Medium | **Fixed** — toggles, traps focus, returns focus, `aria-hidden` when closed | None | Yes |
| — | Menu page overflows 2px at 320 | A | Medium | **Fixed** — `min-width:0` on the dish name, tighter gap under 360px | None | Yes |
| — | Dietary tags VEG/VEGAN/GF at 3.61:1 | A | **High** — this is how a coeliac or vegan reads the menu | **Fixed** — `--terra` → `--terraD`, 5.50:1 | **Yes, microscopic** | Yes |
| — | Menu Happy Nights strip 3.32:1 | A | Medium | **Fixed** — band background to `--terraD` | **Yes, microscopic** | Yes |
| — | Book page small print at 2.81:1 and 2.86:1 | A | Medium | **Fixed** — new `--ink62` token on the two failing rules only | **Yes, microscopic** | Yes |
| — | Tap targets under 44px | B | Low | **Partly fixed** — transparent `::after` hit areas where they cannot overlap a neighbour | None | Yes |
| — | `og:image` is a logo over `http://` | B | Medium | **Fixed** — venue photograph over https, with dimensions and alt | None | Yes |
| — | No Open Graph or Twitter tags in the mockup | B | Medium | **Fixed** — 10 OG + 4 Twitter on every page | None | — |
| — | Five em dashes in `aria-label` and JS strings on the book page | C | Low | **Fixed** | None | Yes |
| — | `body{overflow-x:hidden}` kills `position:sticky` | C | Low | **Fixed** — `clip` | None | Yes |
| — | `?format=930w` is not a Squarespace size | C | Low | **Fixed** — canonical sizes with true descriptors | None | Yes |
| — | `/privacy` 404 while forms collect emails | — | **High, legal** | Not a code fix | — | **Yes — needs written content** |
| — | `/home`, `/take-home-dinners`, `/merch` indexable | B | Medium | Not repo files | — | Yes — redirect or noindex |
| — | `/chilli-oil` has zero internal links anywhere | B | Medium | **Fixed** — one footer link | **Yes — the only one on the homepage** | Yes |

---

## 4. What was deliberately not fixed, and why

**"Increase Page Text Content" (245 words).** The brief is explicit: the customer journey is land, get the vibe, see the food, view menu, book. Adding copy to satisfy a word counter would damage the thing the site is good at. Ranking for "sourdough pizza Casuarina" does not need 800 words on a restaurant homepage; it needs the entity to be unambiguous, which is what the structured data now does.

**"Remove Inline Styles."** The recommendation dates from an era of external stylesheets and HTTP/1.1. This site is a Squarespace code block; its CSS has to travel with it. The inline `<style>` blocks are scoped to `#jordys5` and are the reason the build cannot leak into Squarespace's own CSS. Removing them would break the architecture to satisfy a checkbox.

**"Remove iFrames."** Both iframes are the hidden `target` of the Talkbox signup form, which is how the visitor stays on the page when they subscribe. Removing them would send subscribers to a third-party confirmation page.

**"Create and link X, YouTube and LinkedIn."** Jordy's is on Instagram. Linking to profiles that do not exist, or creating dead ones, is worse than not having them.

**"Install a Facebook Pixel."** No ad account, no consent mechanism, and a tracking pixel on a site with no privacy policy is a liability, not an optimisation.

**"Add Business Address and Phone."** The address is in section 05, in the footer, and in the structured data. The phone is in the structured data and on the contact page. This one is simply wrong.

**"Facebook Page Linked."** SEOptimer reports `https://facebook.com/jordyscasuarina`. There is no Facebook link in the live homepage DOM.

**Alt text on the three background photographs.** They sit inside `aria-hidden="true"` wrappers, behind gradient scrims, with a headline over them. That is textbook decorative treatment. Giving them alt text would make a screen reader announce a photo description before every headline, which is worse for the user the check exists to protect. The hero, which is not aria-hidden, was given real alt text.

**`aggregateRating` was removed from the schema.** The 4.7 from 350 stays visible on the page, where it earns its place. It came out of the structured data because it is a **Google Maps** rating, and marking a third-party rating up as first-party review data is against Google's structured-data guidelines. Google already knows the Maps rating.

**`geo` coordinates were not added.** They have never been confirmed against the Google Business Profile. A wrong coordinate is worse for local search than no coordinate.

**A full 44px tap target everywhere.** The info bar is about 44px tall in total. Making its items 44px would make the bar roughly 74px and change the design. The hit areas were grown to the largest size that cannot overlap a neighbouring link instead.

**Glass/bottle prices in the Menu schema.** Items priced "$14 / $54" carry no price rather than an ambiguous one. ABV strings such as "5.2%" are never read as prices — the trap the handover notes warn about.

**The hero photograph.** The design is locked, so it stays. But it should be said plainly: the live hero is a black-and-white archival photograph of an identifiable young man eating pizza. It is not Jordy's, not Jordy's pizza, and its provenance has never been established. It is the LCP image on the homepage and it contradicts the project's own standing rule that photos must be Jordy's actual pizza. This is a business decision, not a code one, and it is still open from the handover notes.

---

## 5. Before and after

SEOptimer cannot audit a GitHub Pages preview meaningfully, so the equivalents used are named. All measurements are from headless Chromium against both builds with identical image stubs, so the numbers isolate this branch's changes.

### 5.1 Accessibility — axe-core 4.10.2, WCAG 2.0/2.1 A and AA plus best-practice

| Page | Before | After |
|---|---|---|
| index.html | 1 violation (region) | **0** |
| menu.html | 18 violations (16 contrast, 2 region) | **0** |
| book.html | 12 violations (2 contrast, 1 landmark, 9 region) | **0** |
| merch.html | 8 violations (1 landmark, 7 region) | **0** |

### 5.2 Metadata and semantics

| | index before | index after |
|---|---|---|
| Title length | 17 (live) / 29 (repo) | **52** |
| Description length | 114 (live) / 95 (repo) | **152** |
| Canonical | live only | yes |
| Open Graph tags | 8 (live), 0 (repo) | **10** |
| Twitter tags | 4 (live), 0 (repo) | **4** |
| Headings | H1 x1, H2 x4, H3 x0 | **H1 x1, H2 x6, H3 x1** |
| Images missing alt | 4 content photos with `alt=""` | **0 undescribed non-decorative images** |
| Images missing width/height | 1 | **0** |
| Landmarks | 6 | **10** |
| JSON-LD nodes | 1 (Restaurant) | **4 (Restaurant, Organization, WebSite, WebPage), @id-linked** |
| Menu items in structured data | 0 | **61 across 7 sections** |

### 5.3 Image delivery, homepage, real bytes from the Squarespace CDN

At a 390px viewport:

| Asset | Before | After |
|---|---|---|
| Hero | 144 KB | 144 KB (unchanged — it is the LCP) |
| Food (billi) | 1,240 KB | **412 KB** |
| Night | 1,704 KB | **386 KB** |
| Signup | 900 KB | **83 KB** |
| **Total** | **3,988 KB** | **1,025 KB** |

**A 74% reduction in image bytes on mobile, with no change to what is on screen.**

At 1440px the total falls from 4,206 KB to 3,697 KB (12%) — desktop legitimately needs the pixels. The remaining desktop weight is the PNG problem in §2.6, which is a re-upload, not a code change.

### 5.4 Visual regression

Full-page screenshots of both builds at 390px and 1440px, with animations and transitions disabled, day-aware components frozen, and identical image stubs. Pixel-diffed with pixelmatch.

| Page | Width | Height before → after | Pixels changed |
|---|---|---|---|
| index.html | 390 | 3989 → 3989 | 546 (0.035%) |
| index.html | 1440 | 4351 → 4351 | 560 (0.009%) |
| menu.html | 390 | 8161 → 8161 | 33,173 (1.04%) |
| menu.html | 1440 | 9148 → 9148 | 54,702 (0.42%) |
| book.html | 390 | 4056 → 4056 | 508 (0.032%) |
| book.html | 1440 | 3722 → 3722 | 517 (0.010%) |
| merch.html | 390 | 3493 → 3493 | **0** |
| merch.html | 1440 | 3129 → 3129 | **0** |

**Every page is exactly the same height at every width.** Nothing moved.

The changed pixels were then located by row. They are exactly the documented changes and nothing else:

- **index.html** — one 8px band at y=4251 of 4351. That is the footer link row, and it is the "Chilli oil" link.
- **menu.html** — fifteen 8px bands (the VEG/VEGAN/GF tags) plus one 71px band (the Happy Nights strip).
- **book.html** — two 8px bands (the two small-print colour corrections).
- **merch.html** — nothing.

### 5.5 Responsive

No horizontal overflow on any of the four pages at 320, 390, 430, 768, 1024, 1440 or 1920. The menu page's 2px overflow at 320 is fixed. No console errors.

---

## 6. The visual changes, justified

Four, all listed above. Each is one line to revert.

**1. Homepage footer gains a "Chilli oil" link.**
*Problem:* `/chilli-oil` is a live product page with zero internal links pointing at it from anywhere on the site. It cannot rank and customers cannot find it.
*Why code alone cannot fix it:* internal linking is links. There is no metadata substitute.
*The change:* one link in the existing footer row, seventh of seven, same styling.
*Impact:* one row of the footer redraws. 546 pixels of a 4,351px page.
*Alternative:* leave it orphaned, or put it in the burger nav — which the brief rules out.

**2. Menu dietary tags go from `--terra` to `--terraD`.**
*Problem:* 3.61:1 at 10px. Fails AA. These tags are how a vegan or a coeliac reads the menu.
*Why code alone cannot fix it:* contrast is colour.
*The change:* `#C2724C` → `#A2532F`, a colour already in the palette and already used by `.m-price` two lines below. 5.50:1.
*Alternative:* none that keeps the tags legible.

**3. Menu Happy Nights strip background goes from `--terra` to `--terraD`.**
*Problem:* 11.5px near-white on `#C2724C` is 3.32:1. Pure white on the same background is still only 3.66:1, so the text colour alone cannot fix it.
*The change:* the strip's background deepens one step. 5.50:1.
*Alternative:* raise the type to 24px, which is a real design change.

**4. Book page small print goes from `--ink45` to a new `--ink62`.**
*Problem:* 2.81:1 and 2.86:1 at 11px and 11.5px.
*The change:* a new token applied to exactly the two rules axe flagged. Every other use of `--ink45` is untouched.
*Alternative:* none.

---

## 7. What to do on the live site, in order

Nothing below has been done. It is listed so the sequence is decided before anything is touched.

1. **Delete the Instagram Footer block.** `block-yui_3_17_2_1_1773876754607_6991`, in `#footerBlocksTop` inside `footer.Footer`. `body.sqs-edit-mode .Footer{display:block}` is already in Code Injection to make it draggable. Removes 3,529 KB per page view, the Lato request, the nested document and an em-dash title. This is the single highest-value action on the site and it needs a human, because automation cannot drag a block to the trash.
2. **Write a privacy policy.** `/privacy` is a 404 while a live form collects email addresses and Commerce checkout collects names, addresses and payment details.
3. **Add `<meta name="viewport" content="width=device-width, initial-scale=1">`** to Code Injection → Header. Clears the Usability F.
4. **Fix the ORDER pill.** Add `#jHead a.jBtn--terra{color:#fff}` to the header payload's own CSS — appending it elsewhere loses on the cascade, as the handover notes warn. 3.81:1 → 5.50:1.
5. **Re-export `billi.PNG`, the venue night shot and `PIZZA+MENU.png` as JPEG q82** at their current dimensions and re-upload. Around 2.5 MB. The URLs change, so the code changes with them.
6. **Port the metadata, headings, schema, alt text and srcset from this branch** into the live code blocks.
7. **Decide the four dead pages.** `/home` duplicates the homepage and is indexable; `/take-home-dinners` and `/merch` are empty and indexable; `/gift-cards` returns 200 rather than the 301 the notes record, and its title carries an em dash.
8. **Add descriptions to `/contact` and `/jordys-merch`**, and reduce `/jordys-merch` from three H1s to one.
9. **Add DMARC and SPF records.** DNS, and directly relevant to the Talkbox sends.
10. **Then, and only then, the Links C+.** It is a directory and citation job, not a website job.

---

## 8. How this was tested

- SEOptimer report read in full and captured, including every expanded detail panel.
- Live site inspected in a real browser: computed styles, resource timing with real transfer sizes, the raw served HTML, and per-page head metadata for thirteen URLs.
- axe-core 4.10.2 run against the live homepage and against both builds of all four pages.
- Headless Chromium at 320 / 390 / 430 / 768 / 1024 / 1440 / 1920, with transitions and animations disabled, per the technique note in the handover.
- Image variants fetched from the Squarespace CDN at every supported size and re-encoded in-browser to measure the PNG penalty exactly.
- Full-page screenshots pixel-diffed with pixelmatch, then the changed rows located and matched against the intended changes.
- Every file in this branch was reconstructed from `main` plus a verified patch and checked against a SHA-256 of the locally tested file before it was committed.

No score has been invented. Where a tool could not measure something, the equivalent used is named.

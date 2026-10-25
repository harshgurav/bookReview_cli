# 📖 Project Context & Database Journal (`PROJECT_JOURNAL.md`)

> **Purpose of this file:** This document serves as the persistent project memory and architectural journal for the **Digital Book Review Journal (`bookReview_cli`)** application. If you switch Google accounts or start a session with a new LLM/agent, point it to this file so it immediately understands the codebase, database structure, UI mockups, and current progress.

---

## 1. Project Overview
- **Project Root:** `C:\Users\Harsh Gurav\desktop\bookReview_cli`
- **React Application Root:** `book-review-app/` (Create React App with React 19)
- **Design References:**
  - `Screenshot 2026-10-24 013418.png` — Mockup for the full-width horizontal desktop **Wishlist Bookshelf** with plants, stacked/leaning books, and 3 shelf tiers.
  - `Screenshot 2026-10-24 013421.png` — Mockup for the **Book Review Journal Spread** (two-page open book layout with title box, author/bookType/genre/dates, Google Books API cover box, Rating card with 5 circles marked with `✕`, ruled Summary lines, and top-right `share` button).
  - `Screenshot 2026-10-24 195708.png` — Center spine binding arch and rough parchment paper grain specification.
  - `Screenshot 2026-10-24 205720.png` — Excalidraw Left Page Bottom Grid (Tall Taped Cover + Stacked Reading Log & Stamps).
  - `Screenshot 2026-10-24 220049.png` — Dynamic Right-Page Top Row (Rating on Left + Fiction "Scene u liked" vs Non-Fiction "Quote" on Right).
  - `e74e3aec7df391590b49a3b338b91416.jpg` — Reference photo for the **Physical Closed Leather Journal Cover** (cognac/saddle-brown full-grain leather, perimeter saddle stitching, debossed `JOURNAL` + botanical flourish, ribbed ribbon bookmark tail at bottom-left spine, and interactive stitched leather magnetic clasp strap on the right edge).

---

## 2. Database & Storage Architecture (What is in the Database)

The application supports a **hybrid dual-tier database architecture**:
1. **Client-Side Persistence (`localStorage`):** Zero-configuration local database used immediately out-of-the-box for offline demo and guest usage.
2. **Cloud Database (Firebase Cloud Firestore):** Cloud sync under collection `journals/{uid}` alongside Firebase Authentication (Email/Password & Google Sign-In) when Firebase environment keys are configured in `.env`.

### A. Client-Side `localStorage` Keys & Schemas

#### 1. `digital_book_reviews` (Saved Book Review Chapters)
Managed in [`BookReviewPage.js`](book-review-app/src/components/BookReviewPage.js). Stores an array of up to 17 recorded review chapters:
```json
{
  "id": 1761264000000,
  "title": "String (Book Title)",
  "coverUrl": "String (URL from Google Books, Open Library, or Base64 uploaded photo)",
  "apiSource": "String ('Google Books' | 'Open Library' | 'Custom Cover' | '')",
  "details": {
    "author": "String",
    "bookType": "String ('fiction' | 'nonFiction')",
    "genre": "String",
    "format": "String ('Hardcover' | 'E-Book' | 'Audio')",
    "dateStarted": "String (YYYY-MM-DD)",
    "dateEnded": "String (YYYY-MM-DD)",
    "favoriteQuote": "String (Scene u liked if fiction, Memorable quote if non-fiction)",
    "keyTakeaway": "String (Core theme / motif)"
  },
  "ratings": {
    "character": "Number (0-5)",
    "story": "Number (0-5)",
    "readability": "Number (0-5)",
    "overall": "Number (0-5)"
  },
  "waxSeal": "String ('★ Masterpiece' | '✦ Must Read' | '♛ Gold Standard' | '⚖ Mixed Tome')",
  "isRibbonBookmarked": "Boolean (Quick-saved with silk spine ribbon)",
  "isDogEared": "Boolean (Marked with ★ on top-right corner; automatically indexed on Spread 0)",
  "stamps": [
    {
      "id": "atmospheric",
      "symbol": "✦",
      "label": "ATMOSPHERIC",
      "sub": "IMMERSIVE VIBE",
      "color": "#7c2d12",
      "rotate": "-5.5deg",
      "shiftX": "-3px",
      "shiftY": "1px"
    }
  ],
  "summary": "String (User's review thoughts/summary notes)",
  "updatedAt": "String (Locale Date String)"
}
```

#### 2. `book_journal_current_user` (Active User Session)
Stores active reader identity:
```json
{
  "uid": "usr_1761264000000" | "guest_local" | "firebase_uid",
  "email": "reader@domain.com",
  "name": "Reader Name",
  "provider": "email" | "google" | "local",
  "isGuest": false
}
```

#### 3. `book_journal_accounts` (Local Account Registry)
Map of local accounts for zero-dependency offline authentication: `{ [cleanEmail]: { uid, email, name, password, provider } }`.

#### 4. `book_journal_quote_score` (Quote Riddle Game Score)
Integer count of correct book title guesses achieved in the Frontispiece quote guessing game.

#### 5. `book_wishlist_shelf` (Library Wishlist & Reading Shelf)
Managed in [`WishlistShelf.js`](book-review-app/src/components/WishlistShelf.js). Stores an array of bookshelf items across 3 shelves. If `localStorage` is empty, it seeds `DEFAULT_WISHLIST` containing **13 pre-loaded books**:
- **Shelf 1 (Top):**
  1. *The Hobbit* — J.R.R. Tolkien (`Fantasy`, `Want to Read`, `#2d6a4f`, Rating: 5)
  2. *Dune* — Frank Herbert (`Sci-Fi`, `Want to Read`, `#c77dff`, Rating: 5)
  3. *1984* — George Orwell (`Dystopian`, `Currently Reading`, `#e76f51`, Rating: 4)
  4. *Brave New World* — Aldous Huxley (`Sci-Fi`, `Want to Read`, `#2a9d8f`, Rating: 4)
  5. *Foundation* — Isaac Asimov (`Sci-Fi`, `Want to Read`, `#457b9d`, Rating: 5)
- **Shelf 2 (Middle):**
  6. *Sapiens* — Yuval Noah Harari (`Non-Fiction`, `Read`, `#e9c46a`, Rating: 5)
  7. *Atomic Habits* — James Clear (`Self-Help`, `Read`, `#f4a261`, Rating: 5)
  8. *Deep Work* — Cal Newport (`Productivity`, `Want to Read`, `#3d5a80`, Rating: 4)
  9. *Thinking, Fast & Slow* — Daniel Kahneman (`Psychology`, `Want to Read`, `#6d597a`, Rating: 4)
- **Shelf 3 (Bottom):**
  10. *The Great Gatsby* — F. Scott Fitzgerald (`Classic`, `Want to Read`, `#b56576`, Rating: 4)
  11. *To Kill a Mockingbird* — Harper Lee (`Fiction`, `Want to Read`, `#588157`, Rating: 5)
  12. *Klara and the Sun* — Kazuo Ishiguro (`Sci-Fi`, `Want to Read`, `#e07a5f`, Rating: 4)
  13. *Project Hail Mary* — Andy Weir (`Sci-Fi`, `Currently Reading`, `#3a86ff`, Rating: 5)
- **Static Decorative Stack Books on Shelves:**
  - Shelf 1 horizontal stack: *Dune Messiah*, *Children of Dune*, *God Emperor*
  - Shelf 2 leaning book & horizontal stack: *Odyssey* (Homer), *Meditations*, *Letters from a Stoic*
  - Shelf 3 horizontal stack: *Cosmos*, *Pale Blue Dot*

**Wishlist Book Schema:**
```json
{
  "id": 1,
  "shelf": "Number (1, 2, or 3)",
  "title": "String",
  "author": "String",
  "genre": "String",
  "status": "String ('Want to Read' | 'Currently Reading' | 'Read')",
  "color": "String (Hex Spine Color)",
  "height": "Number (px, 118-150)",
  "width": "Number (px, 28-44)",
  "rating": "Number (0-5)",
  "notes": "String"
}
```

#### 6. `book_journal_theme` (UI Theme Preference)
Stores the active theme string:
- `'vintage-parchment'` (Default antique cream parchment & deep leather binder)
- `'modern-obsidian'` (Dark slate/obsidian Notion-style editorial theme)

---

### B. Firebase Cloud Firestore Schema (`journals/{uid}`)
Document path: `journals/{userId}`
Fields:
- `savedReviews`: Array of review objects matching the chapter schema.
- `quoteScore`: Number tracking total right guesses in the frontispiece mini-game.
- `updatedAt`: Firestore Timestamp.

*Dual-Mode Operation:*
- **Without Firebase keys:** Full functionality via `localStorage` (Guest & local offline accounts).
- **With Firebase keys:** Cloud Firestore synchronization and Google / Email Authentication.

---

### C. External APIs Used
1. **Primary Book Lookup:** Google Books API (`https://www.googleapis.com/books/v1/volumes?q=<title>&maxResults=3`) — Auto-fetches book cover thumbnail, author, categories/genres, and descriptions after a 650ms debounce when typing a book title.
2. **Fallback Book Lookup:** Open Library Search & Covers API (`https://openlibrary.org/search.json?title=<title>&fields=key,title,author_name,cover_i,subject&limit=2` and `https://covers.openlibrary.org/b/id/<cover_i>-M.jpg`) — Used automatically if Google Books doesn't return a cover.

---

## 3. Component & File Structure
- [`book-review-app/src/App.js`](book-review-app/src/App.js) — Renders `BookReviewPage`.
- [`book-review-app/src/firebase.js`](book-review-app/src/firebase.js) — Firebase Client SDK initialization, Google Sign-In, Email/Password authentication, and Cloud Firestore read/write sync (`journals/{uid}`), with seamless local fallback when unconfigured.
- [`book-review-app/src/components/JournalOpeningFlow.js`](book-review-app/src/components/JournalOpeningFlow.js) — Multi-stage journal lifecycle components:
  1. `ClosedLeatherJournal`: Matches reference image with cognac/saddle-brown full-grain leather, perimeter saddle-stitching, debossed `JOURNAL` + botanical flourish, ribbon bookmark tail, and interactive draggable/pullable stitched magnetic leather clasp strap with login/signup card.
  2. `OpeningFrontispieceSpread`: Spread 0 containing the famous quote guessing mini-game (left page) with running counter (`✦ Right Guesses: X`), book title input box, author hints, and personal favorites index (right page) for all dog-eared (`★`) or ribbon-bookmarked chapters with click-to-jump navigation.
  3. `PageLimitDevModal`: Hidden 17-page cap modal with the exact developer AWS message and link to `github.com/harshgurav`.
  4. `FAMOUS_BOOK_QUOTES`: Curated database of literary quotes (*The Hobbit*, *Dune*, *1984*, *The Great Gatsby*, *Pride and Prejudice*, *To Kill a Mockingbird*, *Animal Farm*, *Fahrenheit 451*, *The Alchemist*, *The Little Prince*, *Moby-Dick*, *Frankenstein*) with alias matching and author hints.
- [`book-review-app/src/components/BookReviewPage.js`](book-review-app/src/components/BookReviewPage.js) — Main container managing 3-stage book lifecycle (`'closed'` -> `'frontispiece'` -> `'chapters'`), header controls (`< >` chapters, `17p Popup Test`, Moon/Sun theme, Fullscreen, Logout), auto-fetching covers, auto-classifying genre & fiction/non-fiction, saving/loading chapters, and sharing via base64 URL snapshots.
- [`book-review-app/src/components/BookDetails.js`](book-review-app/src/components/BookDetails.js) — Left page inputs for Author, BookType (`fiction` / `nonFiction` custom checkboxes), Genre, `date started`, and `date ended`.
- [`book-review-app/src/components/BookCover.js`](book-review-app/src/components/BookCover.js) — Displays fetched or uploaded cover image with 4 washi tapes and kraft scrapbook mount. Includes empty state ("Type the title", `+ Upload Image`, `Paste URL`) and `✕` removal button on active covers to clear and return to original placeholder.
- [`book-review-app/src/components/RatingCard.js`](book-review-app/src/components/RatingCard.js) — Right page rating box with 4 rows (`Character`, `Story` / `Clarity`, `Readability`, `Overall`) and 5 clickable circular dots marked with `✕`, plus the R1 Top-Right Corner Embossed Seal (`★ Masterpiece`, `✦ Must Read`, `♛ Gold Standard`, `⚖ Mixed Tome`).
- [`book-review-app/src/components/Summary.js`](book-review-app/src/components/Summary.js) — Ruled notebook textarea for writing book thoughts/summaries.
- [`book-review-app/src/components/ShareButton.js`](book-review-app/src/components/ShareButton.js) — Top-right `[ ↗ share ]` button generating self-contained read-only links (`?share=...`).
- [`book-review-app/src/components/WishlistShelf.js`](book-review-app/src/components/WishlistShelf.js) — Interactive 3-tier full-screen bookshelf with status filters, custom SVG vector art decor, 60fps 2D rigid-body physics engine (time-freeze stasis + pull shelf cascade drop), book quick modal, and add book modal.
- [`book-review-app/src/components/JournalPage.css`](book-review-app/src/components/JournalPage.css) — Complete styles for the journal, closed leather book, clasp strap, 3D page turn leaves, parchment textures, rough paper grain, stamps, seals, and modals.
- [`book-review-app/vercel.json`](book-review-app/vercel.json) — Vercel Single-Page Application (SPA) rewrite rules ensuring `?share=...` and direct routing work seamlessly on Vercel.
- [`book-review-app/.env.example`](book-review-app/.env.example) — Template for Firebase API keys (`REACT_APP_FIREBASE_API_KEY`, `REACT_APP_FIREBASE_AUTH_DOMAIN`, `REACT_APP_FIREBASE_PROJECT_ID`, etc.).

---

## 4. Verification & Ongoing Journal Log

### Prompt History & Milestones
- **Prompt 1 (V1 Initial Build - Completed & Approved by User):**
  - *Goal:* Build a browser-only digital Book Review Journal in React based on 2 Excalidraw screenshots (`Screenshot 2026-10-24 013418.png` = Landing/Wishlist page, `Screenshot 2026-10-24 013421.png` = Main Book Review page).
  - *Key Requirements:*
    - Start with V1 focusing on the main review page and its components with clean functional design.
    - Note on Excalidraw colors: The colors in the screenshot (red background, blue/green selected states) were diagram indicators (background vs. selected state), not strict literal color requirements.
    - Auto-fetch the Book Cover via Google Books API when the user types the title of the book into the title box.
  - *Outcome:* User confirmed V1 structure was created excellently.
- **Prompt 2 (Aesthetics, Full-Screen Desktop Utilization & Design Patent Context):**
  - *Aesthetic Options Selected:* The previous assistant offered 3 aesthetic directions. The user liked **both Option B & Option C** and requested a **top-right theme switcher button** (like a light/dark mode toggle) to switch between them:
    - **Option B (Vintage Leather & Parchment Journal):** Deep espresso/rich leather binder outside with bookmark ribbon, warm cream/textured parchment pages inside, classic serif typography with fountain pen ink aesthetic, golden or wax-seal accents for ratings.
    - **Option C (Modern Dark Minimalist / Notion-Style Editorial):** Sleek dark theme with glassmorphism/soft shadows, clean sans-serif typography, subtle borders, smooth hover micro-animations, vibrant neon/pastel accent tags.
  - *Layout & Space Utilization Requirements:*
    - **Use the whole desktop screen:** The app should not sit small in the center with empty space all around.
    - **Utilize all space inside the notebook layout:** In V1, the cover image was small with empty space below it. It needs to look like an actual book layout (e.g., text/elements above and below the cover image, filling the page naturally).
  - *Core Goal — Design Patent:* The user is preparing to **file this as a Design Patent**, and asked what additional novel components/elements should be added to make the journal layout richer, more distinctive, and patent-worthy.
- **Prompt 3 (Approved Design Patent Signature Elements — Pending Implementation Check):**
  - The previous assistant proposed 7 signature elements for the Design Patent, which the user liked:
    1. **Interactive Spine Ribbon (Silk Bookmark):** Dangling from the central spine divider; clicking triggers a smooth drop animation and acts as Quick Save / Bookmark.
    2. **Interactive Dog-Ear (Corner Page Fold):** Clickable folded triangle at the top-right corner of the journal page to mark a book as "Personal Favorite" or "Must Re-Read".
    3. **The Wax Seal / Stamp of Approval:** Customizable embossed circular stamp (e.g., `★ Masterpiece`, `Highly Recommended`, or `5-Star Seal`) stamped onto the corner of the rating card.
    4. **Rebalanced Left Page (Eliminating Dead Space):**
       - *Above Cover:* Grand Title Box, Author underline + BookType chips (Fiction / Non-Fiction) + Genre badge, and **Book Format indicator** (`📖 Physical Book`, `📱 E-Book`, `🎧 Audiobook`).
       - *Center:* Prominent realistic **3D Book Cover** with hardcover spine thickness, soft lighting reflection, and drop shadow.
       - *Below Cover:* **Reading Timeline** (`Date Started ➔ Date Ended` with auto-calculated duration like `"Read in 14 days"`) and **"Favorite Quote" Callout Scroll** (dedicated ruled parchment box with stylized quotation marks `“...”`).
    5. **Enriched Right Page:**
       - **Rating Plaque:** Interactive 5-circle rating markers with custom check/seal states.
       - **Vibe / Mood Badges:** Clickable tags (`🕯️ Atmospheric`, `🧠 Mind-Bending`, `⚡ Fast-Paced`, `😭 Tearjerker`, `☕ Cozy`).
       - **Summary Notebook Area:** Full-height notebook paper with ruled lines expanding vertically.
    6. **Full-Screen Desktop Layout (`100vw` / `100vh`):** Journal spreads across the desktop viewport like an open ledger on an executive desk.
    7. **Dual-Aesthetic Switcher (Top Right):**
       - `📜 Vintage Parchment & Leather` (Option B): Antique cream paper texture, deep leather binder, gold accents, fountain-pen ink vibes.
       - `🌌 Modern Obsidian & Editorial` (Option C): Sleek charcoal slate, frosted glass panels, neon emerald accents, crisp sans-serif typography.
  - *Audit of What Actually Happened in Code vs. This Plan:*
    - **NOT implemented yet in the current codebase!**
    - What IS currently in the code:
      - `WishlistShelf.js` (the 3-tier bookshelf page) was added.
      - A basic theme toggle between `vintage-leather` and `antique-parchment` was added, plus a Fullscreen API button.
      - **However**, the 7 Design Patent features (Spine Ribbon, Dog-Ear corner fold, Wax Seal stamp, Above/Center/Below left-page layout with Format indicator + auto-duration timeline + Favorite Quote box, Vibe/Mood badges, and the true Option B `Vintage Parchment` vs Option C `Modern Obsidian` themes) were **never written to the files** before the session had a Git/update issue.
      - Also, `git status` shows an outer `.git` with 0 commits and an inner `book-review-app/.git` with 1 commit (`7bb5962 feat: initial digital book review journal v1`) and uncommitted changes.
- **Current Status:**
  - Installed `lucide-react` and `html2canvas` in `book-review-app/package.json`.
  - **Step 1 Completed:** Replaced the generic AI-like dark red styling with an **Authentic Old Parchment & Leather-Bound Book (`vintage-parchment`)** design system in [`JournalPage.css`](book-review-app/src/components/JournalPage.css) and [`BookReviewPage.js`](book-review-app/src/components/BookReviewPage.js), paired with the **Modern Obsidian (`modern-obsidian`)** toggle.
  - **Step 2 Completed (Realistic Page-Edge Turn to Next/Prev Chapter + Journal Paper Tape Border on Cover):**
    - Added interactive **Page-Edge Curl hotspots** (`.page-edge-turner` & `.page-curl-flap`) on the outer right and left edges of the open book spread in [`BookReviewPage.js`](book-review-app/src/components/BookReviewPage.js) and [`JournalPage.css`](book-review-app/src/components/JournalPage.css). Hovering peels back the bottom corner of the page; clicking triggers a 3D perspective page-leaf flip (`flipPageNext` / `flipPagePrev`) across the spine to move between **Chapters (`Chapter I`, `Chapter II`, etc., with `Page 1–2`, `Page 3–4`)**, auto-saving the current review if a title is entered.
    - Added a **Scrapbook Kraft Mount & 4 Translucent Torn Washi/Masking Paper Tapes** (`.cover-scrapbook-mount` & `.journal-tape`) around the book cover in [`BookCover.js`](book-review-app/src/components/BookCover.js) so the cover looks physically taped onto the parchment page.
  - **Step 2.5 Completed (Curved Top/Bottom Page Arch at Center Spine + Rough Paper Grain Toggle):**
    - Inspected user screenshot (`Screenshot 2026-10-24 195708.png`) showing the top of the open book was a flat straight line.
    - Updated `.book-spread`, `.book-page.left-page`, `.book-page.right-page`, and `.book-spine` in [`JournalPage.css`](book-review-app/src/components/JournalPage.css) so each page arches gently and curves downward into the recessed central binding gutter (`border-top-right-radius: 52% 22px` on the left page and `border-top-left-radius: 52% 22px` on the right page, with recessed spine margin and individual page-stack shadows).
    - Added a temporary **`🌾 Grain: ON/OFF (Test)`** button right next to the Full-Screen button in [`BookReviewPage.js`](book-review-app/src/components/BookReviewPage.js) that toggles an SVG fractal-noise + fibrous parchment speckle overlay (`.grain-rough-active`) across the book pages.
  - **Step 3 Completed (Permanent Rough Grain, Curved Inner Components, Left-Page Layout Switcher, Right-Page 3 Stamp Slots + R1 Wax Seal):**
    - **Rough Grainy Paper Texture Made Permanent:** `.grain-rough-active` is now permanently applied to `.book-spread`.
    - **Repurposed Test Button (`Layout: New Enriched` ⇄ `Layout: Classic`):** The button beside Full-Screen now toggles between the original side-by-side left page (`classic`) and the new enriched layout (`stacked`: Author/Genre/BookType/Edition pills above -> Enlarged Taped Book Poster + Reading Chronicle & auto-calculated duration in center -> Memorable Quote Scroll below).
    - **Curved Inner Components:** Added `.left-curve-content` and `.right-curve-content` with subtle 3D perspective/skew contours and arched corners on the Title Box and Rating Card so the inner components visually curve into the central spine along with the pages.
    - **Right Page Split with 3 Literary Seal Stamps (Left) + Shifted Rating Card (Right) + R1 Top-Right Wax Seal:**
      - Shifted `RatingCard` toward the right and added a 3-slot **Literary Impression Stamp Column** on its left (`🕯️ Atmospheric`, `🧠 Mind-Bending`, `⚡ Page-Turner`, `😭 Tearjerker`, `☕ Cozy Read`, `🏛️ Philosophical`, `🗡️ Dark & Gritty`, `🌟 Life-Changing`, `🪶 Lyrical Prose` — clicking any of the 3 slots opens a stamp picker popover).
      - Added the **R1 Embossed Royal Wax Seal** (`.r1-wax-seal-stamp`) on the **top-right corner** of [`RatingCard.js`](book-review-app/src/components/RatingCard.js) (`★ Masterpiece`, `✦ Must Read`, `♛ Gold Standard`, `⚖ Mixed Tome` — cycles on click).
  - **Step 4 Completed (Excalidraw Left-Page Grid, Borderless Solid Ink-Filled Cutout Stamps, Custom Stamp Input, Emoji Removal):**
    - Inspected user Excalidraw markup (`Screenshot 2026-10-24 205720.png`).
    - **Left Page Bottom Grid:** Restructured `.excalidraw-left-bottom-grid` so the **Tall Taped Cover Page** spans the full bottom-left column (`min-height: 390px`), and the bottom-right column stacks the **Reading Log** on top and the **Memorable Quote** box directly below it.
    - **Removed Emojis Everywhere:** Replaced all colorful UI/stamp emojis (`🕯️`, `🧠`, `📖`, `⏳`, `💾`, etc.) with classical typographic symbols (`✦`, `❖`, `§`, `♛`, `†`, `❦`, `✠`, `★`, `¶`) or clean text.
    - **Borderless Solid Ink-Filled Cutout Stamps (`.solid-ink-cutout-stamp` & `.r1-wax-seal-stamp`):** Redesigned both the 3 Left-of-Rating stamps and the Top-Right Corner Seal so they have **no border**, a **solid distressed ink fill** (`mix-blend-mode: multiply` with paper-grain speckles), and **unfilled parchment cutout text** (`color: var(--journal-paper)`).
    - **Working Stamp List & Custom Stamp Input Box:** Fixed the 3D stacking context that previously clipped the stamp popover, added a dropdown menu for the top-right R1 Corner Seal, and added a **Custom Ink Stamp Creator form** inside the 3-stamp popover so the user can type any custom stamp text, sub-caption, and ink color and stamp it directly onto the page.
  - **Step 5 Completed (Interactive Silk Spine Bookmark Ribbon, Top-Right Dog-Ear Corner Page Fold, and `html2canvas` Snapshot Share):**
    - **Interactive Silk Spine Bookmark Ribbon (`.silk-spine-ribbon`):** Dangles down the central spine divider with gold edge stitching and a swallowtail V-notch tip. Clicking it drops the ribbon down (`360px`) with a spring animation and quick-saves/bookmarks the current chapter (`isRibbonBookmarked`).
    - **Interactive Top-Right Dog-Ear Corner Fold (`.dog-ear-corner-fold`):** Located at the top-right corner of the right page. Shows an **outlined star (`☆`)** when not favorited and a **filled glowing gold star (`★`)** when folded/favorited (removed the `"FAVORITE"` text label as requested).
    - **Shareable Browser Link Generator (`?share=<base64>`) + Read-Only Viewer Mode + Vercel Ready:**
      - Clicking `[ share ]` in [`BookReviewPage.js`](book-review-app/src/components/BookReviewPage.js) encodes the entire journal page state (title, coverUrl, details, ratings, waxSeal, 3 ink stamps, silk ribbon, dog-ear star, quote, summary, layout mode, and theme) into a self-contained URL (`${window.location.origin}${window.location.pathname}?share=...`) and opens a Parchment Share Link Modal.
      - **Strict Read-Only Mode for Link Holders (`isSharedReadOnlyView`):** When someone opens a `?share=...` link, the journal enters **Read-Only Shared View** (`.is-readonly-shared-spread`), locking all text inputs, checkboxes, ratings, stamps, seals, ribbons, dog-ears, and page-turn buttons (`pointer-events: none`), hiding the Save/Turn buttons and Wishlist tab, showing a `"Shared Journal View (Read-Only)"` badge, and providing a `"✦ Create Your Own Journal"` button to open a clean editable workspace.
      - **Vercel Deployment Ready:** Added [`book-review-app/vercel.json`](book-review-app/vercel.json) with SPA rewrites (`/(.*) -> /index.html`) so deployed Vercel URLs (`https://your-app.vercel.app/?share=...`) work seamlessly out of the box.
  - **Step 6 Completed (Variable-Size Stamps Pad on Left Page, Rating + Fiction/Non-Fiction Context Box on Right Page, Smart Auto-Fill on Title):**
    - Inspected `Screenshot 2026-10-24 220049.png`.
    - **Left Page Bottom-Right (`variable-stamps-pad-box`):** Moved Stamps under `Reading Log` (next to the tall Book Cover). Strictly locked the outer box height (`192px`) and inner canvas height (`142px`) so **the box size never increases** when adding stamps—only the stamps themselves shrink in size (`stamps-scale-1` down to `stamps-scale-many`) to fit inside the fixed box.
    - **Right Page Top Row (`Rating` Left + `Scene u liked` / `Quote` Right):**
      - Placed `RatingCard` on the top-left of the Right Page.
      - Placed `.right-top-context-card` on the top-right of the Right Page, which dynamically shows **`Scene u liked`** when `fiction` is checked, and **`Quote`** when `nonFiction` is checked.
    - **Smart Auto-Fill When Typing Book Title (`classifyBookMetadata` + `searchBookData`):**
      - Typing a book title now queries Google Books (`maxResults=3`) + Open Library (`fields=key,title,author_name,cover_i,subject`) and automatically updates **`Author`**, **`Genre`**, and **`BookType` (`fiction` vs `nonFiction`)**, which in turn automatically switches the Right Page top-right card between **`Scene u liked`** (`fiction`) and **`Quote`** (`nonFiction`).
    - **Step 6.5 Refinements (Drop-Up Stamp Menu, 6-Stamp Cap, Full-Height Stamp Scaling, Enlarged Rating Corner Seal & Favorite Star):**
      - Made `.seal-picker-popover` open **upwards (drop-up)** (`bottom: calc(100% - 32px)`) above the `INK STAMPS` box so it never overflows below the book UI.
      - Capped `INK STAMPS` at **6 maximum** (`(count/6)` header indicator and `Max 6 Reached` button state).
      - Re-engineered `.stamps-scale-1` through `.stamps-scale-6` inside the locked `142px` `.variable-stamps-canvas` so stamps fill the box generously at every count, leaving extra space for at most **1** additional stamp (and filling all 6 slots at 6/6).
      - Slightly increased the **Rating Corner Stamp** (`.r1-wax-seal-stamp` enlarged from `66px` to `80px` with larger typography) and the **Favorite Star Symbol** (`.dog-ear-star` enlarged to `20px` outlined / `26px` filled inside an enlarged `.dog-ear-corner-fold`).
      - Restored organic random stamp tilts (`-5.5deg` to `5.2deg`) and subtle X/Y scatter (`--stamp-shift-x`, `--stamp-shift-y`) so stamps in the left-bottom box never look linear.
  - **Step 7 Completed (Custom SVG Vector Art Shelf Decor + 60fps 2D Rigid-Body Bookshelf Physics Engine):**
    - Replaced all emoji plants/icons in [`WishlistShelf.js`](book-review-app/src/components/WishlistShelf.js) with 6 hand-crafted **SVG Vector Art Library Decorations** (`VectorMonsteraPot`, `VectorBrassGlobe`, `VectorQuillInkJar`, `VectorTrailingIvy`, `VectorHourglass`, `VectorChamberstickCandle`).
    - Built a live **60fps 2D Rigid-Body Physics Engine** (`engagePhysicsFromDOM`, `unfreezeTimeAndDropAll`, `stepPhysics` in [`WishlistShelf.js`](book-review-app/src/components/WishlistShelf.js)) with a two-phase **Time-Freeze / Unfreeze** mechanic:
      - **Phase 1 (Time-Freeze Stasis):** Grab and throw any book, stack book, or vector decor piece into mid-air—it glides out with your throw velocity, decelerates smoothly in zero-G, and suspends in mid-air while rotating in slow motion.
      - **Phase 2 (Pull Shelf for Cascading Shelf-to-Shelf Drop):** Pulling **Shelf 1** unfreezes time and drops Shelf 1's books (plus any mid-air thrown books) onto **Shelf 2**; pulling **Shelf 2** drops everything from Shelf 1 + Shelf 2 onto **Shelf 3**; pulling **Shelf 3** (or clicking **`✦ Pull Shelves (Unfreeze)`**) drops everything onto the bottom floor of the bookcase, with axis rotation locked (`b.omega = 0`) during the fall.
      - **`↺ Reset Shelf` Button:** Instantly restores all wooden planks, books, stacks, and vector decor back to their neat library positions and resets Time-Freeze mode.
  - **Step 8 & 9 Completed (Minimalist Icon-Only Header & Wishlist Controls):**
    - Replaced the `"Chapter I • Pages 1–2"` pill text in [`BookReviewPage.js`](book-review-app/src/components/BookReviewPage.js) with two clean `<` and `>` icon buttons (`.chapter-step-btn`).
    - Replaced the `"Obsidian Mode"` / `"Old Parchment"` text button with an icon-only **Crescent Moon (`Moon`) / Sun (`Sun`)** toggle button (`.theme-switch-btn.icon-only-header-btn`).
    - Replaced the `"Full-Screen"` / `"Exit Fullscreen"` text button with an icon-only **Arrow (`Maximize2` / `Minimize2`)** button (`.fullscreen-toggle-btn.icon-only-header-btn`).
    - Removed the temporary `Layout: New Enriched` test button from [`BookReviewPage.js`](book-review-app/src/components/BookReviewPage.js), locking in the new enriched layout permanently.
    - Refined [`WishlistShelf.js`](book-review-app/src/components/WishlistShelf.js) and [`WishlistShelf.css`](book-review-app/src/components/WishlistShelf.css):
      - Removed the `"Step 1: Throw..."` subtitle text from `.shelf-toolbar-left` and removed all text/buttons from the 3 wooden shelf planks (pulling or clicking any wooden shelf plank directly drops it).
      - Removed the `"Pull Shelves"` and `"Reset Shelf"` text buttons from `.shelf-toolbar-right`.
      - Placed a static icon-only **circular reset arrow button** (`.shelf-floating-reset-btn` with `<RotateCcw />`, `top: 14px; right: 16px;`) in the top-right corner of `.bookcase-frame` that **only appears when `isPhysicsActive` is `true`** (when books are thrown or shelves are pulled).
      - Changed `+ Add Book to Shelf` (`.btn-add-book`) to an icon-only `+` button (`<Plus />`).
      - Removed `'Read'` from the Wishlist filter slider (`['All', 'Want to Read', 'Currently Reading']`).
  - **Step 10 Completed (Logical Loopholes Fixed & Vercel Production Readiness):**
    - **Prevented Infinite Blank Chapter Turning:** Blocked turning forward (`>`) past an empty new chapter (`!title.trim() && chapterIndex >= savedReviews.length`) in [`BookReviewPage.js`](book-review-app/src/components/BookReviewPage.js) so `chapterIndex` and `savedReviews` never desync.
    - **Auto-Save on Tab Switch & Chapter Card Selection:** Switching from `Review Ledger` to `Wishlist Shelf` or clicking a recorded chapter card (`handleLoadReview`) now calls `persistCurrentChapter()` first so unsaved edits are never lost.
    - **Fixed Chapter Deletion Index Clamping:** Clamped `newIdx` to `updated.length > 0 ? Math.min(chapterIndex, updated.length - 1) : 0` in `handleDeleteSavedReview`.
    - **Wishlist → Review Graduation & Note Carryover:** Reviewing and saving a book from the Wishlist automatically removes it from `book_wishlist_shelf` in `localStorage` and carries over `book.notes` into the chapter's `Summary`.
    - **Normalized Legacy `'Read'` Status & Enabled Decorative Books on Wishlist:** Normalized cached `'Read'` items in `localStorage` to `'Want to Read'`, and made all horizontal/leaning stack books (*Dune Messiah*, *The Odyssey*, *Meditations*, *Cosmos*, etc.) clickable to open the Quick Card and review in the journal.
    - **Fixed Rating Typos, Default Score & Non-Fiction Criteria ([`RatingCard.js`](book-review-app/src/components/RatingCard.js)):** Fixed spelling (`Character`, `Story`, `Readability`, `Overall`), dynamicized criteria for `nonFiction` (`Insight`, `Clarity`, `Readability`, `Overall`), reset default blank-page ratings to `0`, and added outside-click closing for the Corner Seal menu.
    - **Added Reading Log Date Validation & Custom Cover Upload/URL Fallback ([`BookCover.js`](book-review-app/src/components/BookCover.js)):** Added `min`/`max` date constraints between `Date Started` and `Date Ended`, updated the empty cover placeholder text to `"Type the title"` with `+ Upload Image` and `Paste URL` buttons below, and added a `✕` remove button on active book covers to clear an uploaded/fetched cover and return to the original Book Cover placeholder UI.
    - **Vercel CI Build Cleanliness:** Verified zero ESLint warnings/errors so Vercel's `CI=true` build succeeds without warnings-as-errors failures.
  - **Step 11 Completed (Closed Leather Journal Cover with Clasp, Login / Firebase Sync, Frontispiece Quote Game & Favorites Index, and 17-Page Cap Popup):**
    - Created [`JournalOpeningFlow.js`](book-review-app/src/components/JournalOpeningFlow.js) and [`firebase.js`](book-review-app/src/firebase.js), and wired the 3-stage book lifecycle (`'closed'` -> `'frontispiece'` -> `'chapters'`) into [`BookReviewPage.js`](book-review-app/src/components/BookReviewPage.js).
    - **Stage 1 (`ClosedLeatherJournal`):** Recreated the saddle-brown full-grain leather journal from the reference image (`e74e3aec7df391590b49a3b338b91416.jpg`) with perimeter saddle-stitching, debossed `JOURNAL` + botanical leaf flourish, bottom-left ribbed bookmark tail, and an interactive right-edge leather clasp strap that unfastens when dragged/pulled with the mouse.
    - **Authentication & Cloud/Local Storage (`firebase.js`):** Unfastening the clasp prompts the user to Sign In / Create Account (via Firebase Auth + Firestore `journals/{uid}` when `REACT_APP_FIREBASE_*` keys are configured, with automatic `localStorage` fallback) or Continue as Guest, then swings the leather cover open in 3D.
    - **Stage 2 (`OpeningFrontispieceSpread` — Spread 0):**
      - **Left Page:** Famous Book Quote Guessing Game with a top counter (`✦ Right Guesses: X`), quote passage, book title answer box, Hint / Reveal / Next Quote controls.
      - **Right Page:** Index of Personal Favorites listing all dog-eared (`★`) or silk-ribbon bookmarked books with click-to-jump navigation, plus page-turn controls (`<` closes the cover, `>` turns to Chapter I).
    - **Hidden 17-Page Cap + Dev AWS Popup (`PageLimitDevModal`) + Header Test Button:** Enforced a silent cap of 17 review chapters (`MAX_FREE_CHAPTERS = 17`) that triggers the popup message (`"the dev has no money to put this on aws if u want dev should add more pages then below is his details send your money there"` + `github.com/harshgurav`), and added a **`17p Popup Test`** toggle button in the top header bar.
  - **Step 12 Completed (Production CI Verification & Full Lifecycle Audit):**
    - **Production CI Build Verification:** Successfully executed `$env:CI="true"; npm run build` with zero warnings and zero errors. Output verified in `book-review-app/build` (267.15 kB main JS bundle, 15.02 kB CSS bundle), fully prepared for zero-friction Vercel deployments.
    - **Live Development Server Check:** Verified active background dev server task on `http://localhost:3001` compiling cleanly (`Compiled successfully!`).
    - **End-to-End Architectural Integrity Audit:**
      - Confirmed physical leather journal cover matches reference photo `e74e3aec7df391590b49a3b338b91416.jpg` with interactive pull/drag clasp strap.
      - Confirmed Spread 0 quote guessing game has dynamic answer alias evaluation, author hint toggle, answer reveal, and persistent score counter (`✦ Right Guesses: X`).
      - Confirmed Spread 0 favorites ledger auto-syncs with dog-eared (`★`) chapters and silk-ribbon bookmarks with instant jump navigation.
      - Confirmed custom cover upload supports canvas-compressed photos with quick `✕` removal resetting back to "Type the title" placeholder.
      - Confirmed hidden 17-page cap triggers the exact dev modal (`"the dev has no money to put this on aws if u want dev should add more pages then below is his details send your money there"` + `github.com/harshgurav`) and header test toggle button is responsive.
      - Confirmed dual-storage works without external dependencies locally and automatically hooks into Firebase Authentication and Cloud Firestore when environment variables are supplied.
  - **Step 13 Completed (Aspect Ratio Harmonization & Unified 3D Page-Flip Opening/Closing Animation):**
    - **Closed Book & Open Book Aspect Ratio Harmonization:** Harmonized the closed leather book dimensions with the open book spread: matched the exact height (`min-height: calc(100vh - 210px)`) and width of one half of the book spread (`calc(50% - 14px); max-width: 660px;`). The closed book's aspect ratio now matches the open book page 1:1, eliminating all visual size and proportion jumping.
    - **Unified Container Proportions:** Added a centered `max-width: 1380px` on both `.book-spread` and `.closed-journal-stage`, ensuring that ultra-wide monitors do not unnaturally stretch book pages into landscape shapes.
    - **Identical 3D Page-Flip Animation for Book Opening & Closing:**
      - Replaced the simple fade/swing with `.turning-cover-leaf` using `@keyframes flipCoverLeafOpen` and `@keyframes flipCoverLeafClose`.
      - Mirrors the exact 3D physics, perspective, curve (`cubic-bezier(0.645, 0.045, 0.355, 1)`), timing (`0.75s`), and depth shadow of `@keyframes flipPageNext` and `@keyframes flipPagePrev`.
      - **Front Face:** Saddle-brown leather front cover with debossed `JOURNAL` + botanical flourish, perimeter saddle stitching, and clasp.
      - **Back Face:** Inside front cover marbled endpaper / parchment with `✦ EX LIBRIS ✦` seal.
      - When unclasped, the leather cover physically turns over the spine 180° into Spread 0; clicking "Close Journal Cover" smoothly turns the cover back 180° and snaps shut.
    - **Deployment & Credential Provisioning Documentation:** Provided complete instructions for Firebase ("firewall") credentials and 1-click Vercel deployment.
  - Ready for user testing and next instructions.

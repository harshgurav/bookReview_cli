import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Plus } from 'lucide-react';
import './WishlistShelf.css';

const DEFAULT_WISHLIST = [
  // Shelf 1 (Top)
  { id: 1, shelf: 1, title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy', status: 'Want to Read', color: '#2d6a4f', height: 132, width: 34, rating: 5, notes: 'Classic adventure' },
  { id: 2, shelf: 1, title: 'Dune', author: 'Frank Herbert', genre: 'Sci-Fi', status: 'Want to Read', color: '#8f4731', height: 144, width: 38, rating: 5, notes: 'Must read before Part 2' },
  { id: 3, shelf: 1, title: '1984', author: 'George Orwell', genre: 'Dystopian', status: 'Currently Reading', color: '#9e2a2b', height: 126, width: 32, rating: 4, notes: 'Big Brother is watching' },
  { id: 4, shelf: 1, title: 'Brave New World', author: 'Aldous Huxley', genre: 'Sci-Fi', status: 'Want to Read', color: '#2a6f68', height: 122, width: 31, rating: 4, notes: 'Complement to 1984' },
  { id: 5, shelf: 1, title: 'Foundation', author: 'Isaac Asimov', genre: 'Sci-Fi', status: 'Want to Read', color: '#355c7d', height: 138, width: 36, rating: 5, notes: 'Psychohistory epic' },

  // Shelf 2 (Middle)
  { id: 6, shelf: 2, title: 'Sapiens', author: 'Yuval Noah Harari', genre: 'Non-Fiction', status: 'Currently Reading', color: '#b58328', height: 145, width: 42, rating: 5, notes: 'A brief history of humankind' },
  { id: 7, shelf: 2, title: 'Atomic Habits', author: 'James Clear', genre: 'Self-Help', status: 'Want to Read', color: '#b85d27', height: 128, width: 34, rating: 5, notes: 'Tiny changes, remarkable results' },
  { id: 8, shelf: 2, title: 'Deep Work', author: 'Cal Newport', genre: 'Productivity', status: 'Want to Read', color: '#2f4858', height: 134, width: 33, rating: 4, notes: 'Rules for focused success' },
  { id: 9, shelf: 2, title: 'Thinking, Fast & Slow', author: 'Daniel Kahneman', genre: 'Psychology', status: 'Want to Read', color: '#5e435d', height: 148, width: 44, rating: 4, notes: 'Two systems of thought' },

  // Shelf 3 (Bottom)
  { id: 10, shelf: 3, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Classic', status: 'Want to Read', color: '#843b4b', height: 120, width: 30, rating: 4, notes: 'Roaring twenties' },
  { id: 11, shelf: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Fiction', status: 'Want to Read', color: '#4a6b49', height: 136, width: 36, rating: 5, notes: 'Courage and empathy' },
  { id: 12, shelf: 3, title: 'Klara and the Sun', author: 'Kazuo Ishiguro', genre: 'Sci-Fi', status: 'Want to Read', color: '#b5563e', height: 130, width: 33, rating: 4, notes: 'AI heart & observation' },
  { id: 13, shelf: 3, title: 'Project Hail Mary', author: 'Andy Weir', genre: 'Sci-Fi', status: 'Currently Reading', color: '#28527a', height: 142, width: 40, rating: 5, notes: 'Science survival story' },
];

const DECORATIVE_STACK_BOOKS = [
  { id: 'stack-1a', shelf: 1, title: 'Dune Messiah', author: 'Frank Herbert', genre: 'Sci-Fi', status: 'Want to Read', color: '#6b3e26', width: 108, height: 22, notes: 'Second book in the Dune saga', isStackBook: true },
  { id: 'stack-1b', shelf: 1, title: 'Children of Dune', author: 'Frank Herbert', genre: 'Sci-Fi', status: 'Want to Read', color: '#8c2d19', width: 118, height: 22, notes: 'Third book in the Dune saga', isStackBook: true },
  { id: 'stack-1c', shelf: 1, title: 'God Emperor of Dune', author: 'Frank Herbert', genre: 'Sci-Fi', status: 'Want to Read', color: '#2b580c', width: 98, height: 22, notes: 'Fourth book in the Dune saga', isStackBook: true },
  { id: 'lean-2', shelf: 2, title: 'The Odyssey', author: 'Homer', genre: 'Classic Epic', status: 'Want to Read', color: '#5a2a55', width: 34, height: 136, isLeaning: true, notes: 'Ancient Greek epic poem', isStackBook: true },
  { id: 'stack-2a', shelf: 2, title: 'Meditations', author: 'Marcus Aurelius', genre: 'Philosophy', status: 'Want to Read', color: '#2c5d63', width: 112, height: 22, notes: 'Stoic reflections and private notes', isStackBook: true },
  { id: 'stack-2b', shelf: 2, title: 'Letters from a Stoic', author: 'Seneca', genre: 'Philosophy', status: 'Want to Read', color: '#a36826', width: 122, height: 22, notes: 'Moral epistles to Lucilius', isStackBook: true },
  { id: 'stack-3a', shelf: 3, title: 'Cosmos', author: 'Carl Sagan', genre: 'Science & Nature', status: 'Want to Read', color: '#394867', width: 106, height: 22, notes: 'Personal voyage through the universe', isStackBook: true },
  { id: 'stack-3b', shelf: 3, title: 'Pale Blue Dot', author: 'Carl Sagan', genre: 'Science & Nature', status: 'Want to Read', color: '#7a3e3e', width: 116, height: 22, notes: 'A vision of the human future in space', isStackBook: true },
];

/* ==========================================================================
   CUSTOM VECTOR ART SHELF DECORATIONS (ZERO EMOJIS)
   ========================================================================== */

const VectorMonsteraPot = () => (
  <svg width="68" height="86" viewBox="0 0 68 86" fill="none" xmlns="http://www.w3.org/2000/svg" className="vector-shelf-svg">
    {/* Back Leaves */}
    <path d="M34 52 C24 38, 8 34, 6 18 C16 14, 28 22, 34 44 Z" fill="#1b4332" />
    <path d="M34 50 C44 34, 60 30, 62 14 C50 12, 38 22, 34 44 Z" fill="#2d6a4f" />
    {/* Fenestrated Monstera Center & Side Leaves */}
    <path
      d="M34 54 C20 44, 10 30, 14 14 C20 10, 28 16, 26 22 C29 18, 33 12, 35 8 C41 12, 44 18, 40 24 C45 20, 52 22, 54 28 C52 40, 42 48, 34 54 Z"
      fill="#40916c"
      stroke="#1b4332"
      strokeWidth="1.2"
    />
    {/* Leaf Veins & Cutouts */}
    <path d="M34 54 L34 14" stroke="#74c69d" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M34 36 L22 26 M34 30 L45 23 M34 42 L24 36" stroke="#74c69d" strokeWidth="1.1" strokeLinecap="round" />
    <ellipse cx="26" cy="30" rx="2.8" ry="1.3" transform="rotate(-25 26 30)" fill="#18120e" />
    <ellipse cx="42" cy="33" rx="3" ry="1.4" transform="rotate(25 42 33)" fill="#18120e" />
    {/* Terracotta Clay Pot */}
    <ellipse cx="34" cy="56" rx="17" ry="3.5" fill="#3d2314" />
    <rect x="16" y="54" width="36" height="6" rx="2" fill="#c86d51" stroke="#5c2c16" strokeWidth="1.2" />
    <path d="M19 60 L49 60 L45 83 C45 84.5 43.5 85 42 85 L26 85 C24.5 85 23 84.5 23 83 Z" fill="#b05338" stroke="#5c2c16" strokeWidth="1.2" />
    <path d="M22 65 L46 65" stroke="#d98a6c" strokeWidth="1" strokeOpacity="0.6" />
  </svg>
);

const VectorBrassGlobe = () => (
  <svg width="64" height="84" viewBox="0 0 64 84" fill="none" xmlns="http://www.w3.org/2000/svg" className="vector-shelf-svg">
    {/* Pedestal Base */}
    <path d="M18 82 L46 82 L42 77 L22 77 Z" fill="#b08d32" stroke="#4a3710" strokeWidth="1.2" />
    <rect x="29" y="65" width="6" height="12" fill="#9a7b2c" stroke="#4a3710" strokeWidth="1.1" />
    {/* Meridian Brass Arc */}
    <path d="M32 10 A26 26 0 0 1 32 64" stroke="#d4af37" strokeWidth="3" fill="none" />
    <path d="M32 8 L32 66" stroke="#b08d32" strokeWidth="1.5" transform="rotate(18 32 37)" />
    {/* Globe Sphere */}
    <circle cx="31" cy="37" r="20" fill="#2b4c59" stroke="#d4af37" strokeWidth="1.5" />
    {/* Parchment Continents */}
    <path d="M20 26 C25 22, 31 25, 33 30 C35 35, 29 41, 24 39 C19 37, 17 30, 20 26 Z" fill="#c2a675" opacity="0.88" />
    <path d="M36 34 C41 33, 46 37, 45 44 C44 49, 38 51, 35 46 C33 42, 34 36, 36 34 Z" fill="#c2a675" opacity="0.88" />
    {/* Latitude/Longitude Lines */}
    <ellipse cx="31" cy="37" rx="20" ry="7" stroke="#f4ead5" strokeOpacity="0.35" strokeWidth="0.9" />
    <ellipse cx="31" cy="37" rx="9" ry="20" stroke="#f4ead5" strokeOpacity="0.35" strokeWidth="0.9" />
  </svg>
);

const VectorQuillInkJar = () => (
  <svg width="62" height="86" viewBox="0 0 62 86" fill="none" xmlns="http://www.w3.org/2000/svg" className="vector-shelf-svg">
    {/* Feather Quill */}
    <path d="M30 68 L48 10" stroke="#d4af37" strokeWidth="1.8" strokeLinecap="round" />
    <path
      d="M48 10 C38 14, 31 26, 31 40 C36 37, 40 34, 38 43 C44 39, 52 28, 54 16 C54 11, 51 9, 48 10 Z"
      fill="#f4ead5"
      stroke="#8c7355"
      strokeWidth="1.1"
    />
    {/* Vintage Fountain Pen */}
    <path d="M26 68 L15 26 L18 20 L22 25 L30 68" fill="#7c2d12" stroke="#3d1708" strokeWidth="1.1" />
    <path d="M18 20 L16 14 L20 19 Z" fill="#d4af37" />
    {/* Apothecary Glass Jar */}
    <rect x="19" y="46" width="24" height="4" rx="1.5" fill="#c2a675" stroke="#5c4938" strokeWidth="1.1" />
    <rect x="16" y="50" width="30" height="34" rx="4" fill="rgba(220, 235, 240, 0.22)" stroke="#a3b8c2" strokeWidth="1.4" />
    {/* Dark Ink Pool at Bottom of Jar */}
    <path d="M17.5 70 L44.5 70 L44.5 81 C44.5 82.5 43.5 83 42 83 L20 83 C18.5 83 17.5 82.5 17.5 81 Z" fill="#1d2d44" />
    {/* Glass Highlight */}
    <line x1="20" y1="54" x2="20" y2="78" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const VectorTrailingIvy = () => (
  <svg width="70" height="105" viewBox="0 0 70 105" fill="none" xmlns="http://www.w3.org/2000/svg" className="vector-shelf-svg trailing-ivy-svg">
    {/* Top Foliage Crown */}
    <circle cx="24" cy="30" r="9" fill="#2d6a4f" />
    <circle cx="35" cy="26" r="11" fill="#40916c" />
    <circle cx="46" cy="31" r="8.5" fill="#1b4332" />
    {/* Glazed Ceramic Planter */}
    <rect x="16" y="34" width="38" height="6" rx="2" fill="#e5dec9" stroke="#6b5e4c" strokeWidth="1.2" />
    <path d="M19 40 L51 40 L47 64 C47 65.5 45 66 43 66 L27 66 C25 66 23 65.5 23 64 Z" fill="#d6cebf" stroke="#6b5e4c" strokeWidth="1.2" />
    <path d="M21 48 L49 48" stroke="#8a7968" strokeWidth="1.2" strokeDasharray="3 2" />
    {/* Cascading Ivy Vines Hanging Down */}
    <path d="M26 42 C22 58, 16 74, 20 96" stroke="#2d6a4f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <path d="M38 42 C42 60, 48 76, 43 100" stroke="#40916c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <path d="M47 40 C54 54, 58 68, 54 86" stroke="#1b4332" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    {/* Ivy Leaves Along Vines */}
    <path d="M22 55 C15 53, 14 60, 21 61 Z" fill="#52b788" />
    <path d="M20 70 C27 68, 27 75, 19 76 Z" fill="#40916c" />
    <path d="M19 85 C12 84, 13 91, 20 91 Z" fill="#52b788" />
    <path d="M41 58 C48 56, 48 63, 41 64 Z" fill="#52b788" />
    <path d="M44 74 C37 73, 37 80, 44 80 Z" fill="#2d6a4f" />
    <path d="M44 90 C51 89, 50 96, 43 96 Z" fill="#52b788" />
    <path d="M55 62 C61 60, 61 67, 54 68 Z" fill="#40916c" />
    <path d="M55 78 C49 77, 49 83, 55 84 Z" fill="#52b788" />
  </svg>
);

const VectorHourglass = () => (
  <svg width="58" height="82" viewBox="0 0 58 82" fill="none" xmlns="http://www.w3.org/2000/svg" className="vector-shelf-svg">
    {/* Top & Bottom Brass Plates */}
    <rect x="11" y="12" width="36" height="5" rx="2" fill="#d4af37" stroke="#594312" strokeWidth="1.2" />
    <rect x="11" y="75" width="36" height="5" rx="2" fill="#d4af37" stroke="#594312" strokeWidth="1.2" />
    {/* Side Brass Pillars */}
    <line x1="15" y1="17" x2="15" y2="75" stroke="#b08d32" strokeWidth="2.4" />
    <line x1="43" y1="17" x2="43" y2="75" stroke="#b08d32" strokeWidth="2.4" />
    {/* Blown Glass Bulbs */}
    <path
      d="M19 17 C19 32, 27 40, 29 46 C31 40, 39 32, 39 17 Z"
      fill="rgba(244, 234, 213, 0.18)"
      stroke="#c7d3d8"
      strokeWidth="1.4"
    />
    <path
      d="M19 75 C19 60, 27 52, 29 46 C31 52, 39 60, 39 75 Z"
      fill="rgba(244, 234, 213, 0.18)"
      stroke="#c7d3d8"
      strokeWidth="1.4"
    />
    {/* Golden Sand Flowing */}
    <path d="M22 30 C25 36, 28 41, 29 45 C30 41, 33 36, 36 30 Z" fill="#e9c46a" />
    <line x1="29" y1="45" x2="29" y2="66" stroke="#e9c46a" strokeWidth="1.6" strokeDasharray="2 1.5" />
    <path d="M20 74 C23 66, 27 64, 29 64 C31 64, 35 66, 38 74 Z" fill="#e9c46a" />
  </svg>
);

const VectorChamberstickCandle = () => (
  <svg width="64" height="82" viewBox="0 0 64 82" fill="none" xmlns="http://www.w3.org/2000/svg" className="vector-shelf-svg">
    {/* Warm Candle Aura */}
    <circle cx="30" cy="18" r="14" fill="rgba(246, 224, 94, 0.22)" />
    {/* Outer & Inner Vector Flame */}
    <path d="M30 5 C25 13, 24 20, 30 24 C36 20, 35 13, 30 5 Z" fill="#f59e0b" />
    <path d="M30 10 C27 15, 27 20, 30 23 C33 20, 33 15, 30 10 Z" fill="#fef08a" />
    {/* Wick */}
    <line x1="30" y1="24" x2="30" y2="28" stroke="#2b1710" strokeWidth="1.4" />
    {/* Beeswax Pillar Candle & Drips */}
    <rect x="22" y="28" width="16" height="38" rx="2" fill="#f3e5ab" stroke="#9c824a" strokeWidth="1.2" />
    <path d="M22 29 C25 31, 26 36, 25 40 C24 36, 24 32, 27 32 C29 32, 29 43, 30 45 C31 41, 32 33, 35 34 C36 37, 36 40, 38 35" stroke="#fcf6dc" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Brass Chamberstick Saucer & Ring Handle */}
    <rect x="19" y="64" width="22" height="5" rx="1.5" fill="#b08d32" stroke="#4a3710" strokeWidth="1.2" />
    <path d="M10 69 L50 69 L45 77 L15 77 Z" fill="#d4af37" stroke="#4a3710" strokeWidth="1.2" />
    <path d="M47 71 C55 68, 58 74, 53 77 C49 79, 46 76, 46 74" stroke="#d4af37" strokeWidth="2.4" fill="none" />
  </svg>
);

function WishlistShelf({ onReviewBook }) {
  const [books, setBooks] = useState(() => {
    try {
      const saved = localStorage.getItem('book_wishlist_shelf');
      const parsed = saved ? JSON.parse(saved) : DEFAULT_WISHLIST;
      return Array.isArray(parsed)
        ? parsed.map((b) => (b.status === 'Read' ? { ...b, status: 'Want to Read' } : b))
        : DEFAULT_WISHLIST;
    } catch {
      return DEFAULT_WISHLIST;
    }
  });

  const [filter, setFilter] = useState('All');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    genre: '',
    status: 'Want to Read',
    shelf: 1,
    color: '#9e2a2b',
    notes: '',
  });

  // =========================================================================
  // 2D RIGID-BODY BOOKSHELF PHYSICS SANDBOX STATE & REFS
  // Phase 1 (timeUnfrozen = false): Throw books & they float/rotate in mid-air (Time Freeze!)
  // Phase 2 (timeUnfrozen = true): Pull any shelf -> Time unfreezes & shelves drop 1st -> 2nd -> 3rd!
  // =========================================================================
  const [isPhysicsActive, setIsPhysicsActive] = useState(false);
  const [, setRenderTick] = useState(0);

  const bookcaseRef = useRef(null);
  const itemDomRefs = useRef({});
  const plankDomRefs = useRef({});
  const physStateRef = useRef({
    active: false,
    timeUnfrozen: false,
    width: 1100,
    height: 620,
    bodies: [], // { id, homeShelf, x, y, w, h, vx, vy, angle, omega, wasThrown, isFalling, isDragging }
    planks: [], // { shelfNum, x, y, homeX, homeY, w, h, vx, vy, angle, omega, collapsed, isDragging }
  });
  const dragRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('book_wishlist_shelf', JSON.stringify(books));
    } catch (e) {
      console.error(e);
    }
  }, [books]);

  // Capture current DOM layout into live 2D rigid-body physics coordinates
  const engagePhysicsFromDOM = useCallback(() => {
    if (physStateRef.current.active) return physStateRef.current;
    const container = bookcaseRef.current;
    if (!container) return null;

    const cRect = container.getBoundingClientRect();
    const bodies = [];
    const planks = [];

    // Snapshot all 3 wooden shelf planks
    [1, 2, 3].forEach((shelfNum) => {
      const pEl = plankDomRefs.current[shelfNum];
      if (pEl) {
        const r = pEl.getBoundingClientRect();
        planks.push({
          shelfNum,
          x: r.left - cRect.left,
          y: r.top - cRect.top,
          homeX: r.left - cRect.left,
          homeY: r.top - cRect.top,
          w: r.width,
          h: r.height,
          vx: 0,
          vy: 0,
          angle: 0,
          omega: 0,
          collapsed: false,
          isDragging: false,
        });
      }
    });

    // Snapshot all books, horizontal books, and vector decor items
    const p1Y = planks.find((p) => p.shelfNum === 1)?.homeY || 180;
    const p2Y = planks.find((p) => p.shelfNum === 2)?.homeY || 380;

    Object.entries(itemDomRefs.current).forEach(([key, el]) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const w = r.width;
      const h = r.height;
      const cx = r.left - cRect.left + w / 2;
      const cy = r.top - cRect.top + h / 2;
      const homeShelf = cy <= p1Y + 20 ? 1 : cy <= p2Y + 20 ? 2 : 3;
      bodies.push({
        id: key,
        homeShelf,
        x: cx,
        y: cy,
        w,
        h,
        vx: 0,
        vy: 0,
        angle: key === 'lean-2' ? 0.2 : 0,
        omega: 0,
        restitution: 0.32,
        wasThrown: false,
        isFalling: false,
        isDragging: false,
      });
    });

    physStateRef.current = {
      active: true,
      timeUnfrozen: false,
      width: cRect.width,
      height: cRect.height,
      bodies,
      planks,
    };
    setIsPhysicsActive(true);
    return physStateRef.current;
  }, []);

  // Unfreeze Time & Drop the Pulled Shelf onto the Next Intact Shelf Below (1st -> 2nd -> 3rd -> Floor)
  const unfreezeTimeAndDropAll = useCallback((state, pulledShelfNum = null) => {
    if (!state) return;
    state.timeUnfrozen = true;

    if (pulledShelfNum === null || pulledShelfNum === 'all') {
      state.planks.forEach((p, idx) => {
        p.collapsed = true;
        if (!p.isDragging && Math.abs(p.vy) < 1) {
          p.vy = 2.0 + idx * 0.8;
          p.angle = idx % 2 === 0 ? 0.1 : -0.1;
          p.omega = idx % 2 === 0 ? 0.015 : -0.015;
        }
      });
      state.bodies.forEach((b) => {
        if (!b.isDragging) {
          b.wasThrown = true;
          b.isFalling = true;
          b.vx += (Math.random() - 0.5) * 5;
          b.vy += 1.5 + Math.random() * 2;
          b.omega = 0;
        }
      });
      return;
    }

    const targetPlank = state.planks.find((p) => p.shelfNum === pulledShelfNum);
    const cutoffY = targetPlank ? targetPlank.homeY + 28 : 9999;

    if (targetPlank && !targetPlank.collapsed) {
      targetPlank.collapsed = true;
      if (!targetPlank.isDragging) {
        targetPlank.vy = 2.6;
        targetPlank.angle = pulledShelfNum % 2 === 1 ? 0.08 : -0.08;
        targetPlank.omega = pulledShelfNum % 2 === 1 ? 0.012 : -0.012;
      }
    }

    state.planks.forEach((p) => {
      if (p.collapsed && p.y <= cutoffY && !p.isDragging) {
        p.vy = Math.max(p.vy, 2.2);
      }
    });

    state.bodies.forEach((b) => {
      if (b.isDragging) return;
      if (b.wasThrown || b.homeShelf === pulledShelfNum || b.y <= cutoffY) {
        b.wasThrown = true;
        b.isFalling = true;
        b.vx += (Math.random() - 0.5) * 4.2;
        b.vy = Math.max(b.vy, 1.4 + Math.random() * 1.8);
        b.omega = 0;
      }
    });
  }, []);

  // Main 60fps 2D Physics Simulation Step
  useEffect(() => {
    if (!isPhysicsActive) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return undefined;
    }

    const stepPhysics = () => {
      const state = physStateRef.current;
      if (!state.active) return;

      const W = state.width;
      const H = state.height;
      const floorY = H - 14;
      const gravity = 0.74;

      const intactPlanks = state.planks
        .filter((p) => !p.collapsed)
        .sort((a, b) => a.y - b.y);

      // 1. Update Wooden Shelf Planks
      state.planks.forEach((p) => {
        if (p.isDragging || !p.collapsed) return;

        p.vy += gravity * 0.95;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.omega;
        p.vx *= 0.95;
        p.omega *= 0.92;

        const nextIntactShelf = intactPlanks.find((ip) => ip.shelfNum > p.shelfNum && ip.homeY > p.homeY);
        const plankStopY = nextIntactShelf ? nextIntactShelf.y - 4 : floorY;

        if (p.y + p.h > plankStopY) {
          p.y = plankStopY - p.h;
          p.vy = -p.vy * 0.18;
          p.vx *= 0.72;
          p.omega *= 0.6;
          p.angle *= 0.78;
        }
      });

      // 2. Update All Rigid Bodies (Books, Stacks & Vector Decor)
      state.bodies.forEach((b) => {
        if (b.isDragging) return;

        if (!state.timeUnfrozen) {
          // PHASE 1: TIME-FREEZE MODE (Thrown books glide & float in mid-air!)
          if (!b.wasThrown) return;

          b.x += b.vx;
          b.y += b.vy;
          b.angle += b.omega;

          b.vx *= 0.9;
          b.vy *= 0.9;

          const minSpin = b.omega >= 0 ? 0.0045 : -0.0045;
          b.omega = b.omega * 0.96 + minSpin * 0.04;

          if (b.y - b.h / 2 < 12) {
            b.y = 12 + b.h / 2;
            b.vy = Math.abs(b.vy) * 0.5;
          } else if (b.y + b.h / 2 > floorY) {
            b.y = floorY - b.h / 2;
            b.vy = -Math.abs(b.vy) * 0.5;
          }
          if (b.x - b.w / 2 < 14) {
            b.x = 14 + b.w / 2;
            b.vx = Math.abs(b.vx) * 0.5;
          } else if (b.x + b.w / 2 > W - 14) {
            b.x = W - 14 - b.w / 2;
            b.vx = -Math.abs(b.vx) * 0.5;
          }
        } else {
          // PHASE 2: TIME UNFROZEN (Cascading Shelf-to-Shelf Gravity — No Axis Rotation!)
          if (!b.isFalling && !b.wasThrown) return;

          const prevY = b.y;
          b.vy += gravity;
          b.x += b.vx;
          b.y += b.vy;
          b.omega = 0;

          b.vx *= 0.99;

          const effectiveRadiusY =
            Math.min(b.w, b.h) * 0.44 +
            Math.abs(Math.cos(b.angle)) * (Math.max(b.w, b.h) * 0.26);
          const prevBottom = prevY + effectiveRadiusY;
          const curBottom = b.y + effectiveRadiusY;

          for (let k = 0; k < intactPlanks.length; k += 1) {
            const ip = intactPlanks[k];
            const surfaceY = ip.y;
            if (prevBottom <= surfaceY + 24 && curBottom >= surfaceY && b.vy >= 0) {
              b.y = surfaceY - effectiveRadiusY;
              if (Math.abs(b.vy) > 2.2) {
                b.vy = -b.vy * b.restitution;
              } else {
                b.vy = 0;
              }
              b.vx *= 0.8;
              break;
            }
          }

          if (b.y + effectiveRadiusY > floorY) {
            b.y = floorY - effectiveRadiusY;
            if (Math.abs(b.vy) > 2.2) {
              b.vy = -b.vy * b.restitution;
            } else {
              b.vy = 0;
            }
            b.vx *= 0.8;
          }

          if (b.y - b.h / 2 < 10) {
            b.y = 10 + b.h / 2;
            b.vy = Math.abs(b.vy) * 0.4;
          }
          if (b.x - b.w / 2 < 14) {
            b.x = 14 + b.w / 2;
            b.vx = Math.abs(b.vx) * 0.55;
          } else if (b.x + b.w / 2 > W - 14) {
            b.x = W - 14 - b.w / 2;
            b.vx = -Math.abs(b.vx) * 0.55;
          }
        }
      });

      // 3. Pairwise Horizontal Jostling & Knock Collisions
      const bodies = state.bodies;
      for (let i = 0; i < bodies.length; i += 1) {
        for (let j = i + 1; j < bodies.length; j += 1) {
          const A = bodies[i];
          const B = bodies[j];
          if (!state.timeUnfrozen && !A.wasThrown && !B.wasThrown && !A.isDragging && !B.isDragging) {
            continue;
          }

          const dx = B.x - A.x;
          const dy = B.y - A.y;
          const minX = (A.w + B.w) * 0.38;
          const minY = (A.h + B.h) * 0.38;

          if (Math.abs(dx) < minX && Math.abs(dy) < minY) {
            if (!state.timeUnfrozen && (A.isDragging || B.isDragging || Math.hypot(A.vx, A.vy) > 2 || Math.hypot(B.vx, B.vy) > 2)) {
              A.wasThrown = true;
              B.wasThrown = true;
            }

            const signX = dx >= 0 ? 1 : -1;
            const overlapX = minX - Math.abs(dx);
            const pushX = Math.min(4, overlapX * 0.25);

            if (!A.isDragging && A.wasThrown) A.x -= signX * pushX;
            if (!B.isDragging && B.wasThrown) B.x += signX * pushX;

            const relVx = B.vx - A.vx;
            if (relVx * signX < 0) {
              const impulse = relVx * 0.35;
              if (!A.isDragging && A.wasThrown) {
                A.vx += impulse;
                if (!state.timeUnfrozen) A.omega += signX * 0.012;
              }
              if (!B.isDragging && B.wasThrown) {
                B.vx -= impulse;
                if (!state.timeUnfrozen) B.omega -= signX * 0.012;
              }
            }
          }
        }
      }

      setRenderTick((t) => (t + 1) % 1000000);
      rafRef.current = requestAnimationFrame(stepPhysics);
    };

    rafRef.current = requestAnimationFrame(stepPhysics);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPhysicsActive]);

  // Global Pointer Move / Up Handlers for Dragging & Throwing Books or Pulling Shelves
  useEffect(() => {
    const handleWindowPointerMove = (e) => {
      const drag = dragRef.current;
      if (!drag) return;

      const dxTotal = e.clientX - drag.startClientX;
      const dyTotal = e.clientY - drag.startClientY;

      if (!drag.hasMoved && Math.hypot(dxTotal, dyTotal) > 5) {
        drag.hasMoved = true;
        const state = engagePhysicsFromDOM();
        if (state) {
          if (drag.type === 'body') {
            const body = state.bodies.find((b) => b.id === drag.id);
            if (body) {
              body.isDragging = true;
              body.wasThrown = true;
            }
          } else if (drag.type === 'plank') {
            const plank = state.planks.find((p) => p.shelfNum === drag.shelfNum);
            if (plank) {
              plank.isDragging = true;
            }
            unfreezeTimeAndDropAll(state, drag.shelfNum);
          }
        }
      }

      if (!drag.hasMoved) return;

      const container = bookcaseRef.current;
      if (!container) return;
      const cRect = container.getBoundingClientRect();
      const curX = e.clientX - cRect.left;
      const curY = e.clientY - cRect.top;

      const state = physStateRef.current;
      if (drag.type === 'body') {
        const body = state.bodies.find((b) => b.id === drag.id);
        if (body) {
          const newVx = curX - drag.offsetX - body.x;
          const newVy = curY - drag.offsetY - body.y;
          body.vx = newVx * 0.85;
          body.vy = newVy * 0.85;
          body.x = curX - drag.offsetX;
          body.y = curY - drag.offsetY;
          body.omega = Math.max(-0.22, Math.min(0.22, newVx * 0.012));
        }
      } else if (drag.type === 'plank') {
        const plank = state.planks.find((p) => p.shelfNum === drag.shelfNum);
        if (plank) {
          const targetX = curX - drag.offsetX;
          const targetY = curY - drag.offsetY;
          plank.vx = targetX - plank.x;
          plank.vy = targetY - plank.y;
          plank.x = targetX;
          plank.y = targetY;
          plank.angle = Math.max(-0.4, Math.min(0.4, (targetY - plank.homeY) * 0.005));
        }
      }
    };

    const handleWindowPointerUp = () => {
      const drag = dragRef.current;
      if (!drag) return;

      const state = physStateRef.current;
      if (drag.hasMoved && state.active) {
        if (drag.type === 'body') {
          const body = state.bodies.find((b) => b.id === drag.id);
          if (body) {
            body.isDragging = false;
            body.wasThrown = true;
            body.vx = Math.max(-22, Math.min(22, body.vx * 1.15));
            body.vy = Math.max(-22, Math.min(22, body.vy * 1.15));
            if (Math.abs(body.omega) < 0.02) {
              body.omega = (Math.random() > 0.5 ? 1 : -1) * 0.04;
            }
          }
        } else if (drag.type === 'plank') {
          const plank = state.planks.find((p) => p.shelfNum === drag.shelfNum);
          if (plank) {
            plank.isDragging = false;
            plank.collapsed = true;
            plank.omega = (Math.random() - 0.5) * 0.05;
          }
        }
      } else if (!drag.hasMoved && drag.type === 'body' && drag.bookObj) {
        setSelectedBook(drag.bookObj);
      } else if (!drag.hasMoved && drag.type === 'plank') {
        const activeState = engagePhysicsFromDOM();
        if (activeState) {
          unfreezeTimeAndDropAll(activeState, drag.shelfNum);
        }
      }

      dragRef.current = null;
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
    };
  }, [engagePhysicsFromDOM, unfreezeTimeAndDropAll]);

  // Start dragging a book or decor item
  const handleBodyPointerDown = (e, id, bookObj = null) => {
    if (e.button && e.button !== 0) return;
    e.stopPropagation();
    const container = bookcaseRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    let offsetX = 0;
    let offsetY = 0;
    if (physStateRef.current.active) {
      const b = physStateRef.current.bodies.find((item) => item.id === id);
      if (b) {
        offsetX = e.clientX - cRect.left - b.x;
        offsetY = e.clientY - cRect.top - b.y;
      }
    } else {
      const el = itemDomRefs.current[id];
      if (el) {
        const r = el.getBoundingClientRect();
        const cx = r.left - cRect.left + r.width / 2;
        const cy = r.top - cRect.top + r.height / 2;
        offsetX = e.clientX - cRect.left - cx;
        offsetY = e.clientY - cRect.top - cy;
      }
    }

    dragRef.current = {
      type: 'body',
      id,
      bookObj,
      startClientX: e.clientX,
      startClientY: e.clientY,
      offsetX,
      offsetY,
      hasMoved: false,
    };
  };

  // Start pulling/dragging a wooden shelf plank
  const handlePlankPointerDown = (e, shelfNum) => {
    if (e.button && e.button !== 0) return;
    e.stopPropagation();
    const container = bookcaseRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    let offsetX = 0;
    let offsetY = 0;
    if (physStateRef.current.active) {
      const p = physStateRef.current.planks.find((pl) => pl.shelfNum === shelfNum);
      if (p) {
        offsetX = e.clientX - cRect.left - p.x;
        offsetY = e.clientY - cRect.top - p.y;
      }
    } else {
      const el = plankDomRefs.current[shelfNum];
      if (el) {
        const r = el.getBoundingClientRect();
        offsetX = e.clientX - cRect.left - (r.left - cRect.left);
        offsetY = e.clientY - cRect.top - (r.top - cRect.top);
      }
    }

    dragRef.current = {
      type: 'plank',
      shelfNum,
      startClientX: e.clientX,
      startClientY: e.clientY,
      offsetX,
      offsetY,
      hasMoved: false,
    };
  };

  // Reset all shelves, books, and vector decor to their neat library positions
  const handleResetPhysics = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    physStateRef.current.active = false;
    physStateRef.current.timeUnfrozen = false;
    setIsPhysicsActive(false);
  }, []);

  // Return inline physics style when simulation is active
  const getItemPhysicsStyle = (id, baseStyle = {}) => {
    if (!isPhysicsActive || !physStateRef.current.active) return baseStyle;
    const b = physStateRef.current.bodies.find((item) => item.id === id);
    if (!b) return baseStyle;
    return {
      ...baseStyle,
      position: 'absolute',
      left: 0,
      top: 0,
      width: `${b.w}px`,
      height: `${b.h}px`,
      margin: 0,
      zIndex: b.isDragging ? 60 : 25,
      transform: `translate3d(${b.x - b.w / 2}px, ${b.y - b.h / 2}px, 0) rotate(${b.angle}rad)`,
      transition: 'none',
      cursor: b.isDragging ? 'grabbing' : 'grab',
    };
  };

  const getPlankPhysicsStyle = (shelfNum) => {
    if (!isPhysicsActive || !physStateRef.current.active) return {};
    const p = physStateRef.current.planks.find((pl) => pl.shelfNum === shelfNum);
    if (!p) return {};
    return {
      position: 'absolute',
      left: 0,
      top: 0,
      width: `${p.w}px`,
      height: `${p.h}px`,
      margin: 0,
      zIndex: 18,
      transform: `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.angle}rad)`,
      transition: 'none',
      cursor: p.isDragging ? 'grabbing' : 'grab',
    };
  };

  const handleAddBook = (e) => {
    e.preventDefault();
    if (!newBook.title.trim()) return;

    handleResetPhysics();

    const book = {
      id: Date.now(),
      title: newBook.title.trim(),
      author: newBook.author.trim() || 'Unknown',
      genre: newBook.genre.trim() || 'General',
      status: newBook.status,
      shelf: parseInt(newBook.shelf, 10) || 1,
      color: newBook.color,
      height: Math.floor(122 + Math.random() * 26),
      width: Math.floor(31 + Math.random() * 12),
      rating: 0,
      notes: newBook.notes,
    };

    setBooks((prev) => [book, ...prev]);
    setShowAddModal(false);
    setNewBook({
      title: '',
      author: '',
      genre: '',
      status: 'Want to Read',
      shelf: 1,
      color: '#9e2a2b',
      notes: '',
    });
  };

  const handleDeleteBook = (id) => {
    handleResetPhysics();
    setBooks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBook && selectedBook.id === id) {
      setSelectedBook(null);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    if (selectedBook && selectedBook.id === id) {
      setSelectedBook((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const filteredBooks = books.filter((b) => {
    if (filter === 'All') return true;
    return b.status === filter;
  });

  const getShelfBooks = (shelfNum) => {
    return filteredBooks.filter((b) => (b.shelf || 1) === shelfNum);
  };

  const handleStartReview = (book) => {
    if (onReviewBook) {
      onReviewBook(book);
    }
  };

  const registerItemRef = (id) => (el) => {
    if (el) {
      itemDomRefs.current[id] = el;
    } else {
      delete itemDomRefs.current[id];
    }
  };

  return (
    <div className="wishlist-shelf-page">
      {/* Shelf Header Bar */}
      <div className="shelf-toolbar">
        <div className="shelf-toolbar-left">
          <h2 className="shelf-page-title">
            ✦ Library Wishlist
          </h2>
        </div>

        <div className="shelf-toolbar-right">
          <div className="shelf-filter-chips">
            {['All', 'Want to Read', 'Currently Reading'].map((cat) => (
              <button
                key={cat}
                className={`shelf-chip ${filter === cat ? 'active' : ''}`}
                onClick={() => {
                  handleResetPhysics();
                  setFilter(cat);
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn-add-book"
            onClick={() => setShowAddModal(true)}
            title="Add Book to Shelf"
            aria-label="Add Book to Shelf"
          >
            <Plus size={18} strokeWidth={2.6} />
          </button>
        </div>
      </div>

      {/* Full-width Interactive Physics Bookcase */}
      <div
        ref={bookcaseRef}
        className={`bookcase-frame ${isPhysicsActive ? 'physics-active-frame' : ''}`}
        style={isPhysicsActive ? { height: `${physStateRef.current.height}px` } : undefined}
      >
        {/* ======================== SHELF TIER 1 (TOP) ======================== */}
        <div className="shelf-tier">
          <div className="shelf-decor-left">
            <div
              ref={registerItemRef('decor-monstera')}
              style={getItemPhysicsStyle('decor-monstera')}
              onPointerDown={(e) => handleBodyPointerDown(e, 'decor-monstera')}
              className="vector-decor-item"
              title="Monstera Deliciosa"
            >
              <VectorMonsteraPot />
            </div>
          </div>

          <div className="shelf-books-row">
            {/* Horizontal Book Stack 1 */}
            <div className="book-stack-horizontal">
              {DECORATIVE_STACK_BOOKS.filter((s) => s.shelf === 1).map((sb) => (
                <div
                  key={sb.id}
                  ref={registerItemRef(sb.id)}
                  style={getItemPhysicsStyle(sb.id, {
                    width: `${sb.width}px`,
                    backgroundColor: sb.color,
                  })}
                  onPointerDown={(e) => handleBodyPointerDown(e, sb.id, sb)}
                  className="horizontal-book"
                  title={`${sb.title} by ${sb.author}`}
                >
                  {sb.title}
                </div>
              ))}
            </div>

            {/* Vertical Wishlist Books on Shelf 1 */}
            {getShelfBooks(1).map((b) => {
              const physId = `book-${b.id}`;
              return (
                <div
                  key={b.id}
                  ref={registerItemRef(physId)}
                  className={`shelf-book-spine ${selectedBook?.id === b.id ? 'active' : ''}`}
                  style={getItemPhysicsStyle(physId, {
                    backgroundColor: b.color,
                    height: `${b.height}px`,
                    width: `${b.width}px`,
                  })}
                  onPointerDown={(e) => handleBodyPointerDown(e, physId, b)}
                  title={`${b.title} by ${b.author}`}
                >
                  <div className="spine-stripes" />
                  <div className="spine-title">{b.title}</div>
                  <div className="spine-author">{b.author}</div>
                  <div className="spine-gold-emboss">✦</div>
                </div>
              );
            })}
          </div>

          <div className="shelf-decor-right">
            <div
              ref={registerItemRef('decor-globe')}
              style={getItemPhysicsStyle('decor-globe')}
              onPointerDown={(e) => handleBodyPointerDown(e, 'decor-globe')}
              className="vector-decor-item"
              title="Antique Brass Globe"
            >
              <VectorBrassGlobe />
            </div>
          </div>

          {/* Pullable / Collapsible Wooden Shelf Plank 1 */}
          <div
            ref={(el) => { plankDomRefs.current[1] = el; }}
            style={getPlankPhysicsStyle(1)}
            onPointerDown={(e) => handlePlankPointerDown(e, 1)}
            className="wooden-shelf-plank interactive-plank"
          >
            <div className="plank-shadow" />
          </div>
        </div>

        {/* ======================== SHELF TIER 2 (MIDDLE) ======================== */}
        <div className="shelf-tier">
          <div className="shelf-decor-left">
            <div
              ref={registerItemRef('decor-quill-jar')}
              style={getItemPhysicsStyle('decor-quill-jar')}
              onPointerDown={(e) => handleBodyPointerDown(e, 'decor-quill-jar')}
              className="vector-decor-item"
              title="Calligraphy Quill & Ink Jar"
            >
              <VectorQuillInkJar />
            </div>
          </div>

          <div className="shelf-books-row">
            {getShelfBooks(2).map((b) => {
              const physId = `book-${b.id}`;
              return (
                <div
                  key={b.id}
                  ref={registerItemRef(physId)}
                  className={`shelf-book-spine ${selectedBook?.id === b.id ? 'active' : ''}`}
                  style={getItemPhysicsStyle(physId, {
                    backgroundColor: b.color,
                    height: `${b.height}px`,
                    width: `${b.width}px`,
                  })}
                  onPointerDown={(e) => handleBodyPointerDown(e, physId, b)}
                  title={`${b.title} by ${b.author}`}
                >
                  <div className="spine-stripes" />
                  <div className="spine-title">{b.title}</div>
                  <div className="spine-author">{b.author}</div>
                  <div className="spine-gold-emboss">✦</div>
                </div>
              );
            })}

            {/* Tilted Leaning Book */}
            <div
              ref={registerItemRef('lean-2')}
              className="shelf-book-spine leaning-book"
              style={getItemPhysicsStyle('lean-2', {
                backgroundColor: '#5a2a55',
                height: '136px',
                width: '34px',
              })}
              onPointerDown={(e) =>
                handleBodyPointerDown(
                  e,
                  'lean-2',
                  DECORATIVE_STACK_BOOKS.find((s) => s.id === 'lean-2')
                )
              }
              title="The Odyssey by Homer"
            >
              <div className="spine-stripes" />
              <div className="spine-title">Odyssey</div>
              <div className="spine-author">Homer</div>
              <div className="spine-gold-emboss">✦</div>
            </div>

            {/* Horizontal Stack 2 */}
            <div className="book-stack-horizontal">
              {DECORATIVE_STACK_BOOKS.filter((s) => s.shelf === 2 && !s.isLeaning).map((sb) => (
                <div
                  key={sb.id}
                  ref={registerItemRef(sb.id)}
                  style={getItemPhysicsStyle(sb.id, {
                    width: `${sb.width}px`,
                    backgroundColor: sb.color,
                  })}
                  onPointerDown={(e) => handleBodyPointerDown(e, sb.id, sb)}
                  className="horizontal-book"
                  title={`${sb.title} by ${sb.author}`}
                >
                  {sb.title}
                </div>
              ))}
            </div>
          </div>

          <div className="shelf-decor-right">
            <div
              ref={registerItemRef('decor-ivy')}
              style={getItemPhysicsStyle('decor-ivy')}
              onPointerDown={(e) => handleBodyPointerDown(e, 'decor-ivy')}
              className="vector-decor-item"
              title="Trailing Botanical Ivy"
            >
              <VectorTrailingIvy />
            </div>
          </div>

          {/* Pullable / Collapsible Wooden Shelf Plank 2 */}
          <div
            ref={(el) => { plankDomRefs.current[2] = el; }}
            style={getPlankPhysicsStyle(2)}
            onPointerDown={(e) => handlePlankPointerDown(e, 2)}
            className="wooden-shelf-plank interactive-plank"
          >
            <div className="plank-shadow" />
          </div>
        </div>

        {/* ======================== SHELF TIER 3 (BOTTOM) ======================== */}
        <div className="shelf-tier">
          <div className="shelf-decor-left">
            <div
              ref={registerItemRef('decor-hourglass')}
              style={getItemPhysicsStyle('decor-hourglass')}
              onPointerDown={(e) => handleBodyPointerDown(e, 'decor-hourglass')}
              className="vector-decor-item"
              title="Brass Sand Hourglass"
            >
              <VectorHourglass />
            </div>
          </div>

          <div className="shelf-books-row">
            {getShelfBooks(3).map((b) => {
              const physId = `book-${b.id}`;
              return (
                <div
                  key={b.id}
                  ref={registerItemRef(physId)}
                  className={`shelf-book-spine ${selectedBook?.id === b.id ? 'active' : ''}`}
                  style={getItemPhysicsStyle(physId, {
                    backgroundColor: b.color,
                    height: `${b.height}px`,
                    width: `${b.width}px`,
                  })}
                  onPointerDown={(e) => handleBodyPointerDown(e, physId, b)}
                  title={`${b.title} by ${b.author}`}
                >
                  <div className="spine-stripes" />
                  <div className="spine-title">{b.title}</div>
                  <div className="spine-author">{b.author}</div>
                  <div className="spine-gold-emboss">✦</div>
                </div>
              );
            })}

            {/* Horizontal Stack 3 */}
            <div className="book-stack-horizontal">
              {DECORATIVE_STACK_BOOKS.filter((s) => s.shelf === 3).map((sb) => (
                <div
                  key={sb.id}
                  ref={registerItemRef(sb.id)}
                  style={getItemPhysicsStyle(sb.id, {
                    width: `${sb.width}px`,
                    backgroundColor: sb.color,
                  })}
                  onPointerDown={(e) => handleBodyPointerDown(e, sb.id, sb)}
                  className="horizontal-book"
                  title={`${sb.title} by ${sb.author}`}
                >
                  {sb.title}
                </div>
              ))}
            </div>
          </div>

          <div className="shelf-decor-right">
            <div
              ref={registerItemRef('decor-candle')}
              style={getItemPhysicsStyle('decor-candle')}
              onPointerDown={(e) => handleBodyPointerDown(e, 'decor-candle')}
              className="vector-decor-item"
              title="Brass Chamberstick Candle"
            >
              <VectorChamberstickCandle />
            </div>
          </div>

          {/* Pullable / Collapsible Wooden Shelf Plank 3 */}
          <div
            ref={(el) => { plankDomRefs.current[3] = el; }}
            style={getPlankPhysicsStyle(3)}
            onPointerDown={(e) => handlePlankPointerDown(e, 3)}
            className="wooden-shelf-plank interactive-plank"
          >
            <div className="plank-shadow" />
          </div>
        </div>

        {/* Self-Rotating Reset Arrow Button inside the Bookcase Rectangle (Only appears when books are thrown / shelf is a mess) */}
        {isPhysicsActive && (
          <button
            type="button"
            className="shelf-floating-reset-btn"
            onClick={handleResetPhysics}
            title="Reset Shelf"
            aria-label="Reset Shelf"
          >
            <RotateCcw size={20} strokeWidth={2.4} />
          </button>
        )}
      </div>

      {/* Selected Book Quick Action Sheet */}
      {selectedBook && (
        <div className="book-quick-modal-overlay" onClick={() => setSelectedBook(null)}>
          <div className="book-quick-card" onClick={(e) => e.stopPropagation()}>
            <div
              className="quick-card-color-stripe"
              style={{ backgroundColor: selectedBook.color }}
            />
            <div className="quick-card-header">
              <div className="quick-card-badge">{selectedBook.genre}</div>
              <button
                className="quick-card-close"
                onClick={() => setSelectedBook(null)}
              >
                ✕
              </button>
            </div>

            <h3 className="quick-card-title">{selectedBook.title}</h3>
            <p className="quick-card-author">by {selectedBook.author}</p>

            {selectedBook.notes && (
              <p className="quick-card-notes">"{selectedBook.notes}"</p>
            )}

            {!selectedBook.isStackBook && (
              <div className="quick-card-status-row">
                <label>Status:</label>
                <select
                  value={selectedBook.status}
                  onChange={(e) =>
                    handleStatusChange(selectedBook.id, e.target.value)
                  }
                  className="quick-card-select"
                >
                  <option value="Want to Read">Want to Read</option>
                  <option value="Currently Reading">Currently Reading</option>
                </select>
              </div>
            )}

            <div className="quick-card-actions">
              <button
                className="btn-review-now"
                onClick={() => handleStartReview(selectedBook)}
              >
                ✦ Open & Review in Journal
              </button>
              {!selectedBook.isStackBook && (
                <button
                  className="btn-delete-book"
                  onClick={() => handleDeleteBook(selectedBook.id)}
                >
                  ✕ Remove from Shelf
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="book-quick-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="add-book-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-modal-header">
              <h3>+ Add New Book to Bookshelf</h3>
              <button
                className="quick-card-close"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBook} className="add-book-form">
              <div className="form-group">
                <label>Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neuromancer"
                  value={newBook.title}
                  onChange={(e) =>
                    setNewBook({ ...newBook, title: e.target.value })
                  }
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Author</label>
                  <input
                    type="text"
                    placeholder="e.g. William Gibson"
                    value={newBook.author}
                    onChange={(e) =>
                      setNewBook({ ...newBook, author: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Genre</label>
                  <input
                    type="text"
                    placeholder="e.g. Cyberpunk"
                    value={newBook.genre}
                    onChange={(e) =>
                      setNewBook({ ...newBook, genre: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Reading Shelf</label>
                  <select
                    value={newBook.shelf}
                    onChange={(e) =>
                      setNewBook({ ...newBook, shelf: e.target.value })
                    }
                  >
                    <option value="1">Shelf 1 (Top)</option>
                    <option value="2">Shelf 2 (Middle)</option>
                    <option value="3">Shelf 3 (Bottom)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newBook.status}
                    onChange={(e) =>
                      setNewBook({ ...newBook, status: e.target.value })
                    }
                  >
                    <option value="Want to Read">Want to Read</option>
                    <option value="Currently Reading">Currently Reading</option>
                    <option value="Read">Read</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Spine Color</label>
                <div className="color-palette-options">
                  {[
                    '#9e2a2b', '#2a6f68', '#b58328', '#355c7d', '#2d6a4f',
                    '#5a2a55', '#843b4b', '#2f4858', '#8f4731', '#6b3e26'
                  ].map((color) => (
                    <div
                      key={color}
                      className={`color-choice-bubble ${newBook.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewBook({ ...newBook, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Personal Notes or Why you want to read it</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Recommended by a friend..."
                  value={newBook.notes}
                  onChange={(e) =>
                    setNewBook({ ...newBook, notes: e.target.value })
                  }
                />
              </div>

              <div className="add-modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-confirm-add">
                  Add to Bookshelf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WishlistShelf;

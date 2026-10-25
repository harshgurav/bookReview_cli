import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, Feather, Sun, Moon, Maximize2, Minimize2, Library, ChevronLeft, ChevronRight, Plus, LogOut } from 'lucide-react';
import BookDetails from './BookDetails';
import BookCover from './BookCover';
import RatingCard from './RatingCard';
import Summary from './Summary';
import ShareButton from './ShareButton';
import WishlistShelf from './WishlistShelf';
import {
  ClosedLeatherJournal,
  OpeningFrontispieceSpread,
  PageLimitDevModal,
  MAX_FREE_CHAPTERS,
} from './JournalOpeningFlow';
import {
  loadUserJournalFromCloud,
  saveUserJournalToCloud,
  logoutFirebaseUser,
} from '../firebase';
import './JournalPage.css';

const toRoman = (num) => {
  const map = [
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let n = Math.max(1, num);
  let res = '';
  for (const [val, sym] of map) {
    while (n >= val) {
      res += sym;
      n -= val;
    }
  }
  return res;
};

// Pure Typography & Classical Symbol Ink Stamps (No Emojis)
const MOOD_STAMP_OPTIONS = [
  { id: 'atmospheric', symbol: '✦', label: 'ATMOSPHERIC', sub: 'IMMERSIVE VIBE', color: '#7c2d12', rotate: '-5deg' },
  { id: 'mind-bending', symbol: '❖', label: 'MIND-BENDING', sub: 'DEEP THOUGHT', color: '#3b1d5e', rotate: '4deg' },
  { id: 'page-turner', symbol: '»', label: 'PAGE-TURNER', sub: 'UNPUTDOWNABLE', color: '#8c2d19', rotate: '-4deg' },
  { id: 'emotional', symbol: '†', label: 'PROFOUND', sub: 'MOVING WORK', color: '#6b1d2f', rotate: '5deg' },
  { id: 'cozy', symbol: '❦', label: 'COMFORT READ', sub: 'WARM CHRONICLE', color: '#5c3a21', rotate: '-3deg' },
  { id: 'philosophical', symbol: '§', label: 'PHILOSOPHICAL', sub: 'TIMELESS WISDOM', color: '#1e3a5f', rotate: '3deg' },
  { id: 'dark-gritty', symbol: '✠', label: 'DARK & GRITTY', sub: 'INTENSE TONE', color: '#2d232e', rotate: '-6deg' },
  { id: 'inspiring', symbol: '★', label: 'ESSENTIAL', sub: 'HIGHLY RATED', color: '#1b4332', rotate: '4deg' },
  { id: 'poetic', symbol: '¶', label: 'LYRICAL PROSE', sub: 'LITERARY ART', color: '#5a1846', rotate: '-3deg' },
];

const CUSTOM_STAMP_COLORS = ['#7c2d12', '#1b4332', '#1e3a5f', '#5a1846', '#5c3a21', '#2d232e'];

// Intelligent classifier for Fiction vs Non-Fiction & clean Genre from API categories/subjects
const classifyBookMetadata = (rawCategories = [], bookTitle = '', subtitleOrDesc = '') => {
  const joined = [...rawCategories, bookTitle, subtitleOrDesc].join(' | ').toLowerCase();

  const nonFictionRules = [
    { regex: /\b(biography|autobiography|memoir|memoirs|personalw+history)\b/i, genre: 'Biography & Memoir' },
    { regex: /\b(history|historical\s+chronicle|civilization|humankind|world\s+history|ancient)\b/i, genre: 'History' },
    { regex: /\b(business|entrepreneurship|management|economics|finance|investing|leadership)\b/i, genre: 'Business & Economics' },
    { regex: /\b(psychology|cognitive|thinking|behavior|mental\s+health|neuroscience)\b/i, genre: 'Psychology' },
    { regex: /\b(self-help|personal\s+growth|habits|productivity|motivational)\b/i, genre: 'Self-Help' },
    { regex: /\b(philosophy|ethics|stoicism|metaphysics|epistemology)\b/i, genre: 'Philosophy' },
    { regex: /\b(science|physics|biology|anthropology|evolution|astronomy|cosmology|nature)\b/i, genre: 'Science & Nature' },
    { regex: /\b(politics|political|sociology|social\s+science|current\s+events)\b/i, genre: 'Society & Politics' },
    { regex: /\b(technology|computer|engineering|artificial\s+intelligence)\b/i, genre: 'Technology' },
    { regex: /\b(non-fiction|nonfiction|essays|reference|true\s+crime|journalism)\b/i, genre: 'Non-Fiction' },
  ];

  const fictionRules = [
    { regex: /\b(science\s+fiction|sci-fi|cyberpunk|space\s+opera|dystopian)\b/i, genre: 'Sci-Fi & Dystopian' },
    { regex: /\b(fantasy|magic|dragons|epic\s+fantasy|urban\s+fantasy)\b/i, genre: 'Fantasy' },
    { regex: /\b(mystery|thriller|suspense|detective|crime\s+fiction|noir)\b/i, genre: 'Mystery & Thriller' },
    { regex: /\b(romance|love\s+stories)\b/i, genre: 'Romance' },
    { regex: /\b(horror|gothic|supernatural)\b/i, genre: 'Horror' },
    { regex: /\b(historical\s+fiction)\b/i, genre: 'Historical Fiction' },
    { regex: /\b(classic\s+literature|classics|literary\s+fiction|novel|fiction)\b/i, genre: 'Literary Fiction' },
  ];

  // Check if explicitly marked as fiction (and not non-fiction)
  const hasExplicitNonFiction = /\b(non-fiction|nonfiction|biography|autobiography|memoir|self-help)\b/i.test(joined);
  const hasExplicitFiction = /\b(fiction|novel|fantasy|sci-fi|thriller|mystery|romance|horror|fable)\b/i.test(joined) && !hasExplicitNonFiction;

  if (!hasExplicitFiction) {
    for (const rule of nonFictionRules) {
      if (rule.regex.test(joined)) {
        return { bookType: 'nonFiction', genre: rule.genre };
      }
    }
  }

  for (const rule of fictionRules) {
    if (rule.regex.test(joined)) {
      return { bookType: 'fiction', genre: rule.genre };
    }
  }

  // Fallback to first raw category if available
  if (rawCategories.length > 0) {
    const firstCat = rawCategories[0].split('/')[0].trim();
    const isNonFic = !/\bfiction\b/i.test(firstCat) || /\bnon[-\s]?fiction\b/i.test(firstCat);
    return {
      bookType: isNonFic ? 'nonFiction' : 'fiction',
      genre: firstCat,
    };
  }

  return { bookType: 'fiction', genre: '' };
};

function BookReviewPage() {
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'wishlist'
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('book_journal_theme');
      if (savedTheme === 'modern-obsidian' || savedTheme === 'vintage-parchment') {
        return savedTheme;
      }
      return 'vintage-parchment';
    } catch {
      return 'vintage-parchment';
    }
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle between 'classic' (original side-by-side left page) and 'stacked' (New Layout)
  const [leftLayoutMode, setLeftLayoutMode] = useState('stacked'); // 'classic' | 'stacked'

  // Physical Book Stage: 'closed' (leather cover) | 'frontispiece' (Quote Game + Favorites Index) | 'chapters' (Review Ledger)
  const [bookViewStage, setBookViewStage] = useState('closed');
  const [isOpeningCoverAnim, setIsOpeningCoverAnim] = useState(false);

  // User Session & Quote Guessing Score + 17-Page Cap Modal
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('book_journal_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [quoteScore, setQuoteScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('book_journal_quote_score') || '0', 10) || 0;
    } catch {
      return 0;
    }
  });
  const [showPageLimitModal, setShowPageLimitModal] = useState(false);

  // Page Turn & Chapter State
  const [chapterIndex, setChapterIndex] = useState(0);
  const [turnAnimation, setTurnAnimation] = useState(null); // 'next' | 'prev' | null

  const [title, setTitle] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [apiSource, setApiSource] = useState('');
  const [coverLoading, setCoverLoading] = useState(false);
  const [toast, setToast] = useState('');

  const [details, setDetails] = useState({
    author: '',
    bookType: 'fiction',
    genre: '',
    format: 'Hardcover',
    dateStarted: '',
    dateEnded: '',
    favoriteQuote: '',
    keyTakeaway: '',
  });

  const [ratings, setRatings] = useState({
    character: 0,
    story: 0,
    readability: 0,
    overall: 0,
  });

  // R1 Wax Seal on top-right of Rating Card
  const [waxSeal, setWaxSeal] = useState('masterpiece');

  // Dynamic Variable-Size Stamps List on the Left Page Stamp Pad (Starts blank on a new page!)
  const [stamps, setStamps] = useState([]);
  const [showStampDrawer, setShowStampDrawer] = useState(false);
  const [editingStampIndex, setEditingStampIndex] = useState(null); // null = adding new stamp, number = replacing existing stamp
  const [customStampText, setCustomStampText] = useState('');
  const [customStampSub, setCustomStampSub] = useState('EX LIBRIS');
  const [customStampColor, setCustomStampColor] = useState('#7c2d12');

  // Signature Elements:
  // 1) Interactive Silk Spine Bookmark Ribbon (Quick-Save & Bookmark Chapter)
  // 2) Interactive Dog-Ear Top-Right Corner Page Fold (Outline Star = Not Fav, Filled Star = Fav)
  const [isRibbonBookmarked, setIsRibbonBookmarked] = useState(false);
  const [isDogEared, setIsDogEared] = useState(false);
  const [shareLinkModalUrl, setShareLinkModalUrl] = useState('');
  const [isSharedReadOnlyView, setIsSharedReadOnlyView] = useState(false);

  const [summary, setSummary] = useState('');
  const [savedReviews, setSavedReviews] = useState([]);

  const isInitialMount = useRef(true);
  const skipNextAutoSearch = useRef(false);

  // Normalize legacy string seal IDs to objects
  const resolveSealObject = (item, idx) => {
    if (!item) return MOOD_STAMP_OPTIONS[idx % MOOD_STAMP_OPTIONS.length];
    if (typeof item === 'string') {
      return MOOD_STAMP_OPTIONS.find((s) => s.id === item) || MOOD_STAMP_OPTIONS[idx % MOOD_STAMP_OPTIONS.length];
    }
    return item;
  };

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('book_journal_theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
      showToast('Fullscreen not supported or blocked by browser.');
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'vintage-parchment' ? 'modern-obsidian' : 'vintage-parchment'));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const populatePageFromEntry = useCallback((rev) => {
    skipNextAutoSearch.current = true;
    if (!rev) {
      setTitle('');
      setCoverUrl('');
      setApiSource('');
      setDetails({
        author: '',
        bookType: 'fiction',
        genre: '',
        format: 'Hardcover',
        dateStarted: '',
        dateEnded: '',
        favoriteQuote: '',
        keyTakeaway: '',
      });
      setRatings({ character: 0, story: 0, readability: 0, overall: 0 });
      setWaxSeal('masterpiece');
      setIsRibbonBookmarked(false);
      setIsDogEared(false);
      setStamps([]); // Blank page has 0 stamps until user clicks "+ Add Stamp"
      setSummary('');
      return;
    }
    setTitle(rev.title || '');
    setCoverUrl(rev.coverUrl || '');
    setApiSource(rev.apiSource || '');
    setDetails({
      author: '',
      bookType: 'fiction',
      genre: '',
      format: 'Hardcover',
      dateStarted: '',
      dateEnded: '',
      favoriteQuote: '',
      keyTakeaway: '',
      ...(rev.details || {}),
    });
    setRatings(rev.ratings || { character: 0, story: 0, readability: 0, overall: 0 });
    setWaxSeal(rev.waxSeal || 'masterpiece');
    setIsRibbonBookmarked(!!rev.isRibbonBookmarked);
    setIsDogEared(!!rev.isDogEared);
    if (Array.isArray(rev.stamps)) {
      setStamps(rev.stamps.slice(0, 6).map((s, i) => resolveSealObject(s, i)));
    } else {
      setStamps([]);
    }
    setSummary(rev.summary || '');
  }, []);

  // Fetch book cover + Auto-Fill Author, Genre & Fiction/Non-Fiction when typing Title
  const searchBookData = useCallback(async (bookTitle) => {
    const trimmed = bookTitle.trim();
    if (trimmed.length < 2) {
      setCoverUrl('');
      setApiSource('');
      return;
    }

    setCoverLoading(true);

    let foundCover = '';
    let foundSource = '';
    let foundAuthor = '';
    let collectedCategories = [];
    let collectedDesc = '';

    // 1. Try Google Books API (inspect top 3 results for rich categories & cover)
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(trimmed)}&maxResults=3`
      );

      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          for (const item of data.items) {
            const info = item.volumeInfo || {};
            if (!foundAuthor && info.authors && info.authors.length > 0) {
              foundAuthor = info.authors[0];
            }
            if (info.categories && info.categories.length > 0) {
              collectedCategories.push(...info.categories);
            }
            if (!collectedDesc && (info.subtitle || info.description)) {
              collectedDesc = `${info.subtitle || ''} ${info.description || ''}`;
            }
            if (!foundCover && (info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail)) {
              foundCover = (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail).replace(/^http:\/\//i, 'https://');
              foundSource = 'Google Books';
            }
          }
        }
      }
    } catch (err) {
      console.warn('Google Books API attempt failed, trying Open Library...', err);
    }

    // 2. If cover or categories are still missing, query Open Library with explicit fields
    if (!foundCover || !foundAuthor || collectedCategories.length === 0) {
      try {
        const olRes = await fetch(
          `https://openlibrary.org/search.json?title=${encodeURIComponent(trimmed)}&fields=key,title,author_name,cover_i,subject&limit=2`
        );
        if (olRes.ok) {
          const olData = await olRes.json();
          const doc = olData.docs?.[0];
          if (doc) {
            if (!foundCover && doc.cover_i) {
              foundCover = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
              foundSource = 'Open Library';
            }
            if (!foundAuthor && doc.author_name && doc.author_name.length > 0) {
              foundAuthor = doc.author_name[0];
            }
            if (doc.subject && doc.subject.length > 0) {
              collectedCategories.push(...doc.subject.slice(0, 12));
            }
          }
        }
      } catch (err) {
        console.warn('Open Library fallback failed:', err);
      }
    }

    setCoverUrl(foundCover);
    setApiSource(foundSource);

    // Automatically classify fiction vs nonFiction and extract clean genre
    const { bookType: detectedType, genre: detectedGenre } = classifyBookMetadata(
      collectedCategories,
      trimmed,
      collectedDesc
    );

    setDetails((prev) => ({
      ...prev,
      author: foundAuthor || prev.author,
      genre: detectedGenre || prev.genre,
      bookType: detectedType || prev.bookType,
    }));

    setCoverLoading(false);
  }, []);

  // Load shared link payload (?share=...) or saved reviews on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedPayload = params.get('share');
      if (sharedPayload) {
        const jsonStr = decodeURIComponent(escape(window.atob(sharedPayload)));
        const decodedEntry = JSON.parse(jsonStr);
        if (decodedEntry && typeof decodedEntry === 'object') {
          setIsSharedReadOnlyView(true);
          setBookViewStage('chapters');
          populatePageFromEntry(decodedEntry);
          if (decodedEntry.leftLayoutMode) {
            setLeftLayoutMode(decodedEntry.leftLayoutMode);
          }
          if (decodedEntry.theme) {
            setTheme(decodedEntry.theme);
          }
          setToast(`Viewing Shared Journal Page (Read-Only): "${decodedEntry.title || 'Untitled'}"`);
          setTimeout(() => setToast(''), 4000);
          return;
        }
      }
    } catch (err) {
      console.warn('Could not decode shared journal link:', err);
    }

    try {
      const stored = localStorage.getItem('digital_book_reviews');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedReviews(parsed);
        if (parsed.length > 0) {
          populatePageFromEntry(parsed[0]);
          setChapterIndex(0);
          if (parsed[0].title && !parsed[0].details?.genre) {
            searchBookData(parsed[0].title);
          }
        }
      }
    } catch (e) {
      console.error('Failed reading localStorage', e);
    }
  }, [populatePageFromEntry, searchBookData]);

  // Sync from Cloud Firestore if a non-guest user is logged in
  useEffect(() => {
    if (!currentUser?.uid || currentUser.uid === 'guest_local') return;
    let isMounted = true;
    loadUserJournalFromCloud(currentUser.uid).then((cloudData) => {
      if (!isMounted || !cloudData) return;
      if (Array.isArray(cloudData.savedReviews) && cloudData.savedReviews.length > 0) {
        setSavedReviews(cloudData.savedReviews);
        localStorage.setItem('digital_book_reviews', JSON.stringify(cloudData.savedReviews));
      }
      if (typeof cloudData.quoteScore === 'number') {
        setQuoteScore(cloudData.quoteScore);
        localStorage.setItem('book_journal_quote_score', String(cloudData.quoteScore));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Debounced auto-search when title changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (skipNextAutoSearch.current) {
      skipNextAutoSearch.current = false;
      return;
    }

    const timer = setTimeout(() => {
      searchBookData(title);
    }, 650);

    return () => clearTimeout(timer);
  }, [title, searchBookData]);

  const handleDetailChange = (key, val) => {
    setDetails((prev) => {
      const next = { ...prev, [key]: val };
      if (key === 'dateStarted' && val && next.dateEnded && val > next.dateEnded) {
        next.dateEnded = val;
      }
      if (key === 'dateEnded' && val && next.dateStarted && val < next.dateStarted) {
        next.dateStarted = val;
      }
      return next;
    });
  };

  const handleRatingChange = (key, val) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  };

  // Add or Replace a Stamp on the Left Page Variable Stamp Pad (Max 6 Stamps)
  const handleAddOrReplacePresetStamp = (presetObj) => {
    const tilts = ['-5.5deg', '4.2deg', '-3.8deg', '5.2deg', '-6deg', '3.5deg'];
    const shiftsX = ['-3px', '4px', '2px', '-4px', '3px', '-2px'];
    const shiftsY = ['1px', '-2px', '2px', '-1px', '-2px', '2px'];
    setStamps((prev) => {
      const targetIdx = editingStampIndex !== null ? editingStampIndex : prev.length;
      const stamped = {
        ...presetObj,
        uid: `${presetObj.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        rotate: tilts[targetIdx % tilts.length],
        shiftX: shiftsX[targetIdx % shiftsX.length],
        shiftY: shiftsY[targetIdx % shiftsY.length],
      };
      if (editingStampIndex !== null && editingStampIndex < prev.length) {
        const copy = [...prev];
        copy[editingStampIndex] = stamped;
        return copy;
      }
      if (prev.length >= 6) return prev;
      return [...prev, stamped];
    });
    setShowStampDrawer(false);
    setEditingStampIndex(null);
  };

  const handleApplyCustomSeal = (e) => {
    e.preventDefault();
    if (!customStampText.trim()) return;
    const tilts = ['-5.5deg', '4.2deg', '-3.8deg', '5.2deg', '-6deg', '3.5deg'];
    const shiftsX = ['-3px', '4px', '2px', '-4px', '3px', '-2px'];
    const shiftsY = ['1px', '-2px', '2px', '-1px', '-2px', '2px'];
    setStamps((prev) => {
      const targetIdx = editingStampIndex !== null ? editingStampIndex : prev.length;
      const customObj = {
        id: `custom-${Date.now()}`,
        uid: `custom-${Date.now()}`,
        symbol: '✦',
        label: customStampText.trim().toUpperCase(),
        sub: (customStampSub.trim() || 'CUSTOM SEAL').toUpperCase(),
        color: customStampColor,
        rotate: tilts[targetIdx % tilts.length],
        shiftX: shiftsX[targetIdx % shiftsX.length],
        shiftY: shiftsY[targetIdx % shiftsY.length],
      };
      if (editingStampIndex !== null && editingStampIndex < prev.length) {
        const copy = [...prev];
        copy[editingStampIndex] = customObj;
        return copy;
      }
      if (prev.length >= 6) return prev;
      return [...prev, customObj];
    });
    setCustomStampText('');
    setShowStampDrawer(false);
    setEditingStampIndex(null);
  };

  const handleRemoveStamp = (e, idxToRemove) => {
    e.stopPropagation();
    setStamps((prev) => prev.filter((_, i) => i !== idxToRemove));
    if (editingStampIndex === idxToRemove) {
      setShowStampDrawer(false);
      setEditingStampIndex(null);
    }
  };

  // Determine dynamic size tier class based on how many stamps have been added (Max 6)
  const getStampsSizeClass = (count) => {
    if (count <= 1) return 'stamps-scale-1';
    if (count === 2) return 'stamps-scale-2';
    if (count === 3) return 'stamps-scale-3';
    if (count === 4) return 'stamps-scale-4';
    if (count === 5) return 'stamps-scale-5';
    return 'stamps-scale-6';
  };

  // Calculate reading duration if both dates are set
  const getReadingDurationText = () => {
    if (!details.dateStarted || !details.dateEnded) return null;
    const start = new Date(details.dateStarted);
    const end = new Date(details.dateEnded);
    const diffMs = end - start;
    if (isNaN(diffMs) || diffMs < 0) return null;
    const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    return `Read in ${days} ${days === 1 ? 'day' : 'days'}`;
  };

  // Auto-save current chapter silently if it has a title when turning pages
  const persistCurrentChapter = () => {
    if (!title.trim()) return savedReviews;

    const cleanTitle = title.trim();
    const currentEntry = {
      id: savedReviews[chapterIndex]?.id || Date.now(),
      title: cleanTitle,
      coverUrl,
      apiSource,
      details,
      ratings,
      waxSeal,
      isRibbonBookmarked,
      isDogEared,
      stamps,
      summary,
      updatedAt: new Date().toLocaleDateString(),
    };

    let updated;
    if (chapterIndex < savedReviews.length) {
      updated = [...savedReviews];
      updated[chapterIndex] = currentEntry;
    } else if (savedReviews.length < MAX_FREE_CHAPTERS) {
      updated = [...savedReviews, currentEntry];
    } else {
      setShowPageLimitModal(true);
      return savedReviews;
    }

    setSavedReviews(updated);
    try {
      localStorage.setItem('digital_book_reviews', JSON.stringify(updated));
      if (currentUser?.uid) {
        saveUserJournalToCloud(currentUser.uid, {
          savedReviews: updated,
          quoteScore,
        });
      }
      // Graduate reviewed book off the Wishlist Shelf if it was on the wishlist
      const rawWishlist = localStorage.getItem('book_wishlist_shelf');
      if (rawWishlist) {
        const parsedWishlist = JSON.parse(rawWishlist);
        if (Array.isArray(parsedWishlist)) {
          const filteredWishlist = parsedWishlist.filter(
            (wb) => wb.title?.trim().toLowerCase() !== cleanTitle.toLowerCase()
          );
          if (filteredWishlist.length !== parsedWishlist.length) {
            localStorage.setItem('book_wishlist_shelf', JSON.stringify(filteredWishlist));
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    return updated;
  };

  // Open the closed leather journal cover into Spread 0 (Frontispiece: Quote Game + Favorites Index)
  const handleOpenJournalFromCover = () => {
    setIsOpeningCoverAnim(true);
    setTimeout(() => {
      setBookViewStage('frontispiece');
      setIsOpeningCoverAnim(false);
    }, 720);
  };

  // Close the journal from Spread 0 back into the closed stitched leather cover with 3D cover flip
  const handleCloseBookToCover = () => {
    if (turnAnimation) return;
    setTurnAnimation('cover-close');
    setTimeout(() => {
      setBookViewStage('closed');
      setTurnAnimation(null);
    }, 720);
  };

  // Turn page from Spread 0 (Frontispiece) into Chapter I
  const handleEnterFirstChapter = () => {
    if (turnAnimation) return;
    setTurnAnimation('next');
    setTimeout(() => {
      setBookViewStage('chapters');
      setChapterIndex(0);
      if (savedReviews.length > 0) {
        populatePageFromEntry(savedReviews[0]);
      } else {
        populatePageFromEntry(null);
      }
    }, 360);
    setTimeout(() => {
      setTurnAnimation(null);
    }, 750);
  };

  // Jump from Favorites Index on Spread 0 directly to a specific chapter
  const handleJumpToChapter = (targetIdx) => {
    if (turnAnimation) return;
    setTurnAnimation('next');
    setTimeout(() => {
      setBookViewStage('chapters');
      setChapterIndex(targetIdx);
      populatePageFromEntry(savedReviews[targetIdx] || null);
      showToast(`Turned to Chapter ${toRoman(targetIdx + 1)}: "${savedReviews[targetIdx]?.title || 'Untitled'}"`);
    }, 360);
    setTimeout(() => {
      setTurnAnimation(null);
    }, 750);
  };

  // Increment Quote Guessing Game counter
  const handleIncrementQuoteScore = () => {
    setQuoteScore((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('book_journal_quote_score', String(next));
        if (currentUser?.uid) {
          saveUserJournalToCloud(currentUser.uid, { quoteScore: next });
        }
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleLoginSuccess = (usr) => {
    setCurrentUser(usr);
    try {
      localStorage.setItem('book_journal_current_user', JSON.stringify(usr));
    } catch (e) {
      console.error(e);
    }
    showToast(`Welcome, ${usr.name || 'Reader'}!`);
  };

  const handleLogout = async () => {
    persistCurrentChapter();
    await logoutFirebaseUser();
    setCurrentUser(null);
    try {
      localStorage.removeItem('book_journal_current_user');
    } catch (e) {
      console.error(e);
    }
    setBookViewStage('closed');
    showToast('Signed out & closed journal cover.');
  };

  // Realistic 3D Page Turn Handler (Next / Previous Chapter & Frontispiece)
  const handlePageTurn = (direction) => {
    if (turnAnimation) return;

    if (bookViewStage === 'closed') {
      if (direction === 'next') {
        handleOpenJournalFromCover();
      }
      return;
    }

    if (bookViewStage === 'frontispiece') {
      if (direction === 'next') {
        handleEnterFirstChapter();
      } else if (direction === 'prev') {
        handleCloseBookToCover();
      }
      return;
    }

    const latestReviews = persistCurrentChapter();

    if (direction === 'next') {
      if (!title.trim() && chapterIndex >= latestReviews.length) {
        showToast('Enter a book title on this chapter before turning to a new blank page.');
        return;
      }
      const nextIdx = chapterIndex + 1;
      // Hidden 17-page cap: after 17 pages, show the Dev AWS popup!
      if (nextIdx >= MAX_FREE_CHAPTERS) {
        setShowPageLimitModal(true);
        return;
      }

      setTurnAnimation('next');

      setTimeout(() => {
        setChapterIndex(nextIdx);
        if (nextIdx < latestReviews.length) {
          populatePageFromEntry(latestReviews[nextIdx]);
          showToast(`Turned to Chapter ${toRoman(nextIdx + 1)}: "${latestReviews[nextIdx].title}"`);
        } else {
          populatePageFromEntry(null);
          showToast(`Turned to Chapter ${toRoman(nextIdx + 1)} (Fresh Parchment Page)`);
        }
      }, 360);

      setTimeout(() => {
        setTurnAnimation(null);
      }, 750);
    } else if (direction === 'prev') {
      if (chapterIndex <= 0) {
        // Turn back from Chapter I to the Opening Frontispiece Spread (Quote Game + Favorites Index)
        setTurnAnimation('prev');
        setTimeout(() => {
          setBookViewStage('frontispiece');
        }, 360);
        setTimeout(() => {
          setTurnAnimation(null);
        }, 750);
        return;
      }
      const prevIdx = chapterIndex - 1;
      setTurnAnimation('prev');

      setTimeout(() => {
        setChapterIndex(prevIdx);
        populatePageFromEntry(latestReviews[prevIdx]);
        showToast(`Turned back to Chapter ${toRoman(prevIdx + 1)}: "${latestReviews[prevIdx]?.title || 'Untitled'}"`);
      }, 360);

      setTimeout(() => {
        setTurnAnimation(null);
      }, 750);
    }
  };

  const handleSaveReview = () => {
    if (!title.trim()) {
      showToast('Please provide a book title before saving.');
      return;
    }
    if (chapterIndex >= MAX_FREE_CHAPTERS) {
      setShowPageLimitModal(true);
      return;
    }

    persistCurrentChapter();
    showToast(`Chapter ${toRoman(chapterIndex + 1)} saved to your journal!`);
  };

  const handleLoadReview = (rev, idx) => {
    if (bookViewStage === 'chapters' && idx === chapterIndex) return;
    const latestReviews = bookViewStage === 'chapters' ? persistCurrentChapter() : savedReviews;
    const targetRev = latestReviews[idx] || rev;
    const dir = bookViewStage !== 'chapters' || idx > chapterIndex ? 'next' : 'prev';
    setTurnAnimation(dir);
    setTimeout(() => {
      setBookViewStage('chapters');
      setChapterIndex(idx);
      populatePageFromEntry(targetRev);
      showToast(`Turned to Chapter ${toRoman(idx + 1)}: "${targetRev.title}"`);
    }, 360);
    setTimeout(() => {
      setTurnAnimation(null);
    }, 750);
  };

  const handleDeleteSavedReview = (e, revId) => {
    e.stopPropagation();
    const updated = savedReviews.filter((r) => r.id !== revId);
    setSavedReviews(updated);
    try {
      localStorage.setItem('digital_book_reviews', JSON.stringify(updated));
      if (currentUser?.uid) {
        saveUserJournalToCloud(currentUser.uid, { savedReviews: updated });
      }
    } catch (err) {
      console.error(err);
    }
    const newIdx = updated.length > 0 ? Math.min(chapterIndex, updated.length - 1) : 0;
    setChapterIndex(newIdx);
    populatePageFromEntry(updated[newIdx] || null);
    showToast('Chapter removed from journal.');
  };

  const handleShare = async () => {
    const sharePayload = {
      title: title || 'Untitled',
      coverUrl,
      apiSource,
      details,
      ratings,
      waxSeal,
      isRibbonBookmarked,
      isDogEared,
      stamps,
      summary,
      leftLayoutMode,
      theme,
    };

    try {
      const encoded = window.btoa(unescape(encodeURIComponent(JSON.stringify(sharePayload))));
      const baseUrl = `${window.location.origin}${window.location.pathname}`;
      const shareUrl = `${baseUrl}?share=${encoded}`;

      setShareLinkModalUrl(shareUrl);

      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Shareable Journal Link generated & copied to clipboard!');
      } catch {
        showToast('Shareable Journal Link generated!');
      }
    } catch (err) {
      console.error('Failed generating share link:', err);
      showToast('Could not generate share link.');
    }
  };

  // Interactive Silk Spine Bookmark Ribbon Click Handler
  const handleToggleSpineRibbon = () => {
    const nextState = !isRibbonBookmarked;
    setIsRibbonBookmarked(nextState);
    if (title.trim()) {
      setTimeout(() => persistCurrentChapter(), 50);
    }
    if (nextState) {
      showToast(`Silk Bookmark placed in Chapter ${toRoman(chapterIndex + 1)}${title.trim() ? ' & Quick-Saved!' : ''}`);
    } else {
      showToast('Silk Bookmark lifted from spine.');
    }
  };

  // Interactive Top-Right Dog-Ear Corner Page Fold Click Handler
  const handleToggleDogEar = () => {
    const nextState = !isDogEared;
    setIsDogEared(nextState);
    if (title.trim()) {
      setTimeout(() => persistCurrentChapter(), 50);
    }
    if (nextState) {
      showToast('Page corner dog-eared: Marked as Personal Favorite');
    } else {
      showToast('Page corner unfolded.');
    }
  };

  // Called from WishlistShelf when clicking "Open & Review in Journal"
  const handleReviewFromWishlist = (book) => {
    const latestReviews = persistCurrentChapter();
    const existingIdx = latestReviews.findIndex(
      (r) => r.title?.toLowerCase() === book.title?.toLowerCase()
    );

    if (existingIdx !== -1) {
      setBookViewStage('chapters');
      setChapterIndex(existingIdx);
      populatePageFromEntry(latestReviews[existingIdx]);
    } else {
      if (latestReviews.length >= MAX_FREE_CHAPTERS) {
        setActiveTab('review');
        setShowPageLimitModal(true);
        return;
      }
      const { bookType: detectedType, genre: detectedGenre } = classifyBookMetadata(
        [book.genre || ''],
        book.title || '',
        book.notes || ''
      );
      skipNextAutoSearch.current = true;
      setBookViewStage('chapters');
      setChapterIndex(latestReviews.length);
      setTitle(book.title || '');
      setDetails({
        author: book.author || '',
        genre: book.genre || detectedGenre || '',
        bookType: detectedType,
        format: 'Hardcover',
        dateStarted: '',
        dateEnded: '',
        favoriteQuote: '',
        keyTakeaway: '',
      });
      setRatings({ character: 0, story: 0, readability: 0, overall: 0 });
      setStamps([]);
      setSummary(book.notes || '');
      searchBookData(book.title);
    }

    setActiveTab('review');
    showToast(`Loaded "${book.title}" from Wishlist into Review Journal!`);
  };

  const leftPageNumber = chapterIndex * 2 + 1;
  const rightPageNumber = chapterIndex * 2 + 2;
  const chapterRoman = toRoman(chapterIndex + 1);
  const durationBadge = getReadingDurationText();
  const isFiction = details.bookType !== 'nonFiction';

  return (
    <div className={`app-container ${isFullscreen ? 'is-fullscreen' : ''}`}>
      {/* Top Header Controls */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-brand">
            <span className="app-brand-icon"><BookOpen size={24} /></span>
            <span className="app-brand-text">Ex Libris • Book Review Journal</span>
          </div>

          <div className="app-tabs-nav">
            {isSharedReadOnlyView ? (
              <div className="shared-readonly-badge">
                <Feather size={15} />
                <span>Shared Journal View (Read-Only)</span>
              </div>
            ) : (
              <>
                <button
                  className={`nav-tab-btn ${activeTab === 'review' ? 'active' : ''}`}
                  onClick={() => setActiveTab('review')}
                >
                  <Feather size={16} />
                  <span>Review Ledger</span>
                </button>
                <button
                  className={`nav-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
                  onClick={() => {
                    persistCurrentChapter();
                    setActiveTab('wishlist');
                  }}
                >
                  <Library size={16} />
                  <span>Wishlist Shelf</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="header-right">
          {/* Test Button to Toggle the 17-Page Limit Dev Popup */}
          {!isSharedReadOnlyView && (
            <button
              type="button"
              className="theme-switch-btn test-limit-toggle-btn"
              onClick={() => setShowPageLimitModal((prev) => !prev)}
              title="Test the 17-Page Cap Popup Modal"
            >
              <span>17p Popup Test</span>
            </button>
          )}

          {/* Chapter Previous / Next (< >) Buttons (Hidden in Read-Only Shared View) */}
          {activeTab === 'review' && !isSharedReadOnlyView && bookViewStage !== 'closed' && (
            <div className="header-chapter-pill">
              <button
                type="button"
                className="chapter-step-btn"
                onClick={() => handlePageTurn('prev')}
                disabled={!!turnAnimation}
                title={
                  bookViewStage === 'frontispiece'
                    ? 'Close Journal Cover'
                    : chapterIndex === 0
                    ? 'Back to Frontispiece (Quote Game & Favorites)'
                    : 'Previous Chapter'
                }
              >
                <ChevronLeft size={17} />
              </button>
              <button
                type="button"
                className="chapter-step-btn"
                onClick={() => handlePageTurn('next')}
                disabled={
                  !!turnAnimation ||
                  (bookViewStage === 'chapters' && !title.trim() && chapterIndex >= savedReviews.length)
                }
                title={bookViewStage === 'frontispiece' ? 'Turn to Chapter I' : 'Next Chapter'}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          )}

          {/* Dual Theme Switcher: Crescent Moon / Sun Symbol */}
          <button
            className="theme-switch-btn icon-only-header-btn"
            onClick={toggleTheme}
            title={theme === 'vintage-parchment' ? 'Switch to Obsidian Mode' : 'Switch to Vintage Parchment'}
          >
            {theme === 'vintage-parchment' ? (
              <Moon size={17} />
            ) : (
              <Sun size={17} />
            )}
          </button>

          {/* Sign Out / Lock Cover Button when Logged In */}
          {currentUser && !isSharedReadOnlyView && (
            <button
              type="button"
              className="theme-switch-btn icon-only-header-btn"
              onClick={handleLogout}
              title={`Signed in as ${currentUser.name} — Click to Sign Out & Close Cover`}
            >
              <LogOut size={16} />
            </button>
          )}

          {/* In Read-Only Shared View: Button to start own journal */}
          {isSharedReadOnlyView && (
            <a
              href={window.location.pathname}
              className="theme-switch-btn"
              style={{ textDecoration: 'none' }}
              title="Open your own editable Book Review Journal"
            >
              <span>✦ Create Your Own Journal</span>
            </a>
          )}

          {/* Fullscreen Toggle: Arrow Icon Only */}
          <button
            className="fullscreen-toggle-btn icon-only-header-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 size={17} />
            ) : (
              <Maximize2 size={17} />
            )}
          </button>
        </div>
      </header>

      {/* Main Views */}
      {activeTab === 'review' ? (
        /* Journal Workspace */
        <div
          className="journal-workspace"
          onClick={() => {
            setShowStampDrawer(false);
            setEditingStampIndex(null);
          }}
        >
          {!isSharedReadOnlyView && bookViewStage === 'closed' ? (
            <ClosedLeatherJournal
              user={currentUser}
              onLoginSuccess={handleLoginSuccess}
              onOpenJournal={handleOpenJournalFromCover}
              isOpeningAnim={isOpeningCoverAnim}
            />
          ) : !isSharedReadOnlyView && bookViewStage === 'frontispiece' ? (
            <OpeningFrontispieceSpread
              savedReviews={savedReviews}
              quoteScore={quoteScore}
              onIncrementQuoteScore={handleIncrementQuoteScore}
              onCloseBookToCover={handleCloseBookToCover}
              onEnterFirstChapter={handleEnterFirstChapter}
              onJumpToChapter={handleJumpToChapter}
              turnAnimation={turnAnimation}
              toRoman={toRoman}
            />
          ) : (
            <>
              {/* Top Bar with [ ↗ share ] */}
              <div className="workspace-top-bar" style={{ justifyContent: 'flex-end' }}>
                <ShareButton onShare={handleShare} />
              </div>

              {/* Open Journal Book Spread with Permanent Rough Grain Texture & Curved Spine Arch */}
              <div
                className={`book-spread grain-rough-active ${turnAnimation ? `is-turning-${turnAnimation}` : ''} ${isSharedReadOnlyView ? 'is-readonly-shared-spread' : ''}`}
              >
                {/* Realistic 3D Turning Page Leaf Overlay */}
                {turnAnimation && (
                  <div className={`turning-page-leaf turn-${turnAnimation}`} aria-hidden="true">
                    <div className="leaf-front-face">
                      <div className="leaf-ruled-texture" />
                    </div>
                    <div className="leaf-back-face">
                      <div className="leaf-ruled-texture" />
                    </div>
                  </div>
                )}

                {/* LEFT PAGE */}
                <div className="book-page left-page">
                  {/* Clickable Left Page Edge Curl to go to Previous Chapter or Frontispiece */}
                  <button
                    type="button"
                    className="page-edge-turner edge-turner-left"
                    onClick={() => handlePageTurn('prev')}
                    title={
                      chapterIndex > 0
                        ? `Click page edge to turn back to Chapter ${toRoman(chapterIndex)}`
                        : 'Click page edge to turn back to Frontispiece (Quote Game & Favorites)'
                    }
                  >
                    <span className="page-curl-flap left-curl-flap" />
                    <span className="edge-turn-hint left-hint">
                      <ChevronLeft size={16} />
                      <span>
                        {chapterIndex > 0 ? `Prev Chapter (${toRoman(chapterIndex)})` : 'Frontispiece'}
                      </span>
                    </span>
                  </button>

                  <div className="page-folio-header page-curved-left">
                    <span>Chapter {chapterRoman}</span>
                <span>Page {leftPageNumber}</span>
              </div>

              {/* Inner Wrapper that subtly curves with the left page toward the center spine */}
              <div className="page-curve-content left-curve-content">
                {/* Name of the book box */}
                <div className="book-title-box">
                  <input
                    type="text"
                    className="book-title-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Name of the book"
                    autoFocus
                  />
                </div>

                {leftLayoutMode === 'classic' ? (
                  /* MODE 1: Classic Side-by-Side Layout */
                  <div className="left-page-body">
                    <BookDetails details={details} onChange={handleDetailChange} />
                    <BookCover
                      coverUrl={coverUrl}
                      loading={coverLoading}
                      apiSource={apiSource}
                      onCustomCoverChange={(url) => {
                        setCoverUrl(url);
                        setApiSource(url ? 'Custom Cover' : '');
                      }}
                    />
                  </div>
                ) : (
                  /* MODE 2: Excalidraw Layout — Top Auto-Filled Metadata, Bottom Split: Tall Left Cover Page + Right Stacked (Reading Log Above + Dynamic Stamps Box Below) */
                  <div className="left-page-stacked-layout">
                    {/* 1. Above the Poster: Auto-Filled Author, Genre, BookType (fiction/nonFiction) & Edition */}
                    <div className="stacked-top-metadata">
                      <div className="meta-row-split">
                        <div className="detail-row">
                          <span className="detail-label">Author:</span>
                          <input
                            type="text"
                            className="detail-input"
                            value={details.author || ''}
                            onChange={(e) => handleDetailChange('author', e.target.value)}
                            placeholder="Auto-fills from title..."
                          />
                        </div>

                        <div className="detail-row">
                          <span className="detail-label">Genre:</span>
                          <input
                            type="text"
                            className="detail-input"
                            value={details.genre || ''}
                            onChange={(e) => handleDetailChange('genre', e.target.value)}
                            placeholder="Auto-fills from title..."
                          />
                        </div>
                      </div>

                      <div className="meta-row-split">
                        <div className="detail-row">
                          <span className="detail-label">BookType:</span>
                          <div className="booktype-options">
                            <label
                              className="booktype-label"
                              onClick={() => handleDetailChange('bookType', 'fiction')}
                            >
                              <span className={`custom-checkbox ${details.bookType === 'fiction' ? 'checked' : ''}`} />
                              <span>fiction</span>
                            </label>
                            <label
                              className="booktype-label"
                              onClick={() => handleDetailChange('bookType', 'nonFiction')}
                            >
                              <span className={`custom-checkbox ${details.bookType === 'nonFiction' ? 'checked' : ''}`} />
                              <span>nonFiction</span>
                            </label>
                          </div>
                        </div>

                        <div className="detail-row format-chips-row">
                          <span className="detail-label" style={{ minWidth: '72px' }}>Edition:</span>
                          <div className="edition-format-pills">
                            {['Hardcover', 'E-Book', 'Audio'].map((fmt) => (
                              <button
                                key={fmt}
                                type="button"
                                className={`edition-pill ${(details.format || 'Hardcover') === fmt ? 'active' : ''}`}
                                onClick={() => handleDetailChange('format', fmt)}
                              >
                                § {fmt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Excalidraw Bottom Split: Tall Left Cover Page + Right Column (Reading Log Above + Dynamic Stamps Box Below) */}
                    <div className="excalidraw-left-bottom-grid">
                      {/* Left Column: Tall Taped Cover Page */}
                      <div className="excalidraw-tall-cover-col">
                        <BookCover
                          coverUrl={coverUrl}
                          loading={coverLoading}
                          apiSource={apiSource}
                          onCustomCoverChange={(url) => {
                            setCoverUrl(url);
                            setApiSource(url ? 'Custom Cover' : '');
                          }}
                        />
                      </div>

                      {/* Right Column: Reading Log on Top + Variable-Size Stamps Pad Below */}
                      <div className="excalidraw-right-stack-col">
                        {/* Top Box: Reading Log */}
                        <div className="reading-chronicle-plaque">
                          <div className="chronicle-plaque-title">✦ Reading Log</div>
                          <div className="chronicle-date-field">
                            <label>Date Started</label>
                            <input
                              type="date"
                              className="detail-input"
                              value={details.dateStarted || ''}
                              max={details.dateEnded || undefined}
                              onChange={(e) => handleDetailChange('dateStarted', e.target.value)}
                            />
                          </div>
                          <div className="chronicle-date-field">
                            <label>Date Ended</label>
                            <input
                              type="date"
                              className="detail-input"
                              value={details.dateEnded || ''}
                              min={details.dateStarted || undefined}
                              onChange={(e) => handleDetailChange('dateEnded', e.target.value)}
                            />
                          </div>
                          {durationBadge && (
                            <div className="duration-stamp-badge">
                              ✦ {durationBadge}
                            </div>
                          )}
                          <div className="chronicle-takeaway-field">
                            <label>Core Theme / Motif</label>
                            <input
                              type="text"
                              className="detail-input"
                              placeholder="e.g. Human Evolution..."
                              value={details.keyTakeaway || ''}
                              onChange={(e) => handleDetailChange('keyTakeaway', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Bottom Box: Dynamic Variable-Size Stamps Pad */}
                        <div
                          className="variable-stamps-pad-box"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="stamps-pad-header">
                            <span>✦ Ink Stamps {stamps.length > 0 ? `(${stamps.length}/6)` : ''}</span>
                            <button
                              type="button"
                              className="btn-add-stamp-trigger"
                              disabled={stamps.length >= 6}
                              onClick={() => {
                                if (stamps.length >= 6) {
                                  showToast('Maximum of 6 stamps reached.');
                                  return;
                                }
                                setEditingStampIndex(null);
                                setShowStampDrawer((prev) => !prev);
                              }}
                              title={stamps.length >= 6 ? 'Maximum 6 stamps reached' : 'Add a new ink stamp to this page'}
                            >
                              {stamps.length >= 6 ? (
                                <span>Max 6 Reached</span>
                              ) : (
                                <>
                                  <Plus size={13} />
                                  <span>Add Stamp</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Stamp Pad Canvas: Blank with "+ Add Stamp" button when empty; shrinks stamp sizes as more are added */}
                          {stamps.length === 0 ? (
                            <div className="stamps-pad-empty">
                              <button
                                type="button"
                                className="btn-empty-add-stamp"
                                onClick={() => {
                                  setEditingStampIndex(null);
                                  setShowStampDrawer(true);
                                }}
                              >
                                <Plus size={16} />
                                <span>Add Stamp</span>
                              </button>
                              <span className="stamps-empty-hint">
                                Add 1 or more stamps — stamps scale down as more are added
                              </span>
                            </div>
                          ) : (
                            <div className={`variable-stamps-canvas ${getStampsSizeClass(stamps.length)}`}>
                              {stamps.map((stamp, idx) => {
                                const fallbackTilts = ['-5.5deg', '4.2deg', '-3.8deg', '5.2deg', '-6deg', '3.5deg'];
                                const fallbackShiftX = ['-3px', '4px', '2px', '-4px', '3px', '-2px'];
                                const fallbackShiftY = ['1px', '-2px', '2px', '-1px', '-2px', '2px'];
                                return (
                                  <div key={stamp.uid || idx} className="variable-stamp-item-wrap">
                                    <button
                                      type="button"
                                      className="solid-ink-cutout-stamp variable-scaled-stamp"
                                      style={{
                                        '--stamp-ink': stamp.color || '#7c2d12',
                                        '--stamp-tilt': stamp.rotate || fallbackTilts[idx % fallbackTilts.length],
                                        '--stamp-shift-x': stamp.shiftX || fallbackShiftX[idx % fallbackShiftX.length],
                                        '--stamp-shift-y': stamp.shiftY || fallbackShiftY[idx % fallbackShiftY.length],
                                      }}
                                      onClick={() => {
                                        setEditingStampIndex(idx);
                                        setShowStampDrawer(true);
                                      }}
                                      title="Click to change this stamp"
                                    >
                                      <span className="cutout-stamp-symbol">{stamp.symbol || '✦'}</span>
                                      <div className="cutout-stamp-body">
                                        <span className="cutout-stamp-main">{stamp.label}</span>
                                        <span className="cutout-stamp-sub">{stamp.sub}</span>
                                      </div>
                                    </button>
                                    <button
                                      type="button"
                                      className="stamp-remove-tiny-btn"
                                      onClick={(e) => handleRemoveStamp(e, idx)}
                                      title="Remove stamp"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Popover Drawer to Add a New Stamp or Replace Selected Stamp */}
                          {showStampDrawer && (
                            <div className="seal-picker-popover stamps-pad-popover">
                              <div className="seal-picker-header">
                                <span>
                                  {editingStampIndex !== null
                                    ? `Change Stamp #${editingStampIndex + 1}`
                                    : 'Add Ink Stamp to Page'}
                                </span>
                                <button
                                  type="button"
                                  className="seal-picker-close"
                                  onClick={() => {
                                    setShowStampDrawer(false);
                                    setEditingStampIndex(null);
                                  }}
                                >
                                  ✕
                                </button>
                              </div>

                              {/* Preset Stamps Grid */}
                              <div className="seal-picker-grid">
                                {MOOD_STAMP_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    className="seal-picker-option"
                                    style={{ '--opt-ink': opt.color }}
                                    onClick={() => handleAddOrReplacePresetStamp(opt)}
                                  >
                                    <span className="opt-symbol">{opt.symbol}</span>
                                    <span>{opt.label}</span>
                                  </button>
                                ))}
                              </div>

                              {/* Custom Stamp Creator Box */}
                              <form
                                className="custom-stamp-form"
                                onSubmit={handleApplyCustomSeal}
                              >
                                <div className="custom-stamp-label">Or Engrave Custom Ink Stamp:</div>
                                <input
                                  type="text"
                                  className="custom-stamp-input"
                                  placeholder="Main stamp text (e.g. UNPUTDOWNABLE)"
                                  maxLength={18}
                                  value={customStampText}
                                  onChange={(e) => setCustomStampText(e.target.value)}
                                />
                                <input
                                  type="text"
                                  className="custom-stamp-input sub-input"
                                  placeholder="Sub-caption (e.g. PERSONAL FAVORITE)"
                                  maxLength={22}
                                  value={customStampSub}
                                  onChange={(e) => setCustomStampSub(e.target.value)}
                                />
                                <div className="custom-stamp-footer">
                                  <div className="custom-ink-swatches">
                                    {CUSTOM_STAMP_COLORS.map((c) => (
                                      <button
                                        key={c}
                                        type="button"
                                        className={`ink-swatch-dot ${customStampColor === c ? 'active' : ''}`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setCustomStampColor(c)}
                                      />
                                    ))}
                                  </div>
                                  <button type="submit" className="btn-apply-custom-stamp">
                                    Stamp It
                                  </button>
                                </div>
                              </form>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="page-folio-footer">
                <span className="footer-turn-trigger" onClick={() => handlePageTurn('prev')}>
                  {chapterIndex > 0 ? `← Click left edge for Chapter ${toRoman(chapterIndex)}` : '← Back to Frontispiece'}
                </span>
                <span>p. {leftPageNumber}</span>
              </div>
            </div>

            {/* Book Spine Divider with Interactive Silk Bookmark Ribbon */}
            <div className="book-spine">
              <button
                type="button"
                className={`silk-spine-ribbon ${isRibbonBookmarked ? 'is-bookmarked' : ''}`}
                onClick={handleToggleSpineRibbon}
                title={
                  isRibbonBookmarked
                    ? 'Bookmarked Chapter (Click to lift Silk Ribbon)'
                    : 'Click Silk Ribbon to Bookmark & Quick-Save this Chapter'
                }
              >
                <span className="ribbon-gold-stitch" />
                <span className="ribbon-emblem">{isRibbonBookmarked ? '★' : '✦'}</span>
                <span className="ribbon-tail-notch" />
              </button>
            </div>

            {/* RIGHT PAGE */}
            <div className={`book-page right-page ${isDogEared ? 'page-is-dog-eared' : ''}`}>
              {/* Interactive Top-Right Dog-Ear Page Corner Fold (Outline Star = Not Fav, Filled Star = Fav) */}
              <button
                type="button"
                className={`dog-ear-corner-fold ${isDogEared ? 'folded' : ''}`}
                onClick={handleToggleDogEar}
                title={
                  isDogEared
                    ? 'Favorited Chapter (Click to unfold corner)'
                    : 'Click top-right page corner to Dog-Ear as Favorite'
                }
              >
                <span className="dog-ear-under-reveal">
                  <span className={`dog-ear-star ${isDogEared ? 'filled' : 'outlined'}`}>
                    {isDogEared ? '★' : '☆'}
                  </span>
                </span>
                <span className="dog-ear-paper-flap" />
              </button>

              {/* Clickable Right Page Edge Curl to Turn to Next Chapter */}
              <button
                type="button"
                className="page-edge-turner edge-turner-right"
                onClick={() => handlePageTurn('next')}
                title={`Click page edge to turn to Chapter ${toRoman(chapterIndex + 2)}`}
              >
                <span className="page-curl-flap right-curl-flap" />
                <span className="edge-turn-hint right-hint">
                  <span>Next Chapter ({toRoman(chapterIndex + 2)})</span>
                  <ChevronRight size={16} />
                </span>
              </button>

              <div className="page-folio-header page-curved-right">
                <span>Critique & Reflections</span>
                <span>Page {rightPageNumber}</span>
              </div>

              {/* Inner Wrapper that subtly curves with the right page toward the center spine */}
              <div className="page-curve-content right-curve-content">
                {/* Top Section of Right Page: Rating Card on Left + Dynamic (Scene u liked / Quote) Card on Right */}
                <div className="right-page-top-split">
                  {/* Top-Left of Right Page: Rating Card with R1 Corner Seal */}
                  <div className="rating-card-left-wrap">
                    <RatingCard
                      ratings={ratings}
                      onRatingChange={handleRatingChange}
                      waxSeal={waxSeal}
                      onToggleWaxSeal={setWaxSeal}
                      isFiction={isFiction}
                    />
                  </div>

                  {/* Top-Right of Right Page: "Scene u liked" (if fiction) OR "Quote" (if nonFiction) */}
                  <div className="right-top-context-card">
                    <div className="context-card-header">
                      {isFiction ? 'Scene u liked' : 'Quote'}
                    </div>
                    <textarea
                      className="context-card-textarea"
                      placeholder={
                        isFiction
                          ? 'Describe the scene or moment from the story that you liked most...'
                          : '“Write the memorable quote or wisdom from this book that stood out...”'
                      }
                      value={details.favoriteQuote || ''}
                      onChange={(e) => handleDetailChange('favoriteQuote', e.target.value)}
                    />
                  </div>
                </div>

                {/* Summary Section with ruled notebook lines */}
                <Summary value={summary} onChange={setSummary} />
              </div>

              <div className="page-folio-footer">
                <span>p. {rightPageNumber}</span>
                <span
                  className="footer-turn-trigger"
                  onClick={() => handlePageTurn('next')}
                >
                  Turn Page for Chapter {toRoman(chapterIndex + 2)} →
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons under book (Hidden in Read-Only Shared View) */}
          {!isSharedReadOnlyView && (
            <div className="journal-footer-actions">
              <button className="btn-primary" onClick={handleSaveReview}>
                ✦ Save Chapter {chapterRoman}
              </button>
              <button className="btn-secondary" onClick={() => handlePageTurn('next')}>
                Turn to Next Chapter ({toRoman(chapterIndex + 2)}) →
              </button>
            </div>
          )}

          {/* Saved Reviews Shelf (Hidden in Read-Only Shared View) */}
          {!isSharedReadOnlyView && savedReviews.length > 0 && (
            <div className="saved-reviews-container">
              <div className="saved-reviews-title">
                <span>✦ Journal Index — Recorded Chapters ({savedReviews.length})</span>
              </div>
              <div className="reviews-grid">
                {savedReviews.map((rev, idx) => (
                  <div
                    key={rev.id}
                    className={`review-mini-card ${idx === chapterIndex ? 'active-chapter-card' : ''}`}
                    onClick={() => handleLoadReview(rev, idx)}
                    title={`Turn to Chapter ${toRoman(idx + 1)}`}
                  >
                    {rev.coverUrl ? (
                      <img src={rev.coverUrl} alt="Cover" className="mini-cover" />
                    ) : (
                      <div className="mini-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#d4af37' }}>
                        Ch. {toRoman(idx + 1)}
                      </div>
                    )}
                    <div className="mini-info">
                      <div className="mini-chapter-tag">Chapter {toRoman(idx + 1)}</div>
                      <div className="mini-title">{rev.title}</div>
                      <div className="mini-author">{rev.details?.author || 'Unknown'}</div>
                      <div className="mini-rating">
                        Overall: {rev.ratings?.overall || 0}/5 ★
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSavedReview(e, rev.id)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      title="Delete chapter"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
            </>
          )}
        </div>
      ) : (
        /* Full-Screen Wishlist Shelf */
        <WishlistShelf onReviewBook={handleReviewFromWishlist} />
      )}

      {/* 17-Page Limit Dev Popup Modal */}
      <PageLimitDevModal
        isOpen={showPageLimitModal}
        onClose={() => setShowPageLimitModal(false)}
      />

      {/* Shareable Journal Link Modal */}
      {shareLinkModalUrl && (
        <div
          className="share-link-modal-overlay"
          onClick={() => setShareLinkModalUrl('')}
        >
          <div
            className="share-link-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="share-modal-header">
              <span>✦ Shareable Journal Page Link</span>
              <button
                type="button"
                className="seal-picker-close"
                onClick={() => setShareLinkModalUrl('')}
              >
                ✕
              </button>
            </div>
            <p className="share-modal-desc">
              Anyone opening this link in their browser will see this exact journal spread (Read-Only):
            </p>
            <div className="share-url-box">
              <input
                type="text"
                readOnly
                className="share-url-input"
                value={shareLinkModalUrl}
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div className="share-modal-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareLinkModalUrl);
                    showToast('Link copied to clipboard!');
                  } catch {
                    showToast('Select and copy the link above.');
                  }
                }}
              >
                Copy Link
              </button>
              <a
                href={shareLinkModalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary share-open-link-btn"
              >
                Open Link in New Tab ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notice */}
      {toast && <div className="toast-notice">{toast}</div>}
    </div>
  );
}

export default BookReviewPage;

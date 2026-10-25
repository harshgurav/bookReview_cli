import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Lock, User } from 'lucide-react';
import { isFirebaseConfigured, authenticateEmailUser, loginWithGoogleFirebase } from '../firebase';

export const MAX_FREE_CHAPTERS = 17;

export const FAMOUS_BOOK_QUOTES = [
  {
    id: 1,
    quote: '“In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.”',
    answer: 'The Hobbit',
    aliases: ['hobbit', 'the hobbit'],
    authorHint: 'J.R.R. Tolkien',
  },
  {
    id: 2,
    quote: '“I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear. I will permit it to pass over me and through me.”',
    answer: 'Dune',
    aliases: ['dune'],
    authorHint: 'Frank Herbert',
  },
  {
    id: 3,
    quote: '“It was a bright cold day in April, and the clocks were striking thirteen. Big Brother is Watching You.”',
    answer: '1984',
    aliases: ['1984', 'nineteen eighty-four', 'nineteen eighty four'],
    authorHint: 'George Orwell',
  },
  {
    id: 4,
    quote: '“So we beat on, boats against the current, borne back ceaselessly into the past.”',
    answer: 'The Great Gatsby',
    aliases: ['the great gatsby', 'great gatsby', 'gatsby'],
    authorHint: 'F. Scott Fitzgerald',
  },
  {
    id: 5,
    quote: '“It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.”',
    answer: 'Pride and Prejudice',
    aliases: ['pride and prejudice', 'pride & prejudice'],
    authorHint: 'Jane Austen',
  },
  {
    id: 6,
    quote: '“You never really understand a person until you consider things from his point of view... Until you climb inside of his skin and walk around in it.”',
    answer: 'To Kill a Mockingbird',
    aliases: ['to kill a mockingbird', 'kill a mockingbird', 'mockingbird'],
    authorHint: 'Harper Lee',
  },
  {
    id: 7,
    quote: '“All animals are equal, but some animals are more equal than others.”',
    answer: 'Animal Farm',
    aliases: ['animal farm'],
    authorHint: 'George Orwell',
  },
  {
    id: 8,
    quote: '“It was a pleasure to burn. It was a special pleasure to see things eaten, to see things blackened and changed.”',
    answer: 'Fahrenheit 451',
    aliases: ['fahrenheit 451', 'fahrenheit'],
    authorHint: 'Ray Bradbury',
  },
  {
    id: 9,
    quote: '“And, when you want something, all the universe conspires in helping you to achieve it.”',
    answer: 'The Alchemist',
    aliases: ['the alchemist', 'alchemist'],
    authorHint: 'Paulo Coelho',
  },
  {
    id: 10,
    quote: '“It is only with the heart that one can see rightly; what is essential is invisible to the eye.”',
    answer: 'The Little Prince',
    aliases: ['the little prince', 'little prince'],
    authorHint: 'Antoine de Saint-Exupéry',
  },
  {
    id: 11,
    quote: '“Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.”',
    answer: 'Moby-Dick',
    aliases: ['moby dick', 'moby-dick'],
    authorHint: 'Herman Melville',
  },
  {
    id: 12,
    quote: '“Beware; for I am fearless, and therefore powerful.”',
    answer: 'Frankenstein',
    aliases: ['frankenstein'],
    authorHint: 'Mary Shelley',
  },
];

const normalizeAnswer = (str = '') =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/^(the|a|an)\s+/i, '')
    .trim();

/* ==========================================================================
   1. CLOSED LEATHER JOURNAL COVER (WITH MOUSE-DRAG / PULL CLASP & LOGIN)
   ========================================================================== */
export function ClosedLeatherJournal({
  user,
  onLoginSuccess,
  onOpenJournal,
  isOpeningAnim,
}) {
  const [claspPullX, setClaspPullX] = useState(0);
  const [isClaspUnfastened, setIsClaspUnfastened] = useState(false);
  const [showAuthCard, setShowAuthCard] = useState(false);

  // Auth form states
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');

  const dragStartRef = useRef(null);

  const triggerUnclasp = () => {
    setClaspPullX(95);
    setIsClaspUnfastened(true);
    if (user) {
      setTimeout(() => {
        onOpenJournal();
      }, 320);
    } else {
      setTimeout(() => {
        setShowAuthCard(true);
      }, 280);
    }
  };

  const handleClaspPointerDown = (e) => {
    if (isClaspUnfastened) return;
    e.stopPropagation();
    dragStartRef.current = {
      startX: e.clientX,
      moved: false,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!dragStartRef.current || isClaspUnfastened) return;
      const dx = e.clientX - dragStartRef.current.startX;
      if (Math.abs(dx) > 4) {
        dragStartRef.current.moved = true;
      }
      const clamped = Math.max(0, Math.min(100, dx));
      setClaspPullX(clamped);
      if (clamped >= 52) {
        dragStartRef.current = null;
        triggerUnclasp();
      }
    };

    const handlePointerUp = () => {
      if (!dragStartRef.current) return;
      const wasClick = !dragStartRef.current.moved;
      dragStartRef.current = null;
      if (wasClick || claspPullX >= 35) {
        triggerUnclasp();
      } else {
        setClaspPullX(0);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  });

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter your email and password.');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();

    if (isFirebaseConfigured) {
      try {
        const fbUser = await authenticateEmailUser(
          cleanEmail,
          password,
          authMode === 'signup',
          displayName.trim()
        );
        if (fbUser) {
          onLoginSuccess(fbUser);
          setShowAuthCard(false);
          onOpenJournal();
          return;
        }
      } catch (fbErr) {
        setAuthError(fbErr.message || 'Firebase authentication failed.');
        return;
      }
    }

    try {
      const accountsRaw = localStorage.getItem('book_journal_accounts');
      const accounts = accountsRaw ? JSON.parse(accountsRaw) : {};

      if (authMode === 'signup') {
        if (accounts[cleanEmail]) {
          setAuthError('An account with this email already exists. Please sign in.');
          return;
        }
        const newUser = {
          uid: `usr_${Date.now()}`,
          email: cleanEmail,
          name: displayName.trim() || cleanEmail.split('@')[0],
          provider: 'email',
        };
        accounts[cleanEmail] = { ...newUser, password };
        localStorage.setItem('book_journal_accounts', JSON.stringify(accounts));
        onLoginSuccess(newUser);
        setShowAuthCard(false);
        onOpenJournal();
      } else {
        const existing = accounts[cleanEmail];
        if (existing && existing.password === password) {
          onLoginSuccess({
            uid: existing.uid,
            email: existing.email,
            name: existing.name,
            provider: 'email',
          });
          setShowAuthCard(false);
          onOpenJournal();
        } else if (!existing) {
          // Auto-create account on first login for frictionless testing
          const newUser = {
            uid: `usr_${Date.now()}`,
            email: cleanEmail,
            name: cleanEmail.split('@')[0],
            provider: 'email',
          };
          accounts[cleanEmail] = { ...newUser, password };
          localStorage.setItem('book_journal_accounts', JSON.stringify(accounts));
          onLoginSuccess(newUser);
          setShowAuthCard(false);
          onOpenJournal();
        } else {
          setAuthError('Incorrect password for this account.');
        }
      }
    } catch (err) {
      console.error(err);
      setAuthError('Could not sign in.');
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      const gUser = await loginWithGoogleFirebase();
      onLoginSuccess(gUser);
      setShowAuthCard(false);
      onOpenJournal();
    } catch (err) {
      setAuthError(err.message || 'Google Sign-In failed.');
    }
  };

  const handleContinueAsGuest = () => {
    const guestUser = {
      uid: 'guest_local',
      email: 'guest@local',
      name: 'Reader (Guest)',
      isGuest: true,
    };
    onLoginSuccess(guestUser);
    setShowAuthCard(false);
    onOpenJournal();
  };

  return (
    <div className="closed-journal-stage">
      <div className={`closed-leather-book ${isOpeningAnim ? 'book-opening-anim' : ''}`}>
        {/* Page block edges peeking from under the right/bottom cover */}
        <div className="closed-book-page-edges" />

        {/* Ribbed Brown Silk Bookmark Tail Peeking Out Bottom-Left (From Reference Image) */}
        <div className="closed-book-ribbon-tail" />

        {/* Main Cognac / Saddle-Brown Full-Grain Leather Front Cover */}
        <div className="closed-leather-front-cover">
          {/* Left Raised Spine Ridge */}
          <div className="closed-leather-spine-ridge" />

          {/* Perimeter Saddle Stitching */}
          <div className="closed-leather-stitching-frame">
            {/* Center Debossed "JOURNAL" + Botanical Flourish */}
            <div className="closed-journal-emboss-center">
              <div className="embossed-journal-word">JOURNAL</div>
              <div className="embossed-botanical-divider">
                <span className="emboss-line" />
                <svg
                  width="54"
                  height="18"
                  viewBox="0 0 54 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="emboss-floral-svg"
                >
                  <path
                    d="M6 9 C16 9, 22 4, 27 9 C32 14, 38 9, 48 9"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M27 9 C23 4, 19 3, 17 5 C19 8, 23 9, 27 9 Z"
                    fill="currentColor"
                  />
                  <path
                    d="M27 9 C31 4, 35 3, 37 5 C35 8, 31 9, 27 9 Z"
                    fill="currentColor"
                  />
                  <path
                    d="M27 9 C23 14, 19 15, 17 13 C19 10, 23 9, 27 9 Z"
                    fill="currentColor"
                  />
                  <path
                    d="M27 9 C31 14, 35 15, 37 13 C35 10, 31 9, 27 9 Z"
                    fill="currentColor"
                  />
                  <circle cx="27" cy="9" r="2.2" fill="currentColor" />
                </svg>
                <span className="emboss-line" />
              </div>
            </div>

            {/* Subtle bottom instruction when clasp is still closed */}
            {!isClaspUnfastened && (
              <div className="closed-cover-hint">
                Slide or pull the leather clasp on the right to open →
              </div>
            )}
          </div>

          {/* Interactive Stitched Leather Magnetic Clasp Strap (Right Edge) */}
          <div
            className={`leather-clasp-strap ${isClaspUnfastened ? 'unfastened' : ''}`}
            style={{
              transform: `translateY(-50%) translateX(${claspPullX}px) rotateY(${Math.min(55, claspPullX * 0.6)}deg)`,
            }}
            onPointerDown={handleClaspPointerDown}
            title="Drag right or click to unfasten the leather journal clasp"
          >
            <div className="leather-clasp-stitching">
              <div className="leather-clasp-snap-button" />
            </div>
          </div>
        </div>

        {/* 3D Turning Leather Cover Leaf (Matching Page Turn Animation) */}
        {isOpeningAnim && (
          <div className="turning-cover-leaf turn-cover-open" aria-hidden="true">
            <div className="cover-leaf-front-face">
              <div className="closed-leather-spine-ridge" />
              <div className="closed-leather-stitching-frame">
                <div className="closed-journal-emboss-center">
                  <div className="embossed-journal-word">JOURNAL</div>
                  <div className="embossed-botanical-divider">
                    <span className="emboss-line" />
                    <svg
                      width="54"
                      height="18"
                      viewBox="0 0 54 18"
                      fill="none"
                      className="emboss-floral-svg"
                    >
                      <path
                        d="M6 9 C16 9, 22 4, 27 9 C32 14, 38 9, 48 9"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M27 9 C23 4, 19 3, 17 5 C19 8, 23 9, 27 9 Z"
                        fill="currentColor"
                      />
                      <path
                        d="M27 9 C31 4, 35 3, 37 5 C35 8, 31 9, 27 9 Z"
                        fill="currentColor"
                      />
                      <path
                        d="M27 9 C23 14, 19 15, 17 13 C19 10, 23 9, 27 9 Z"
                        fill="currentColor"
                      />
                      <path
                        d="M27 9 C31 14, 35 15, 37 13 C35 10, 31 9, 27 9 Z"
                        fill="currentColor"
                      />
                      <circle cx="27" cy="9" r="2.2" fill="currentColor" />
                    </svg>
                    <span className="emboss-line" />
                  </div>
                </div>
              </div>
            </div>
            <div className="cover-leaf-back-face">
              <div className="inside-cover-endpaper">
                <div className="leaf-ruled-texture" />
                <div className="inside-cover-exlibris-seal">✦ EX LIBRIS ✦</div>
              </div>
            </div>
          </div>
        )}

        {/* Auth / Login Overlay Card (Appears once clasp is unfastened if not signed in) */}
        {showAuthCard && (
          <div className="leather-auth-overlay" onClick={(e) => e.stopPropagation()}>
            <div className="leather-auth-card">
              <div className="auth-card-seal">✦ EX LIBRIS LEDGER ✦</div>
              <h3 className="auth-card-title">
                {authMode === 'login' ? 'Unlock Your Journal' : 'Inscribe New Ledger'}
              </h3>
              <p className="auth-card-subtitle">
                Sign in to save your chapters & favorites, or open as Guest
              </p>

              <form onSubmit={handleAuthSubmit} className="leather-auth-form">
                {authMode === 'signup' && (
                  <input
                    type="text"
                    placeholder="Reader Name (e.g. Harsh)"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="leather-auth-input"
                  />
                )}
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="leather-auth-input"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="leather-auth-input"
                  required
                />
                {authError && <div className="leather-auth-error">{authError}</div>}

                <button type="submit" className="btn-leather-auth-submit">
                  <Lock size={14} />
                  <span>{authMode === 'login' ? 'Sign In & Open Book' : 'Create Account & Open'}</span>
                </button>
              </form>

              <div className="leather-auth-divider">
                <span>or</span>
              </div>

              {isFirebaseConfigured && (
                <button
                  type="button"
                  className="btn-leather-guest"
                  style={{ marginBottom: '8px' }}
                  onClick={handleGoogleSignIn}
                >
                  <span>Sign In with Google</span>
                </button>
              )}

              <button
                type="button"
                className="btn-leather-guest"
                onClick={handleContinueAsGuest}
              >
                <User size={14} />
                <span>Continue as Guest</span>
              </button>

              <div className="leather-auth-switch">
                {authMode === 'login' ? (
                  <button type="button" onClick={() => { setAuthMode('signup'); setAuthError(''); }}>
                    New reader? Inscribe a new account
                  </button>
                ) : (
                  <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); }}>
                    Already have a ledger? Sign in
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   2. SPREAD 0: OPENING FRONTISPIECE SPREAD
      - Left Page: Famous Book Quote Guessing Game + Correct Guess Counter
      - Right Page: Index of All Favorite Books (Dog-Eared / Bookmarked)
   ========================================================================== */
export function OpeningFrontispieceSpread({
  savedReviews = [],
  quoteScore = 0,
  onIncrementQuoteScore,
  onCloseBookToCover,
  onEnterFirstChapter,
  onJumpToChapter,
  turnAnimation,
  toRoman,
}) {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [guessInput, setGuessInput] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'correct' | 'wrong' | 'revealed', msg: string }
  const [showAuthorHint, setShowAuthorHint] = useState(false);
  const [solvedCurrent, setSolvedCurrent] = useState(false);

  const currentQuote = FAMOUS_BOOK_QUOTES[quoteIdx % FAMOUS_BOOK_QUOTES.length];

  const handleCheckGuess = (e) => {
    e.preventDefault();
    if (!guessInput.trim()) return;

    const cleanUser = normalizeAnswer(guessInput);
    const isMatch = currentQuote.aliases.some(
      (alias) =>
        normalizeAnswer(alias) === cleanUser ||
        (cleanUser.length >= 4 && normalizeAnswer(alias).includes(cleanUser))
    );

    if (isMatch) {
      if (!solvedCurrent) {
        setSolvedCurrent(true);
        if (onIncrementQuoteScore) onIncrementQuoteScore();
      }
      setFeedback({
        type: 'correct',
        msg: `✦ Correct! "${currentQuote.answer}" by ${currentQuote.authorHint}`,
      });
    } else {
      setFeedback({
        type: 'wrong',
        msg: 'Not quite — try again or reveal a hint!',
      });
    }
  };

  const handleNextQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % FAMOUS_BOOK_QUOTES.length);
    setGuessInput('');
    setFeedback(null);
    setShowAuthorHint(false);
    setSolvedCurrent(false);
  };

  // All favorite books (Dog-eared with ★ on top-right corner, or silk-ribbon bookmarked)
  const favoriteChapters = savedReviews
    .map((rev, idx) => ({ ...rev, chapterIdx: idx }))
    .filter((rev) => rev.isDogEared || rev.isRibbonBookmarked);

  return (
    <div className={`book-spread grain-rough-active frontispiece-spread ${turnAnimation ? `is-turning-${turnAnimation}` : ''}`}>
      {/* Realistic 3D Turning Page Leaf or Turning Leather Cover Leaf */}
      {turnAnimation === 'cover-close' ? (
        <div className="turning-cover-leaf turn-cover-close" aria-hidden="true">
          <div className="cover-leaf-front-face">
            <div className="closed-leather-spine-ridge" />
            <div className="closed-leather-stitching-frame">
              <div className="closed-journal-emboss-center">
                <div className="embossed-journal-word">JOURNAL</div>
                <div className="embossed-botanical-divider">
                  <span className="emboss-line" />
                  <svg
                    width="54"
                    height="18"
                    viewBox="0 0 54 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="emboss-floral-svg"
                  >
                    <path
                      d="M6 9 C16 9, 22 4, 27 9 C32 14, 38 9, 48 9"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <path
                      d="M27 9 C23 4, 19 3, 17 5 C19 8, 23 9, 27 9 Z"
                      fill="currentColor"
                    />
                    <path
                      d="M27 9 C31 4, 35 3, 37 5 C35 8, 31 9, 27 9 Z"
                      fill="currentColor"
                    />
                    <path
                      d="M27 9 C23 14, 19 15, 17 13 C19 10, 23 9, 27 9 Z"
                      fill="currentColor"
                    />
                    <path
                      d="M27 9 C31 14, 35 15, 37 13 C35 10, 31 9, 27 9 Z"
                      fill="currentColor"
                    />
                    <circle cx="27" cy="9" r="2.2" fill="currentColor" />
                  </svg>
                  <span className="emboss-line" />
                </div>
              </div>
            </div>
          </div>
          <div className="cover-leaf-back-face">
            <div className="inside-cover-endpaper">
              <div className="leaf-ruled-texture" />
              <div className="inside-cover-exlibris-seal">✦ EX LIBRIS ✦</div>
            </div>
          </div>
        </div>
      ) : turnAnimation ? (
        <div className={`turning-page-leaf turn-${turnAnimation}`} aria-hidden="true">
          <div className="leaf-front-face">
            <div className="leaf-ruled-texture" />
          </div>
          <div className="leaf-back-face">
            <div className="leaf-ruled-texture" />
          </div>
        </div>
      ) : null}

      {/* ======================== LEFT PAGE: QUOTE GUESSING GAME ======================== */}
      <div className="book-page left-page">
        {/* Left Edge Curl: Close Book Back to Leather Cover */}
        <button
          type="button"
          className="page-edge-turner edge-turner-left"
          onClick={onCloseBookToCover}
          title="Close journal back to leather cover"
        >
          <span className="page-curl-flap left-curl-flap" />
          <span className="edge-turn-hint left-hint">
            <ChevronLeft size={16} />
            <span>Close Cover</span>
          </span>
        </button>

        <div className="page-folio-header page-curved-left">
          <span>Ex Libris • Frontispiece</span>
          <span className="quote-score-counter-badge">
            ✦ Right Guesses: <strong>{quoteScore}</strong>
          </span>
        </div>

        <div className="page-curve-content left-curve-content frontispiece-left-body">
          <div className="quote-game-plaque">
            <div className="quote-game-header">
              <span className="quote-game-ornament">❦</span>
              <h3>Guess the Book from the Quote</h3>
              <span className="quote-game-sub">Riddle #{(quoteIdx % FAMOUS_BOOK_QUOTES.length) + 1} of {FAMOUS_BOOK_QUOTES.length}</span>
            </div>

            <blockquote className="quote-game-passage">
              {currentQuote.quote}
            </blockquote>

            {showAuthorHint && (
              <div className="quote-author-hint-pill">
                Hint — Author: <strong>{currentQuote.authorHint}</strong>
              </div>
            )}

            <form onSubmit={handleCheckGuess} className="quote-guess-form">
              <label className="quote-guess-label">Name of the Book:</label>
              <div className="quote-guess-input-row">
                <input
                  type="text"
                  className="quote-guess-input"
                  placeholder="Type the book title here..."
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                />
                <button type="submit" className="btn-quote-submit">
                  Check
                </button>
              </div>
            </form>

            {feedback && (
              <div className={`quote-feedback-banner ${feedback.type}`}>
                {feedback.msg}
              </div>
            )}

            <div className="quote-game-footer-Controls">
              <button
                type="button"
                className="btn-quote-secondary"
                onClick={() => setShowAuthorHint(true)}
              >
                Hint
              </button>
              <button
                type="button"
                className="btn-quote-secondary"
                onClick={() => {
                  setFeedback({
                    type: 'revealed',
                    msg: `Answer: "${currentQuote.answer}" (${currentQuote.authorHint})`,
                  });
                }}
              >
                Reveal Answer
              </button>
              <button
                type="button"
                className="btn-quote-next"
                onClick={handleNextQuote}
              >
                Next Quote →
              </button>
            </div>
          </div>
        </div>

        <div className="page-folio-footer">
          <span className="footer-turn-trigger" onClick={onCloseBookToCover}>
            ← Close Journal Cover
          </span>
          <span>p. i</span>
        </div>
      </div>

      {/* ======================== CENTER BOOK SPINE ======================== */}
      <div className="book-spine" />

      {/* ======================== RIGHT PAGE: INDEX OF FAVORITE BOOKS ======================== */}
      <div className="book-page right-page">
        {/* Right Edge Curl: Turn to Chapter I */}
        <button
          type="button"
          className="page-edge-turner edge-turner-right"
          onClick={onEnterFirstChapter}
          title="Turn page to Chapter I"
        >
          <span className="page-curl-flap right-curl-flap" />
          <span className="edge-turn-hint right-hint">
            <span>Open Chapter I</span>
            <ChevronRight size={16} />
          </span>
        </button>

        <div className="page-folio-header page-curved-right">
          <span>Index of Personal Favorites</span>
          <span>p. ii</span>
        </div>

        <div className="page-curve-content right-curve-content frontispiece-right-body">
          <div className="favorites-index-plaque">
            <div className="favorites-index-header">
              <h3>★ Favourite Books Ledger</h3>
              <p>Books you dog-eared (★) or bookmarked in your journal</p>
            </div>

            {favoriteChapters.length === 0 ? (
              <div className="favorites-empty-state">
                <div className="favorites-empty-star">☆</div>
                <p>No favourite books dog-eared yet.</p>
                <span>
                  Fold the top-right star corner (★) on any review page and it will automatically be indexed here!
                </span>
              </div>
            ) : (
              <div className="favorites-ledger-list">
                {favoriteChapters.map((fav, i) => (
                  <button
                    key={fav.id || i}
                    type="button"
                    className="favorite-index-row"
                    onClick={() => onJumpToChapter(fav.chapterIdx)}
                    title={`Jump to Chapter ${toRoman(fav.chapterIdx + 1)}: ${fav.title}`}
                  >
                    <span className="fav-row-chapter">
                      Ch. {toRoman(fav.chapterIdx + 1)}
                    </span>
                    <div className="fav-row-main">
                      <span className="fav-row-title">{fav.title}</span>
                      <span className="fav-row-author">
                        {fav.details?.author ? `by ${fav.details.author}` : ''}
                      </span>
                    </div>
                    <span className="fav-row-dots" />
                    <span className="fav-row-rating">
                      ★ {fav.ratings?.overall || 5}/5
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="favorites-index-bottom-cta">
              <button
                type="button"
                className="btn-enter-ledger-main"
                onClick={onEnterFirstChapter}
              >
                <span>Begin Reading Ledger (Chapter I)</span>
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>

        <div className="page-folio-footer">
          <span>p. ii</span>
          <span className="footer-turn-trigger" onClick={onEnterFirstChapter}>
            Turn Page for Chapter I →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   3. 17-PAGE LIMIT POPUP MODAL (DEV AWS MESSAGE + GITHUB LINK)
   ========================================================================== */
export function PageLimitDevModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="share-link-modal-overlay" onClick={onClose}>
      <div className="share-link-modal dev-limit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <span>✦ Out of Parchment Pages</span>
          <button type="button" className="seal-picker-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="dev-limit-message">
          the dev has no money to put this on aws if u want dev should add more pages then below is his details send your money there
        </p>

        <div className="dev-limit-link-box">
          <a
            href="https://github.com/harshgurav"
            target="_blank"
            rel="noopener noreferrer"
            className="dev-github-link"
          >
            github.com/harshgurav ↗
          </a>
        </div>

        <div className="share-modal-actions">
          <button type="button" className="btn-primary" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

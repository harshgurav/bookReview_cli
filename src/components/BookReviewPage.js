import React, { useState, useEffect, useCallback, useRef } from 'react';
import BookDetails from './BookDetails';
import BookCover from './BookCover';
import RatingCard from './RatingCard';
import Summary from './Summary';
import ShareButton from './ShareButton';
import './JournalPage.css';

function BookReviewPage() {
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'wishlist'
  const [title, setTitle] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [apiSource, setApiSource] = useState('');
  const [coverLoading, setCoverLoading] = useState(false);
  const [toast, setToast] = useState('');

  const [details, setDetails] = useState({
    author: '',
    bookType: 'fiction', // default checked as in mockup
    genre: '',
    dateStarted: '',
    dateEnded: '',
  });

  const [ratings, setRatings] = useState({
    character: 2, // initial default matching screenshot
    story: 0,
    readability: 0,
    overall: 0,
  });

  const [summary, setSummary] = useState('');
  const [savedReviews, setSavedReviews] = useState([]);

  const isInitialMount = useRef(true);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Load saved reviews on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('digital_book_reviews');
      if (stored) {
        setSavedReviews(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed reading localStorage', e);
    }
  }, []);

  // Fetch book cover: Google Books with Open Library fallback
  const searchBookData = useCallback(async (bookTitle) => {
    const trimmed = bookTitle.trim();
    if (trimmed.length < 2) {
      setCoverUrl('');
      setApiSource('');
      return;
    }

    setCoverLoading(true);

    // 1. Try Google Books API
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(trimmed)}&maxResults=1`
      );

      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const info = data.items[0].volumeInfo || {};
          let thumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
          if (thumb) {
            thumb = thumb.replace(/^http:\/\//i, 'https://');
            setCoverUrl(thumb);
            setApiSource('Google Books');

            // Auto-populate author & genre if currently empty
            setDetails((prev) => ({
              ...prev,
              author: prev.author || (info.authors ? info.authors[0] : ''),
              genre: prev.genre || (info.categories ? info.categories[0] : ''),
            }));

            setCoverLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Google Books API attempt failed, trying fallback...', err);
    }

    // 2. Fallback to Open Library
    try {
      const olRes = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(trimmed)}&limit=1`
      );
      if (olRes.ok) {
        const olData = await olRes.json();
        const doc = olData.docs?.[0];
        if (doc) {
          if (doc.cover_i) {
            setCoverUrl(`https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`);
            setApiSource('Open Library');
          } else {
            setCoverUrl('');
            setApiSource('');
          }

          setDetails((prev) => ({
            ...prev,
            author: prev.author || (doc.author_name ? doc.author_name[0] : ''),
            genre: prev.genre || (doc.subject ? doc.subject[0] : ''),
          }));

          setCoverLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Open Library fallback failed:', err);
    }

    setCoverUrl('');
    setApiSource('');
    setCoverLoading(false);
  }, []);

  // Debounced auto-search when title changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      searchBookData(title);
    }, 700);

    return () => clearTimeout(timer);
  }, [title, searchBookData]);

  const handleDetailChange = (key, val) => {
    setDetails((prev) => ({ ...prev, [key]: val }));
  };

  const handleRatingChange = (key, val) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveReview = () => {
    if (!title.trim()) {
      showToast('⚠️ Please provide a book title before saving.');
      return;
    }

    const newReview = {
      id: Date.now(),
      title,
      coverUrl,
      apiSource,
      details,
      ratings,
      summary,
      updatedAt: new Date().toLocaleDateString(),
    };

    const updated = [newReview, ...savedReviews.filter((r) => r.title !== title)];
    setSavedReviews(updated);
    try {
      localStorage.setItem('digital_book_reviews', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    showToast('📖 Review saved to your journal!');
  };

  const handleLoadReview = (rev) => {
    setTitle(rev.title || '');
    setCoverUrl(rev.coverUrl || '');
    setApiSource(rev.apiSource || '');
    setDetails(rev.details || { author: '', bookType: 'fiction', genre: '', dateStarted: '', dateEnded: '' });
    setRatings(rev.ratings || { character: 0, story: 0, readability: 0, overall: 0 });
    setSummary(rev.summary || '');
    showToast(`Loaded "${rev.title}"`);
  };

  const handleClear = () => {
    setTitle('');
    setCoverUrl('');
    setApiSource('');
    setDetails({ author: '', bookType: 'fiction', genre: '', dateStarted: '', dateEnded: '' });
    setRatings({ character: 0, story: 0, readability: 0, overall: 0 });
    setSummary('');
    showToast('Cleared journal page.');
  };

  const handleShare = async () => {
    const textToShare = `📚 Book Review: ${title || 'Untitled'}\n` +
      `✍️ Author: ${details.author || 'N/A'}\n` +
      `📖 Type: ${details.bookType || 'N/A'} | Genre: ${details.genre || 'N/A'}\n` +
      `⭐ Ratings: Character (${ratings.character}/5), Story (${ratings.story}/5), Readability (${ratings.readability}/5), Overall (${ratings.overall}/5)\n\n` +
      `📝 Summary:\n${summary || 'No summary written yet.'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Book Review - ${title}`,
          text: textToShare,
        });
        showToast('Shared successfully!');
        return;
      } catch (e) {
        // user cancelled or fallback
      }
    }

    try {
      await navigator.clipboard.writeText(textToShare);
      showToast('📋 Review copied to clipboard!');
    } catch (e) {
      showToast('⚠️ Could not copy to clipboard.');
    }
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="app-title">📖 Digital Book Journal</div>
        <div className="header-actions">
          <button
            className={`nav-tab-btn ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            Review Page (v1)
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            Wishlist Shelf (v2 Preview)
          </button>
        </div>
      </header>

      {activeTab === 'review' ? (
        /* Journal Workspace */
        <div className="journal-workspace">
          {/* Share Button (top right of workspace) */}
          <div className="workspace-top-bar">
            <ShareButton onShare={handleShare} />
          </div>

          {/* Open Journal Book Spread */}
          <div className="book-spread">
            {/* LEFT PAGE */}
            <div className="book-page left-page">
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

              {/* Left Page Body: Details on left, Cover on right */}
              <div className="left-page-body">
                <BookDetails details={details} onChange={handleDetailChange} />
                <BookCover
                  coverUrl={coverUrl}
                  loading={coverLoading}
                  apiSource={apiSource}
                />
              </div>
            </div>

            {/* Book Spine Divider */}
            <div className="book-spine" />

            {/* RIGHT PAGE */}
            <div className="book-page right-page">
              {/* Rating Card */}
              <RatingCard
                ratings={ratings}
                onRatingChange={handleRatingChange}
              />

              {/* Summary Section with ruled notebook lines */}
              <Summary value={summary} onChange={setSummary} />
            </div>
          </div>

          {/* Action buttons under book */}
          <div className="journal-footer-actions">
            <button className="btn-primary" onClick={handleSaveReview}>
              💾 Save Review
            </button>
            <button className="btn-secondary" onClick={handleClear}>
              ✨ New / Clear
            </button>
          </div>

          {/* Saved Reviews Library */}
          {savedReviews.length > 0 && (
            <div className="saved-reviews-container">
              <div className="saved-reviews-title">
                <span>📚 Your Saved Journal Entries ({savedReviews.length})</span>
              </div>
              <div className="reviews-grid">
                {savedReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="review-mini-card"
                    onClick={() => handleLoadReview(rev)}
                    title="Click to load this review"
                  >
                    {rev.coverUrl ? (
                      <img src={rev.coverUrl} alt="Cover" className="mini-cover" />
                    ) : (
                      <div className="mini-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#888' }}>
                        No Cover
                      </div>
                    )}
                    <div className="mini-info">
                      <div className="mini-title">{rev.title}</div>
                      <div className="mini-author">{rev.details?.author || 'Unknown'}</div>
                      <div className="mini-rating">
                        Overall: {rev.ratings?.overall || 0}/5 ★
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Wishlist Page Preview (Screenshot 1) */
        <div className="wishlist-container">
          <h2>📚 Wishlist Bookshelf</h2>
          <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>
            As designed in Screenshot 1: A shelf spanning the horizontal space of the desktop screen.
            Coming in v2!
          </p>
          <div style={{ padding: '20px', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
              Shelf layout preview based on Excalidraw design:
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <div style={{
                width: '100%',
                maxWidth: '650px',
                borderBottom: '8px solid #8b5a2b',
                padding: '20px 0 0',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'flex-end',
                height: '140px'
              }}>
                <div style={{ width: '40px', height: '110px', background: '#3182ce', borderRadius: '3px 3px 0 0', writingMode: 'vertical-rl', textAlign: 'center', fontSize: '11px', color: '#fff', padding: '4px' }}>Dune</div>
                <div style={{ width: '35px', height: '95px', background: '#805ad5', borderRadius: '3px 3px 0 0', writingMode: 'vertical-rl', textAlign: 'center', fontSize: '11px', color: '#fff', padding: '4px' }}>1984</div>
                <div style={{ width: '50px', height: '125px', background: '#38a169', borderRadius: '3px 3px 0 0', writingMode: 'vertical-rl', textAlign: 'center', fontSize: '11px', color: '#fff', padding: '4px' }}>Hobbit</div>
                <span style={{ fontSize: '32px' }}>🪴</span>
                <div style={{ width: '38px', height: '100px', background: '#dd6b20', borderRadius: '3px 3px 0 0', writingMode: 'vertical-rl', textAlign: 'center', fontSize: '11px', color: '#fff', padding: '4px' }}>Sapiens</div>
              </div>
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

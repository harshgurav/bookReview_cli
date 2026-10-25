import React, { useState, useEffect, useRef } from 'react';

function BookCover({ coverUrl, loading, onCustomCoverChange }) {
  const [imgError, setImgError] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrlDraft, setCustomUrlDraft] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setImgError(false);
  }, [coverUrl]);

  const handleApplyUrl = (e) => {
    e.preventDefault();
    const trimmed = customUrlDraft.trim();
    if (!trimmed) return;
    if (onCustomCoverChange) {
      onCustomCoverChange(trimmed);
    }
    setCustomUrlDraft('');
    setShowUrlInput(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !onCustomCoverChange) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 240;
        const maxH = 360;
        let w = img.width;
        let h = img.height;
        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
        onCustomCoverChange(compressedDataUrl);
        setShowUrlInput(false);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="cover-column">
      <div className="cover-scrapbook-mount">
        {/* 4 Corner Journal Washi / Paper Masking Tapes */}
        <span className="journal-tape tape-top-left" aria-hidden="true" />
        <span className="journal-tape tape-top-right" aria-hidden="true" />
        <span className="journal-tape tape-bottom-left" aria-hidden="true" />
        <span className="journal-tape tape-bottom-right" aria-hidden="true" />

        {/* Kraft Deckle-Edge Paper Border Frame */}
        <div className="cover-card">
          {loading ? (
            <div className="cover-loading-spinner">
              <div className="spinner"></div>
              <span>Fetching cover...</span>
            </div>
          ) : coverUrl && !imgError ? (
            <>
              <img
                src={coverUrl}
                alt="Book Cover"
                className="cover-image"
                onError={() => setImgError(true)}
              />
              {onCustomCoverChange && (
                <button
                  type="button"
                  className="cover-change-mini-btn"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                    onCustomCoverChange('');
                  }}
                  title="Remove cover"
                  aria-label="Remove cover"
                >
                  ✕
                </button>
              )}
            </>
          ) : (
            <div className="cover-placeholder">
              <div className="cover-placeholder-title">Book Cover</div>
              <div className="cover-placeholder-sub">
                Type the title
              </div>
              {onCustomCoverChange && !showUrlInput && (
                <div className="cover-custom-actions">
                  <button
                    type="button"
                    className="cover-upload-link-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    + Upload Image
                  </button>
                  <button
                    type="button"
                    className="cover-upload-link-btn"
                    onClick={() => setShowUrlInput(true)}
                  >
                    Paste URL
                  </button>
                </div>
              )}
              {onCustomCoverChange && showUrlInput && (
                <form className="cover-url-mini-form" onSubmit={handleApplyUrl}>
                  <input
                    type="url"
                    className="cover-url-mini-input"
                    placeholder="https://..."
                    value={customUrlDraft}
                    onChange={(e) => setCustomUrlDraft(e.target.value)}
                    autoFocus
                  />
                  <div className="cover-url-mini-btns">
                    <button type="submit">Set</button>
                    <button type="button" onClick={() => setShowUrlInput(false)}>✕</button>
                  </div>
                </form>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
}

export default BookCover;

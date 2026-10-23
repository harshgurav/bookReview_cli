import React from 'react';

function BookCover({ coverUrl, loading, apiSource, onRetry }) {
  return (
    <div className="cover-column">
      <div className="cover-card">
        {loading ? (
          <div className="cover-loading-spinner">
            <div className="spinner"></div>
            <span>Fetching cover...</span>
          </div>
        ) : coverUrl ? (
          <>
            <img
              src={coverUrl}
              alt="Book Cover"
              className="cover-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {apiSource && (
              <span className="cover-api-badge" title={`Fetched via ${apiSource}`}>
                {apiSource}
              </span>
            )}
          </>
        ) : (
          <div className="cover-placeholder">
            <div className="cover-placeholder-title">Book Cover</div>
            <div className="cover-placeholder-sub">
              &#123; API from google books &#125;
            </div>
            <div style={{ marginTop: '10px', fontSize: '11px', opacity: 0.6 }}>
              Type book title above
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookCover;

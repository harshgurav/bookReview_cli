import React from 'react';

function BookDetails({ details, onChange }) {
  const toggleBookType = (type) => {
    // If clicked the already selected type, unselect or keep it selected
    onChange('bookType', details.bookType === type ? '' : type);
  };

  return (
    <div className="details-column">
      {/* Author */}
      <div className="detail-row">
        <span className="detail-label">Author:</span>
        <input
          type="text"
          className="detail-input"
          value={details.author || ''}
          onChange={(e) => onChange('author', e.target.value)}
          placeholder="e.g. George Orwell"
        />
      </div>

      {/* BookType: fiction / nonFiction */}
      <div className="detail-row">
        <span className="detail-label">BookType:</span>
        <div className="booktype-options">
          <label
            className="booktype-label"
            onClick={() => toggleBookType('fiction')}
          >
            <span
              className={`custom-checkbox ${
                details.bookType === 'fiction' ? 'checked' : ''
              }`}
            />
            <span>fiction</span>
          </label>

          <label
            className="booktype-label"
            onClick={() => toggleBookType('nonFiction')}
          >
            <span
              className={`custom-checkbox ${
                details.bookType === 'nonFiction' ? 'checked' : ''
              }`}
            />
            <span>nonFiction</span>
          </label>
        </div>
      </div>

      {/* Genre */}
      <div className="detail-row">
        <span className="detail-label">Genre:</span>
        <input
          type="text"
          className="detail-input"
          value={details.genre || ''}
          onChange={(e) => onChange('genre', e.target.value)}
          placeholder="e.g. Dystopian / Sci-Fi"
        />
      </div>

      {/* Date Started */}
      <div className="detail-row">
        <span className="detail-label">date started :</span>
        <input
          type="date"
          className="detail-input"
          value={details.dateStarted || ''}
          onChange={(e) => onChange('dateStarted', e.target.value)}
        />
      </div>

      {/* Date Ended */}
      <div className="detail-row">
        <span className="detail-label">date ended :</span>
        <input
          type="date"
          className="detail-input"
          value={details.dateEnded || ''}
          onChange={(e) => onChange('dateEnded', e.target.value)}
        />
      </div>
    </div>
  );
}

export default BookDetails;

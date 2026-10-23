import React from 'react';

function RatingCard({ ratings, onRatingChange }) {
  const criteria = [
    { key: 'character', label: 'Charcter' },
    { key: 'story', label: 'Story' },
    { key: 'readability', label: 'Readability' },
    { key: 'overall', label: 'overall' },
  ];

  const handleDotClick = (criterionKey, value) => {
    // If clicking current rating, allow clearing
    const currentVal = ratings[criterionKey] || 0;
    const newVal = currentVal === value ? 0 : value;
    onRatingChange(criterionKey, newVal);
  };

  return (
    <div className="rating-card">
      <div className="rating-header">Rating</div>
      <div className="rating-rows">
        {criteria.map((item) => {
          const currentScore = ratings[item.key] || 0;
          return (
            <div key={item.key} className="rating-row">
              <span className="rating-criterion-label">{item.label}</span>
              <div className="rating-dots">
                {[1, 2, 3, 4, 5].map((num) => {
                  const isFilled = num <= currentScore;
                  return (
                    <button
                      key={num}
                      type="button"
                      className={`rating-dot ${isFilled ? 'active' : ''}`}
                      onClick={() => handleDotClick(item.key, num)}
                      title={`${item.label}: ${num}/5`}
                    >
                      {isFilled ? '✕' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RatingCard;

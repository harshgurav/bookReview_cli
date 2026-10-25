import React, { useState, useEffect, useRef } from 'react';

const WAX_SEALS = [
  { id: 'masterpiece', label: '★ MASTERPIECE', sub: 'EX LIBRIS SEAL', color: '#8b1e16' },
  { id: 'recommended', label: '✦ MUST READ', sub: 'APPROVED TOME', color: '#1e4d2b' },
  { id: 'memorable', label: '♛ GOLD STANDARD', sub: 'FIRST CLASS', color: '#8c5a14' },
  { id: 'classic', label: '❖ TIMELESS', sub: 'ESSENTIAL WORK', color: '#1f3a60' },
  { id: 'mixed', label: '§ CURIOUS TOME', sub: 'MIXED VERDICT', color: '#4a2c40' },
];

function RatingCard({ ratings, onRatingChange, waxSeal = 'masterpiece', onToggleWaxSeal, isFiction = true }) {
  const [showSealMenu, setShowSealMenu] = useState(false);
  const sealContainerRef = useRef(null);

  useEffect(() => {
    if (!showSealMenu) return undefined;
    const handleOutsideClick = (e) => {
      if (sealContainerRef.current && !sealContainerRef.current.contains(e.target)) {
        setShowSealMenu(false);
      }
    };
    window.addEventListener('pointerdown', handleOutsideClick);
    return () => window.removeEventListener('pointerdown', handleOutsideClick);
  }, [showSealMenu]);

  const criteria = isFiction
    ? [
        { key: 'character', label: 'Character' },
        { key: 'story', label: 'Story' },
        { key: 'readability', label: 'Readability' },
        { key: 'overall', label: 'Overall' },
      ]
    : [
        { key: 'character', label: 'Insight' },
        { key: 'story', label: 'Clarity' },
        { key: 'readability', label: 'Readability' },
        { key: 'overall', label: 'Overall' },
      ];

  const handleDotClick = (criterionKey, value) => {
    const currentVal = ratings[criterionKey] || 0;
    const newVal = currentVal === value ? 0 : value;
    onRatingChange(criterionKey, newVal);
  };

  const currentSealObj = WAX_SEALS.find((s) => s.id === waxSeal) || WAX_SEALS[0];

  return (
    <div className="rating-card">
      {/* R1: Solid Ink-Filled Round Seal on the Top-Right Corner of Rating Card */}
      <div className="r1-seal-container" ref={sealContainerRef}>
        <button
          type="button"
          className="r1-wax-seal-stamp"
          style={{ '--seal-color': currentSealObj.color }}
          onClick={(e) => {
            e.stopPropagation();
            setShowSealMenu((prev) => !prev);
          }}
          title="Click to choose your Corner Seal of Approval"
        >
          <span className="wax-seal-ornament">✦</span>
          <span className="wax-seal-main-text">{currentSealObj.label}</span>
          <span className="wax-seal-sub-text">{currentSealObj.sub}</span>
        </button>

        {/* Dropdown List of Corner Seals when Clicked */}
        {showSealMenu && (
          <div className="r1-seal-picker-dropdown" onClick={(e) => e.stopPropagation()}>
            <div className="seal-picker-title">Select Corner Seal</div>
            <div className="r1-seal-options-list">
              {WAX_SEALS.map((seal) => (
                <button
                  key={seal.id}
                  type="button"
                  className={`r1-seal-option-btn ${seal.id === currentSealObj.id ? 'selected' : ''}`}
                  style={{ '--opt-color': seal.color }}
                  onClick={() => {
                    if (onToggleWaxSeal) onToggleWaxSeal(seal.id);
                    setShowSealMenu(false);
                  }}
                >
                  <span className="r1-opt-dot" style={{ backgroundColor: seal.color }} />
                  <span>{seal.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

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
                      aria-label={`${item.label} rating ${num}`}
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

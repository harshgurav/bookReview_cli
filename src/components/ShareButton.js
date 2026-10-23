import React from 'react';

function ShareButton({ onShare }) {
  return (
    <button
      type="button"
      className="share-btn"
      onClick={onShare}
      title="Share your book review"
    >
      <span style={{ fontSize: '17px', lineHeight: 1 }}>↗</span>
      <span>share</span>
    </button>
  );
}

export default ShareButton;

import React from 'react';
import { Share2 } from 'lucide-react';

function ShareButton({ onShare }) {
  return (
    <button
      type="button"
      className="share-btn"
      onClick={onShare}
      title="Share or export your book review page"
    >
      <Share2 size={16} strokeWidth={2.2} />
      <span>share</span>
    </button>
  );
}

export default ShareButton;

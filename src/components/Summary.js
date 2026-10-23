import React from 'react';

function Summary({ value, onChange }) {
  return (
    <div className="summary-section">
      <h3 className="summary-heading">Summary</h3>
      <div className="ruled-notebook-area">
        <textarea
          className="ruled-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your thoughts, reflections, or summary here..."
          rows={6}
        />
      </div>
    </div>
  );
}

export default Summary;

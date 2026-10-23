import React from 'react';

function StarRating({ label, rating, onRate }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
      <span style={{ width: '120px', fontSize: '14px', color: '#ddd' }}>{label}</span>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => onRate(star)}
            style={{
              cursor: 'pointer',
              fontSize: '20px',
              color: star <= rating ? '#f5c518' : '#555',
              transition: 'color 0.2s',
            }}
          >
            ●
          </span>
        ))}
      </div>
    </div>
  );
}

export default StarRating;

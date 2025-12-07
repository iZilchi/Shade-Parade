import React from 'react';

const SortButtons = ({ onSort }) => {
  const getAlgorithmColor = (algo) => {
    switch (algo) {
      case 'bubble': return 'btn-primary';
      case 'quick': return 'btn-warning';
      case 'merge': return 'btn-success';
      default: return 'btn-primary';
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Sort Algorithms</h2>
      <div className="sort-algorithms">
        {['bubble', 'quick', 'merge'].map(algo => (
          <div key={algo} className="sort-algorithm-card">
            <h3 className="sort-algorithm-title">
              {algo} Sort
            </h3>
            <div className="sort-buttons">
              <button 
                onClick={() => onSort('lightness', algo)} 
                className={`btn ${getAlgorithmColor(algo)} flex-1`}
              >
                Lightness
              </button>
              <button 
                onClick={() => onSort('hue', algo)} 
                className={`btn ${getAlgorithmColor(algo)} flex-1`}
              >
                Hue
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SortButtons;
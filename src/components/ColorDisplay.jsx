import React from 'react';

const ColorDisplay = ({ colors, sorting }) => {
  if (colors.length === 0) {
    return (
      <div className="empty-state">
        <p>No colors to display. Add some colors to get started!</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">Color Display</h2>
      <div className="color-display">
        {colors.map((color, i) => (
          <div
            key={i}
            style={{ backgroundColor: color }}
            className={`color-swatch ${
              (sorting.index1 === i || sorting.index2 === i) ? 'sorting-active' : ''
            }`}
            title={`Color ${i + 1}: ${color}`}
          >
            <span 
              className={`text-xs font-medium ${
                parseInt(color.replace('#', ''), 16) > 0xffffff / 2 
                  ? 'text-black' 
                  : 'text-white'
              }`}
            >
              {color}
            </span>
          </div>
        ))}
      </div>
      <div className="text-sm text-center mt-2">
        Showing {colors.length} color{colors.length !== 1 ? 's' : ''}
        {sorting.index1 !== -1 && (
          <span className="text-warning ml-2">• Sorting active</span>
        )}
      </div>
    </div>
  );
};

export default ColorDisplay;
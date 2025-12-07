import React from 'react';

// Simple SVG icons as components
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const Menu = ({ 
  isOpen, 
  setIsOpen, 
  savedPalettes, 
  selectedPalette, 
  setSelectedPalette,
  onLoadPalette,
  onDeletePalette,
  onClearAll,
  onDownload,
  sortHistory,
  onClearHistory
}) => {
  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="menu-toggle"
      >
        {isOpen ? <XIcon /> : <MenuIcon />}
      </button>

      {isOpen && (
        <div className="menu-sidebar">
          <h2 className="card-title">My Palettes</h2>
          
          <div className="mb-6">
            {savedPalettes.map((pal, i) => (
              <div
                key={i}
                onClick={() => setSelectedPalette(i)}
                className={`palette-item ${selectedPalette === i ? 'selected' : ''}`}
              >
                <div className="palette-colors">
                  {pal.map((c, j) => (
                    <div
                      key={j}
                      style={{ backgroundColor: c }}
                      className="palette-color"
                    />
                  ))}
                </div>
                
                <div className="palette-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadPalette(i);
                    }} 
                    className="btn btn-primary btn-sm flex-1"
                  >
                    Load
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePalette(i);
                    }} 
                    className="btn btn-danger btn-sm flex-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 mb-8">
            <button 
              onClick={onClearAll}
              className="btn btn-secondary flex-1"
            >
              Clear All
            </button>
            <button 
              onClick={onDownload}
              className="btn btn-success flex-1"
            >
              <DownloadIcon />
              Download
            </button>
          </div>

          <h2 className="card-title">Sort History</h2>
          
          <div className="mb-6">
            {sortHistory.map((entry, i) => (
              <div key={i} className="palette-item">
                <div className="text-sm font-medium mb-2">
                  {entry.algorithm} sort by {entry.sortBy}
                </div>
                <div className="palette-colors">
                  {entry.colors.map((c, j) => (
                    <div
                      key={j}
                      style={{ backgroundColor: c }}
                      className="palette-color"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={onClearHistory}
            className="btn btn-secondary w-full"
          >
            Clear History
          </button>
        </div>
      )}
    </>
  );
};

export default Menu;
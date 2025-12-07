import React from 'react';

const ColorInput = ({ inputValue, setInputValue, onUpdateColors, onSavePalette }) => {
  return (
    <div className="card">
      <h2 className="card-title">Color Input</h2>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter 3-10 comma-separated hex codes (e.g., #FF5733, #33FF57)"
        className="input mb-4"
      />
      <div className="flex gap-2">
        <button 
          onClick={onUpdateColors}
          className="btn btn-primary flex-1"
        >
          Set Colors
        </button>
        <button 
          onClick={onSavePalette}
          className="btn btn-success flex-1"
        >
          Save Palette
        </button>
      </div>
    </div>
  );
};

export default ColorInput;
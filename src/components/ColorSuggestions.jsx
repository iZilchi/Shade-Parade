import React, { useState } from 'react';
import { hexToRgb, calculateHue, hslToHex } from '../utils/colorUtils';

const ColorSuggestions = ({ colors, showNotification, onApply, onSave }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const getSuggestions = async () => {
    if (colors.length === 0) {
      showNotification('Please set some colors first.', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const baseColor = colors[0].replace('#', '');
      const response = await fetch(`https://www.thecolorapi.com/scheme?hex=${baseColor}&mode=analogic&count=5`);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (data.colors && data.colors.length > 0) {
        const suggestedColors = data.colors.map(c => c.hex.value);
        setSuggestions(suggestedColors);
        showNotification('Suggestions generated!', 'success');
      } else {
        throw new Error('No colors returned from API');
      }
    } catch (error) {
      showNotification(`Error: ${error.message}`, 'error');
      generateLocalSuggestions();
    } finally {
      setLoading(false);
    }
  };

  const generateLocalSuggestions = () => {
    if (colors.length === 0) return;
    
    const baseRgb = hexToRgb(colors[0]);
    const baseHue = calculateHue(baseRgb);
    
    const suggestions = [];
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      const newHue = (baseHue + (i * 30) + 360) % 360;
      const newColor = hslToHex(newHue, 70, 50);
      suggestions.push(newColor);
    }
    
    setSuggestions(suggestions);
    showNotification('Generated local suggestions (API unavailable)', 'warning');
  };

  const handleApply = () => {
    onApply(suggestions);
    setSuggestions([]);
  };

  const handleSave = () => {
    // Save to Firestore only
    onSave(suggestions);
    setSuggestions([]);
  };

  return (
    <div className="card">
      <h2 className="card-title">Color Suggestions</h2>
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={getSuggestions}
          disabled={loading || colors.length === 0}
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
        >
          {loading ? <span className="loading-spinner"></span> : null}
          {loading ? 'Loading...' : 'Get Suggestions'}
        </button>
        <button 
          onClick={generateLocalSuggestions}
          disabled={colors.length === 0}
          className="btn btn-secondary"
        >
          Generate Local
        </button>
      </div>
      
      {suggestions.length > 0 && (
        <div className="fade-in">
          <div className="suggestions-grid">
            {suggestions.map((color, i) => (
              <div
                key={i}
                style={{ backgroundColor: color }}
                className="suggestion-swatch"
                title="Click to copy"
                onClick={() => {
                  navigator.clipboard.writeText(color);
                  showNotification(`Copied ${color}`, 'success');
                }}
              >
                <span className={`text-xs font-medium ${
                  parseInt(color.replace('#', ''), 16) > 0xffffff / 2 
                    ? 'text-black' 
                    : 'text-white'
                }`}>
                  {color}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleApply}
              className="btn btn-success flex-1"
            >
              Apply to Workspace
            </button>
            <button 
              onClick={handleSave}
              className="btn btn-primary flex-1"
            >
              Save to Cloud
            </button>
            <button 
              onClick={() => setSuggestions([])}
              className="btn btn-secondary flex-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      {suggestions.length === 0 && !loading && (
        <div className="empty-state">
          Click "Get Suggestions" to fetch color palettes from the API
          or "Generate Local" for offline suggestions
        </div>
      )}
    </div>
  );
};

export default ColorSuggestions;
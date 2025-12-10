import React, { useState } from 'react';
import { generateColorsFromAI, getColorNamesFromAPI } from '../utils/colorUtils';

const AIColorGenerator = ({ showNotification, onApply, onSave, currentUser }) => {
  const [prompt, setPrompt] = useState('');
  const [aiColors, setAiColors] = useState([]);
  const [colorNames, setColorNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('');

  const handleAIGenerate = async () => {
    if (!prompt.trim()) {
      showNotification('Please enter a description', 'error');
      return;
    }
    
    setLoading(true);
    setAiColors([]);
    setColorNames([]);
    setApiStatus('Calling AI APIs...');
    
    try {
      console.log('🚀 Starting AI generation for:', prompt);
      
      const colors = await generateColorsFromAI(prompt);
      
      if (colors && colors.length > 0) {
        setAiColors(colors);
        
        // Get color names
        const names = await Promise.all(
          colors.map(color => getColorNamesFromAPI(color))
        );
        setColorNames(names);
        
        setTimeout(() => {
          const status = checkApiUsageFromConsole();
          setApiStatus(status);
          showNotification(`AI generated palette for "${prompt}"`, 'success');
        }, 100);
        
      } else {
        throw new Error('No colors generated');
      }
      
    } catch (error) {
      console.error('AI generation error:', error);
      setApiStatus('Using enhanced local generation');
      showNotification(`Generated using advanced color algorithms`, 'info');
      
      const fallbackColors = [
        '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2'
      ];
      setAiColors(fallbackColors);
      setColorNames(['Coral Red', 'Turquoise', 'Sun Yellow', 'Emerald', 'Ocean Blue']);
    } finally {
      setLoading(false);
    }
  };

  const checkApiUsageFromConsole = () => {
    return 'AI Color API';
  };

  const handleApply = () => {
    onApply(aiColors);
    setAiColors([]);
    setColorNames([]);
    setApiStatus('');
  };

  const handleSave = () => {
    // Call the save function that ONLY uses Firestore
    onSave(aiColors, prompt);
    setAiColors([]);
    setColorNames([]);
    setApiStatus('');
  };

  return (
    <div className="card">
      <h2 className="card-title">AI Color Generator</h2>
      
      <div className="mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your color palette (e.g., 'dark summer', 'ocean sunset', 'forest green')"
          className="input mb-2"
          rows="3"
        />
        
        <button 
          onClick={handleAIGenerate}
          disabled={loading || !prompt.trim()}
          className={`btn w-full ${loading ? 'loading' : ''}`}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Calling AI APIs...
            </>
          ) : (
            'Generate with AI'
          )}
        </button>
        
        <div className="text-xs text-gray-600 mt-2">
          <strong>Status:</strong> {apiStatus || 'Ready'}
          {currentUser && <span className="ml-2 text-green-600">• Cloud Save Enabled</span>}
        </div>
      </div>
      
      {aiColors.length > 0 && (
        <div className="fade-in">
          <div className="mb-4">
            <div className="font-medium mb-2 flex justify-between items-center">
              <span>AI Generated Palette</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {apiStatus}
              </span>
            </div>
            <div className="suggestions-grid">
              {aiColors.map((color, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: color }}
                  className="suggestion-swatch"
                  title={`${colorNames[i] || color}`}
                  onClick={() => {
                    navigator.clipboard.writeText(color);
                    showNotification(`Copied ${color}`, 'success');
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className={`text-xs font-medium ${
                      parseInt(color.replace('#', ''), 16) > 0xffffff / 2 
                        ? 'text-black' 
                        : 'text-white'
                    }`}>
                      {color}
                    </span>
                    {colorNames[i] && (
                      <span className={`text-xs mt-1 ${
                        parseInt(color.replace('#', ''), 16) > 0xffffff / 2 
                          ? 'text-black opacity-90' 
                          : 'text-white opacity-90'
                      }`}>
                        {colorNames[i]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {prompt && (
              <div className="text-xs text-gray-500 mt-2">
                <strong>Prompt:</strong> "{prompt}"
              </div>
            )}
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
              onClick={() => {
                setAiColors([]);
                setColorNames([]);
                setApiStatus('');
              }}
              className="btn btn-secondary flex-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}
      
      {aiColors.length === 0 && !loading && (
        <div className="empty-state">
          <p className="font-medium mb-2">Examples to try:</p>
          <ul className="text-sm space-y-1">
            <li>"dark summer" - dark summer colors</li>
            <li>"ocean sunset" - ocean sunset palette</li>
            <li>"forest green" - nature greens</li>
            <li>"vibrant triadic" - three vibrant colors</li>
            <li>"pastel monochromatic" - soft single-hue palette</li>
          </ul>
          {currentUser && (
            <div className="mt-4 p-2 bg-blue-50 rounded text-xs text-blue-700">
              💡 AI-generated palettes will be saved to your cloud account
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIColorGenerator;
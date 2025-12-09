
import React, { useState } from 'react';
import Header from './components/Header';
import Notification from './components/Notification';
import ColorPicker from './components/ColorPicker';
import ColorInput from './components/ColorInput';
import ColorDisplay from './components/ColorDisplay';
import ColorSuggestions from './components/ColorSuggestions';
import AIColorGenerator from './components/AIColorGenerator';
import SortButtons from './components/SortButtons';
import Menu from './components/Menu';
import Footer from './components/Footer';
import { useColorPalette } from './hooks/useColorPalette';
import { validateHexCode, hexToRgb, calculateLightness, calculateHue } from './utils/colorUtils';
import { bubbleSort, quickSort, mergeSort } from './utils/sortingAlgorithms';
import { clearAllPalettes, clearSortHistory } from './utils/storageUtils';
import './App.css';

const App = () => {
  const {
    colors,
    setColors,
    savedPalettes,
    setSavedPalettes,
    sortHistory,
    setSortHistory,
    sorting,
    setSorting,
    savePalette,
    deletePalette,
    addToHistory
  } = useColorPalette();

  const [inputValue, setInputValue] = useState('');
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [notification, setNotification] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [colorWheel, setColorWheel] = useState({ hovered: '#FFFFFF', selected: '#FFFFFF' });
  const [palette, setPalette] = useState('basic');

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateColors = () => {
    const hexCodes = inputValue.split(',').map(code => code.trim());
    
    if (hexCodes.length < 3 || hexCodes.length > 10) {
      showNotification('Please enter 3 to 10 colors', 'error');
      return;
    }

    const validColors = [];
    const invalidColors = [];

    hexCodes.forEach(code => {
      if (validateHexCode(code)) {
        const formattedColor = code.startsWith('#') ? code : `#${code}`;
        validColors.push(formattedColor);
      } else {
        invalidColors.push(code);
      }
    });

    if (invalidColors.length > 0) {
      showNotification(`Invalid colors: ${invalidColors.join(', ')}`, 'error');
    }

    if (validColors.length >= 3) {
      setColors(validColors);
      showNotification(`Updated with ${validColors.length} colors`, 'success');
    } else {
      showNotification('Need at least 3 valid colors', 'error');
    }
  };

  const handleSavePalette = () => {
    if (colors.length === 0) {
      showNotification('No colors to save', 'error');
      return;
    }

    savePalette(colors);
    showNotification('Palette saved!', 'success');
  };

  const handleSort = async (sortBy, algorithm) => {
    if (colors.length === 0) {
      showNotification('No colors to sort', 'error');
      return;
    }

    const compareFunc = (a, b) => {
      const rgbA = hexToRgb(a);
      const rgbB = hexToRgb(b);
      
      if (sortBy === 'lightness') {
        return calculateLightness(rgbA) - calculateLightness(rgbB);
      } else {
        return calculateHue(rgbA) - calculateHue(rgbB);
      }
    };

    let sortedColors;
    
    try {
      switch (algorithm) {
        case 'bubble':
          sortedColors = await bubbleSort([...colors], compareFunc, setSorting, setColors);
          break;
        case 'quick':
          sortedColors = await quickSort([...colors], 0, colors.length - 1, compareFunc, setSorting, setColors);
          break;
        case 'merge':
          sortedColors = await mergeSort([...colors], compareFunc, setColors);
          break;
        default:
          throw new Error('Unknown algorithm');
      }

      setColors(sortedColors);
      addToHistory({
        algorithm,
        sortBy,
        colors: sortedColors,
        timestamp: new Date().toLocaleString()
      });
      showNotification(`Sorted by ${sortBy} using ${algorithm} sort`, 'success');
    } catch (error) {
      showNotification(`Sorting failed: ${error.message}`, 'error');
    }
  };

  const handleLoadPalette = (index) => {
    if (savedPalettes[index]) {
      setColors(savedPalettes[index]);
      setSelectedPalette(index);
      showNotification('Palette loaded!', 'success');
    }
  };

  const handleDeletePalette = (index) => {
    deletePalette(index);
    showNotification('Palette deleted', 'success');
  };

  const handleClearAllPalettes = () => {
    clearAllPalettes();
    setSavedPalettes([]);
    showNotification('All palettes cleared', 'success');
  };

  const handleClearHistory = () => {
    clearSortHistory();
    setSortHistory([]);
    showNotification('Sort history cleared', 'success');
  };

  const handleDownload = () => {
    if (colors.length === 0) {
      showNotification('No colors to download', 'error');
      return;
    }

    const cssContent = `/* Color Palette */\n:root {\n${colors.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n')}\n}`;
    
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('CSS file downloaded!', 'success');
  };

  const handleApplySuggestions = (suggestedColors) => {
    setColors(suggestedColors);
    showNotification('Applied suggested colors!', 'success');
  };

  const handleSaveSuggestions = (suggestedColors) => {
    savePalette(suggestedColors);
    showNotification('Saved suggested palette!', 'success');
  };

  return (
    <div className="app-container">
      <Header />
      
      <main className="container">
        <Notification 
          notification={notification} 
          onClose={() => setNotification(null)} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <ColorPicker 
            palette={palette}
            setPalette={setPalette}
            colorWheel={colorWheel}
            setColorWheel={setColorWheel}
          />
          
          <ColorInput 
            inputValue={inputValue}
            setInputValue={setInputValue}
            onUpdateColors={handleUpdateColors}
            onSavePalette={handleSavePalette}
          />
          
          <AIColorGenerator 
            showNotification={showNotification}
            onApply={handleApplySuggestions}
            onSave={handleSaveSuggestions}
          />
        </div>

        {colors.length > 0 && (
          <>
            <div className="mb-8">
              <ColorDisplay colors={colors} sorting={sorting} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SortButtons onSort={handleSort} />
              <ColorSuggestions 
                colors={colors}
                showNotification={showNotification}
                onApply={handleApplySuggestions}
                onSave={handleSaveSuggestions}
              />
            </div>
          </>
        )}
      </main>

      <Menu 
        isOpen={menuOpen}
        setIsOpen={setMenuOpen}
        savedPalettes={savedPalettes}
        selectedPalette={selectedPalette}
        setSelectedPalette={setSelectedPalette}
        onLoadPalette={handleLoadPalette}
        onDeletePalette={handleDeletePalette}
        onClearAll={handleClearAllPalettes}
        onDownload={handleDownload}
        sortHistory={sortHistory}
        onClearHistory={handleClearHistory}
      />

      <Footer />
    </div>
  );
};

export default App;
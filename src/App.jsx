import React, { useState, useEffect } from 'react';
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
import { validateHexCode, hexToRgb, calculateLightness, calculateHue } from './utils/colorUtils';
import { bubbleSort, quickSort, mergeSort } from './utils/sortingAlgorithms';

// Import Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, serverTimestamp, arrayUnion, query, getDocs, deleteDoc, updateDoc, arrayRemove } from 'firebase/firestore';

import './App.css';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtdJUbobx9lCBZhBaEeWmZCZAct-DjoDo",
  authDomain: "shade-parade.firebaseapp.com",
  projectId: "shade-parade",
  storageBucket: "shade-parade.firebasestorage.app",
  messagingSenderId: "70809880874",
  appId: "1:70809880874:web:a7adb01bcb301e6159b653",
  measurementId: "G-ZC1VMQ5EXY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const App = () => {
  const [colors, setColors] = useState([]);
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [sortHistory, setSortHistory] = useState([]);
  const [sorting, setSorting] = useState({ index1: -1, index2: -1 });
  const [inputValue, setInputValue] = useState('');
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [notification, setNotification] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [colorWheel, setColorWheel] = useState({ hovered: '#FFFFFF', selected: '#FFFFFF' });
  const [palette, setPalette] = useState('basic');
  const [currentUser, setCurrentUser] = useState(null);
  const [firestoreLoading, setFirestoreLoading] = useState(false);

  // Initialize Firebase Auth (anonymous login)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Sign in anonymously to get a user ID
        const userCredential = await signInAnonymously(auth);
        setCurrentUser(userCredential.user);
        console.log('Anonymous user signed in:', userCredential.user.uid);
        // Load user data from Firestore after login
        await loadUserData(userCredential.user.uid);
      } catch (error) {
        console.error('Error with anonymous auth:', error);
        showNotification('Unable to connect to cloud services', 'warning');
      }
    };

    initializeAuth();

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        console.log('User authenticated:', user.uid);
        await loadUserData(user.uid);
      } else {
        setSavedPalettes([]);
        setSortHistory([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load user data from Firestore
  const loadUserData = async (userId) => {
    try {
      // Load palettes
      const palettesRef = collection(db, 'users', userId, 'palettes');
      const palettesSnapshot = await getDocs(palettesRef);
      const loadedPalettes = [];
      palettesSnapshot.forEach((doc) => {
        loadedPalettes.push(doc.data().colors);
      });
      setSavedPalettes(loadedPalettes);
      
      // Load sort history
      const historyRef = collection(db, 'users', userId, 'sort_history');
      const historySnapshot = await getDocs(historyRef);
      const loadedHistory = [];
      historySnapshot.forEach((doc) => {
        loadedHistory.push(doc.data());
      });
      setSortHistory(loadedHistory);
      
      console.log('User data loaded from Firestore');
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Save palette to Firestore ONLY
  const saveToFirestore = async (paletteData, isAIGenerated = false, prompt = '') => {
    if (!currentUser) {
      showNotification('Please wait while connecting...', 'warning');
      return null;
    }

    setFirestoreLoading(true);
    try {
      const paletteId = Date.now().toString();
      const paletteRef = doc(db, 'users', currentUser.uid, 'palettes', paletteId);
      
      const palette = {
        id: paletteId,
        colors: paletteData,
        name: isAIGenerated ? `AI: ${prompt || 'Generated Palette'}` : `Palette ${paletteId}`,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        source: isAIGenerated ? 'ai_generator' : 'manual',
        ...(isAIGenerated && { aiPrompt: prompt }),
        tags: isAIGenerated ? ['ai-generated'] : ['manual']
      };
      
      await setDoc(paletteRef, palette);
      
      // Update user's palette list
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        palettes: arrayUnion(paletteId),
        lastActive: serverTimestamp()
      }, { merge: true });
      
      // Update local state
      setSavedPalettes(prev => [...prev, paletteData]);
      
      console.log('Palette saved to Firestore:', paletteId);
      showNotification('Palette saved!', 'success');
      return paletteId;
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      showNotification('Failed to save to cloud', 'error');
      return null;
    } finally {
      setFirestoreLoading(false);
    }
  };

  // Save sort history to Firestore ONLY
  const saveSortHistoryToFirestore = async (historyEntry) => {
    if (!currentUser) return null;

    try {
      const historyId = Date.now().toString();
      const historyRef = doc(db, 'users', currentUser.uid, 'sort_history', historyId);
      
      const history = {
        id: historyId,
        userId: currentUser.uid,
        ...historyEntry,
        createdAt: serverTimestamp()
      };
      
      await setDoc(historyRef, history);
      
      // Update local state
      setSortHistory(prev => [historyEntry, ...prev]);
      
      return historyId;
    } catch (error) {
      console.error('Error saving sort history to Firestore:', error);
      return null;
    }
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

  const handleSavePalette = async () => {
    if (colors.length === 0) {
      showNotification('No colors to save', 'error');
      return;
    }

    // Save ONLY to Firestore
    await saveToFirestore(colors, false);
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
      
      // Save sort history to Firestore
      const historyEntry = {
        algorithm,
        sortBy,
        colors: sortedColors,
        timestamp: new Date().toLocaleString()
      };
      
      await saveSortHistoryToFirestore(historyEntry);
      
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

  const handleDeletePalette = async (index) => {
    if (!currentUser) {
      showNotification('Not connected to cloud', 'error');
      return;
    }

    try {
      // Get the palette ID to delete from Firestore
      const paletteToDelete = savedPalettes[index];
      
      // Find the document ID in Firestore
      const palettesRef = collection(db, 'users', currentUser.uid, 'palettes');
      const q = query(palettesRef);
      const querySnapshot = await getDocs(q);
      
      let paletteIdToDelete = null;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (JSON.stringify(data.colors) === JSON.stringify(paletteToDelete)) {
          paletteIdToDelete = doc.id;
        }
      });
      
      if (paletteIdToDelete) {
        // Delete from Firestore
        await deleteDoc(doc(db, 'users', currentUser.uid, 'palettes', paletteIdToDelete));
        
        // Remove from user's palette list
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          palettes: arrayRemove(paletteIdToDelete)
        });
        
        // Update local state
        const newPalettes = savedPalettes.filter((_, i) => i !== index);
        setSavedPalettes(newPalettes);
        
        showNotification('Palette deleted!', 'success');
      }
    } catch (error) {
      console.error('Error deleting palette:', error);
      showNotification('Failed to delete palette', 'error');
    }
  };

  const handleClearAllPalettes = async () => {
    if (!currentUser) {
      showNotification('Not connected to cloud', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete ALL palettes from the cloud? This cannot be undone.')) {
      return;
    }

    try {
      // Delete all palettes from Firestore
      const palettesRef = collection(db, 'users', currentUser.uid, 'palettes');
      const querySnapshot = await getDocs(palettesRef);
      
      const deletePromises = [];
      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(deletePromises);
      
      // Clear user's palette list
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        palettes: []
      });
      
      // Update local state
      setSavedPalettes([]);
      
      showNotification('All palettes cleared from cloud!', 'success');
    } catch (error) {
      console.error('Error clearing palettes:', error);
      showNotification('Failed to clear palettes', 'error');
    }
  };

  const handleClearHistory = async () => {
    if (!currentUser) {
      showNotification('Not connected to cloud', 'error');
      return;
    }

    try {
      // Delete all sort history from Firestore
      const historyRef = collection(db, 'users', currentUser.uid, 'sort_history');
      const querySnapshot = await getDocs(historyRef);
      
      const deletePromises = [];
      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(deletePromises);
      
      // Update local state
      setSortHistory([]);
      
      showNotification('Sort history cleared from cloud!', 'success');
    } catch (error) {
      console.error('Error clearing history:', error);
      showNotification('Failed to clear history', 'error');
    }
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

  const handleSaveSuggestions = async (suggestedColors, prompt = '') => {
    if (suggestedColors.length === 0) return;

    // Save ONLY to Firestore
    await saveToFirestore(suggestedColors, true, prompt);
  };

  return (
    <div className="app-container">
      <Header />
      
      <Notification 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />
      
      <main className="container">
        <div className="welcome-banner">
          <h2>Welcome to Shade Parade!</h2>
          <p>Create beautiful color palettes with AI-powered tools and sorting algorithms.</p>
          {currentUser ? (
            <div className="cloud-status">
              <span className="cloud-icon">☁️</span>
              Your palettes are being saved to the cloud
              {firestoreLoading && <span className="loading-text"> (Saving...)</span>}
            </div>
          ) : (
            <div className="cloud-status offline">
              <span className="cloud-icon">📱</span>
              Connecting to cloud...
            </div>
          )}
        </div>
        
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
            currentUser={currentUser}
          />
        </div>

        {colors.length > 0 ? (
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
        ) : (
          <div className="empty-state-large">
            <div className="empty-icon">🎨</div>
            <h3>Get Started with Shade Parade</h3>
            <p>Enter colors manually, use the color picker, or try AI generation to create your first palette!</p>
            <div className="quick-tips">
              <h4>Quick Tips:</h4>
              <ul>
                <li>Enter 3-10 hex codes (e.g., #FF5733, #33FF57, #3357FF)</li>
                <li>Use the color picker to select colors visually</li>
                <li>Try AI generation with prompts like "ocean sunset" or "forest green"</li>
                <li>Sort colors by lightness or hue using different algorithms</li>
                <li>All palettes are automatically saved to your cloud account</li>
              </ul>
            </div>
          </div>
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
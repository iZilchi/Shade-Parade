import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase/config';

// User Management
export const createUserProfile = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      palettes: [],
      preferences: {
        theme: 'light',
        defaultAlgorithm: 'merge',
        defaultPalette: 'basic',
        colorFormat: 'hex'
      }
    });
    console.log('User profile created successfully');
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log('User profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Color Palette Management
export const saveColorPalette = async (userId, paletteData) => {
  try {
    const paletteId = Date.now().toString();
    const paletteRef = doc(db, 'users', userId, 'palettes', paletteId);
    
    const palette = {
      id: paletteId,
      ...paletteData,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      colors: paletteData.colors || [],
      name: paletteData.name || `Palette ${paletteId}`,
      tags: paletteData.tags || [],
      isPublic: paletteData.isPublic || false,
      likes: 0,
      views: 0
    };
    
    await setDoc(paletteRef, palette);
    
    // Also add reference to user's palette list
    await updateDoc(doc(db, 'users', userId), {
      palettes: arrayUnion(paletteId)
    });
    
    console.log('Palette saved successfully:', paletteId);
    return paletteId;
  } catch (error) {
    console.error('Error saving palette:', error);
    throw error;
  }
};

export const getUserPalettes = async (userId) => {
  try {
    const palettesRef = collection(db, 'users', userId, 'palettes');
    const q = query(palettesRef);
    const querySnapshot = await getDocs(q);
    
    const palettes = [];
    querySnapshot.forEach((doc) => {
      palettes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by creation date (newest first)
    palettes.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    
    return palettes;
  } catch (error) {
    console.error('Error getting user palettes:', error);
    throw error;
  }
};

export const getPaletteById = async (userId, paletteId) => {
  try {
    const paletteRef = doc(db, 'users', userId, 'palettes', paletteId);
    const paletteDoc = await getDoc(paletteRef);
    
    if (paletteDoc.exists()) {
      return {
        id: paletteDoc.id,
        ...paletteDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting palette:', error);
    throw error;
  }
};

export const updateColorPalette = async (userId, paletteId, updates) => {
  try {
    const paletteRef = doc(db, 'users', userId, 'palettes', paletteId);
    await updateDoc(paletteRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log('Palette updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating palette:', error);
    throw error;
  }
};

export const deleteColorPalette = async (userId, paletteId) => {
  try {
    // Delete the palette document
    await deleteDoc(doc(db, 'users', userId, 'palettes', paletteId));
    
    // Remove reference from user's palette list
    await updateDoc(doc(db, 'users', userId), {
      palettes: arrayRemove(paletteId)
    });
    
    console.log('Palette deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting palette:', error);
    throw error;
  }
};

// Public Palettes
export const getPublicPalettes = async (limit = 50) => {
  try {
    const palettesRef = collection(db, 'public_palettes');
    const q = query(palettesRef, where('isPublic', '==', true));
    const querySnapshot = await getDocs(q);
    
    const palettes = [];
    querySnapshot.forEach((doc) => {
      palettes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by popularity (likes + views)
    palettes.sort((a, b) => {
      const scoreA = (a.likes || 0) + (a.views || 0);
      const scoreB = (b.likes || 0) + (b.views || 0);
      return scoreB - scoreA;
    });
    
    return palettes.slice(0, limit);
  } catch (error) {
    console.error('Error getting public palettes:', error);
    throw error;
  }
};

export const makePalettePublic = async (userId, paletteId, paletteData) => {
  try {
    const publicPaletteRef = doc(db, 'public_palettes', `${userId}_${paletteId}`);
    
    const publicPalette = {
      ...paletteData,
      id: paletteId,
      userId: userId,
      userDisplayName: paletteData.userDisplayName || 'Anonymous',
      createdAt: serverTimestamp(),
      likes: 0,
      views: 0,
      isPublic: true
    };
    
    await setDoc(publicPaletteRef, publicPalette);
    console.log('Palette made public successfully');
    return true;
  } catch (error) {
    console.error('Error making palette public:', error);
    throw error;
  }
};

// Color Suggestions
export const saveColorSuggestions = async (userId, colors, prompt) => {
  try {
    const suggestionsRef = collection(db, 'users', userId, 'suggestions');
    const suggestionId = Date.now().toString();
    
    const suggestion = {
      id: suggestionId,
      userId: userId,
      colors: colors,
      prompt: prompt || '',
      createdAt: serverTimestamp(),
      aiGenerated: true,
      source: 'ai_generator'
    };
    
    await setDoc(doc(suggestionsRef, suggestionId), suggestion);
    console.log('Color suggestions saved successfully');
    return suggestionId;
  } catch (error) {
    console.error('Error saving color suggestions:', error);
    throw error;
  }
};

export const getUserSuggestions = async (userId) => {
  try {
    const suggestionsRef = collection(db, 'users', userId, 'suggestions');
    const q = query(suggestionsRef);
    const querySnapshot = await getDocs(q);
    
    const suggestions = [];
    querySnapshot.forEach((doc) => {
      suggestions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by creation date (newest first)
    suggestions.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    
    return suggestions;
  } catch (error) {
    console.error('Error getting user suggestions:', error);
    throw error;
  }
};

// Sort History
export const saveSortHistory = async (userId, sortData) => {
  try {
    const historyRef = collection(db, 'users', userId, 'sort_history');
    const historyId = Date.now().toString();
    
    const historyEntry = {
      id: historyId,
      userId: userId,
      ...sortData,
      createdAt: serverTimestamp(),
      colors: sortData.colors || [],
      algorithm: sortData.algorithm || 'unknown',
      sortBy: sortData.sortBy || 'lightness',
      duration: sortData.duration || 0
    };
    
    await setDoc(doc(historyRef, historyId), historyEntry);
    console.log('Sort history saved successfully');
    return historyId;
  } catch (error) {
    console.error('Error saving sort history:', error);
    throw error;
  }
};

export const getUserSortHistory = async (userId, limit = 20) => {
  try {
    const historyRef = collection(db, 'users', userId, 'sort_history');
    const q = query(historyRef);
    const querySnapshot = await getDocs(q);
    
    const history = [];
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by creation date (newest first)
    history.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    
    return history.slice(0, limit);
  } catch (error) {
    console.error('Error getting sort history:', error);
    throw error;
  }
};

// Favorites Management
export const addToFavorites = async (userId, paletteId, paletteData) => {
  try {
    const favoritesRef = doc(db, 'users', userId, 'favorites', paletteId);
    
    await setDoc(favoritesRef, {
      paletteId: paletteId,
      userId: userId,
      ...paletteData,
      addedAt: serverTimestamp()
    });
    
    console.log('Added to favorites successfully');
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (userId, paletteId) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'favorites', paletteId));
    console.log('Removed from favorites successfully');
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

export const getUserFavorites = async (userId) => {
  try {
    const favoritesRef = collection(db, 'users', userId, 'favorites');
    const q = query(favoritesRef);
    const querySnapshot = await getDocs(q);
    
    const favorites = [];
    querySnapshot.forEach((doc) => {
      favorites.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by addition date (newest first)
    favorites.sort((a, b) => b.addedAt?.seconds - a.addedAt?.seconds);
    
    return favorites;
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
};

// Statistics
export const incrementPaletteViews = async (userId, paletteId) => {
  try {
    const paletteRef = doc(db, 'users', userId, 'palettes', paletteId);
    await updateDoc(paletteRef, {
      views: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
};

export const likePalette = async (userId, paletteId) => {
  try {
    const paletteRef = doc(db, 'users', userId, 'palettes', paletteId);
    await updateDoc(paletteRef, {
      likes: increment(1),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error liking palette:', error);
    throw error;
  }
};

// Search Palettes
export const searchPalettes = async (userId, searchTerm) => {
  try {
    const palettesRef = collection(db, 'users', userId, 'palettes');
    const q = query(palettesRef);
    const querySnapshot = await getDocs(q);
    
    const results = [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    querySnapshot.forEach((doc) => {
      const palette = {
        id: doc.id,
        ...doc.data()
      };
      
      // Search in name, tags, and colors
      if (
        palette.name?.toLowerCase().includes(lowerSearchTerm) ||
        palette.tags?.some(tag => tag.toLowerCase().includes(lowerSearchTerm)) ||
        palette.colors?.some(color => color.toLowerCase().includes(lowerSearchTerm))
      ) {
        results.push(palette);
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error searching palettes:', error);
    throw error;
  }
};

// Import/Export
export const exportUserData = async (userId) => {
  try {
    const [palettes, suggestions, history, favorites] = await Promise.all([
      getUserPalettes(userId),
      getUserSuggestions(userId),
      getUserSortHistory(userId, 100),
      getUserFavorites(userId)
    ]);
    
    return {
      palettes,
      suggestions,
      history,
      favorites,
      exportedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
};

// Recent Activity
export const getRecentActivity = async (userId, limit = 10) => {
  try {
    const [recentPalettes, recentHistory, recentSuggestions] = await Promise.all([
      getUserPalettes(userId),
      getUserSortHistory(userId),
      getUserSuggestions(userId)
    ]);
    
    const allActivity = [
      ...recentPalettes.map(p => ({ ...p, type: 'palette', date: p.createdAt })),
      ...recentHistory.map(h => ({ ...h, type: 'sort', date: h.createdAt })),
      ...recentSuggestions.map(s => ({ ...s, type: 'suggestion', date: s.createdAt }))
    ];
    
    // Sort by date (newest first)
    allActivity.sort((a, b) => b.date?.seconds - a.date?.seconds);
    
    return allActivity.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    throw error;
  }
};

// Helper function for increment (Firestore doesn't have increment in modular SDK)
const increment = (n) => {
  return {
    increment: n
  };
};
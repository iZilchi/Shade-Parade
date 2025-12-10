import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { 
  doc, 
  setDoc, 
  collection,
  serverTimestamp,
  arrayUnion 
} from 'firebase/firestore';

export const useFirestore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const savePalette = async (paletteData) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const paletteId = Date.now().toString();
      const paletteRef = doc(db, 'users', user.uid, 'palettes', paletteId);
      
      const palette = {
        id: paletteId,
        ...paletteData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(paletteRef, palette);
      
      // Update user's palette list
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        palettes: arrayUnion(paletteId),
        lastActive: serverTimestamp()
      }, { merge: true });
      
      return paletteId;
    } catch (err) {
      setError(err.message);
      console.error('Error saving palette to Firestore:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveSuggestions = async (colors, prompt = '') => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const suggestionId = Date.now().toString();
      const suggestionRef = doc(db, 'users', user.uid, 'suggestions', suggestionId);
      
      const suggestion = {
        id: suggestionId,
        userId: user.uid,
        colors: colors,
        prompt: prompt,
        createdAt: serverTimestamp(),
        aiGenerated: true,
        source: 'ai_generator'
      };
      
      await setDoc(suggestionRef, suggestion);
      
      // Also save as a regular palette
      await savePalette({
        colors: colors,
        name: `AI: ${prompt || 'Generated Palette'}`,
        source: 'ai_generator',
        aiPrompt: prompt
      });
      
      return suggestionId;
    } catch (err) {
      setError(err.message);
      console.error('Error saving suggestions to Firestore:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    savePalette,
    saveSuggestions
  };
};
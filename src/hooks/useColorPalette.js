import { useState, useEffect } from 'react';
import { getSavedPalettes, getSortHistory, savePalettes, saveSortHistory } from '../utils/storageUtils';

export const useColorPalette = () => {
  const [colors, setColors] = useState([]);
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [sortHistory, setSortHistory] = useState([]);
  const [sorting, setSorting] = useState({ index1: -1, index2: -1 });

  useEffect(() => {
    setSavedPalettes(getSavedPalettes());
    setSortHistory(getSortHistory());
  }, []);

  const savePalette = (palette) => {
    const newPalettes = [...savedPalettes, palette];
    setSavedPalettes(newPalettes);
    savePalettes(newPalettes);
  };

  const deletePalette = (index) => {
    const newPalettes = savedPalettes.filter((_, i) => i !== index);
    setSavedPalettes(newPalettes);
    savePalettes(newPalettes);
  };

  const addToHistory = (entry) => {
    const newHistory = [entry, ...sortHistory];
    setSortHistory(newHistory);
    saveSortHistory(newHistory);
  };

  return {
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
  };
};
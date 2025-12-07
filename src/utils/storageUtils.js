export const getSavedPalettes = () => {
  return JSON.parse(localStorage.getItem('savedPalettes')) || [];
};

export const savePalettes = (palettes) => {
  localStorage.setItem('savedPalettes', JSON.stringify(palettes));
};

export const getSortHistory = () => {
  return JSON.parse(localStorage.getItem('sortingHistory')) || [];
};

export const saveSortHistory = (history) => {
  localStorage.setItem('sortingHistory', JSON.stringify(history));
};

export const clearAllPalettes = () => {
  localStorage.removeItem('savedPalettes');
};

export const clearSortHistory = () => {
  localStorage.removeItem('sortingHistory');
};
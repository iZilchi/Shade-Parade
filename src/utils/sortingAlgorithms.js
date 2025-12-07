const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const bubbleSort = async (arr, compareFunc, setSorting, setColors) => {
  const sorted = [...arr];
  let n = sorted.length;
  let swapped = true;
  
  while (swapped) {
    swapped = false;
    for (let i = 0; i < n - 1; i++) {
      if (compareFunc(sorted[i], sorted[i + 1]) > 0) {
        [sorted[i], sorted[i + 1]] = [sorted[i + 1], sorted[i]];
        swapped = true;
        setSorting({ index1: i, index2: i + 1 });
        setColors([...sorted]);
        await sleep(300);
      }
    }
    n--;
  }
  setSorting({ index1: -1, index2: -1 });
  return sorted;
};

export const quickSort = async (arr, left = 0, right = arr.length - 1, compareFunc, setSorting, setColors) => {
  if (left >= right) return arr;
  
  const partition = async (arr, left, right) => {
    const pivot = arr[Math.floor((left + right) / 2)];
    [arr[Math.floor((left + right) / 2)], arr[right]] = [arr[right], arr[Math.floor((left + right) / 2)]];
    
    let storeIndex = left;
    for (let i = left; i < right; i++) {
      if (compareFunc(arr[i], pivot) < 0) {
        [arr[i], arr[storeIndex]] = [arr[storeIndex], arr[i]];
        setSorting({ index1: i, index2: storeIndex });
        setColors([...arr]);
        await sleep(300);
        storeIndex++;
      }
    }
    [arr[storeIndex], arr[right]] = [arr[right], arr[storeIndex]];
    return storeIndex;
  };
  
  const pivotIndex = await partition(arr, left, right);
  await quickSort(arr, left, pivotIndex - 1, compareFunc, setSorting, setColors);
  await quickSort(arr, pivotIndex + 1, right, compareFunc, setSorting, setColors);
  setSorting({ index1: -1, index2: -1 });
  return arr;
};

export const mergeSort = async (arr, compareFunc, setColors) => {
  if (arr.length <= 1) return arr;
  
  const merge = async (left, right) => {
    const result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
      if (compareFunc(left[i], right[j]) <= 0) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
  };
  
  const mid = Math.floor(arr.length / 2);
  const left = await mergeSort(arr.slice(0, mid), compareFunc, setColors);
  const right = await mergeSort(arr.slice(mid), compareFunc, setColors);
  const merged = await merge(left, right);
  setColors([...merged]);
  await sleep(300);
  return merged;
};
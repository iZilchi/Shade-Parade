export const hexToRgb = (hex) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16)
});

export const calculateLightness = (rgb) => {
  const max = Math.max(rgb.r, rgb.g, rgb.b) / 255;
  const min = Math.min(rgb.r, rgb.g, rgb.b) / 255;
  return ((max + min) / 2) * 100;
};

export const calculateHue = (rgb) => {
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;
  let hue;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  hue = Math.round(hue * 60);
  return hue < 0 ? hue + 360 : hue;
};

export const validateHexCode = (hex) => 
  /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);

export const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const getColorForPalette = (palette, slice, ring, numSlices, numRings) => {
  const hue = (slice * 360) / numSlices;
  const lightness = 50 + (ring / numRings) * 25;
  
  if (palette === 'basic') return hslToHex(hue, 100, lightness);
  if (palette === 'pastel') return hslToHex(hue, 70, lightness + 15);
  if (palette === 'neon') return hslToHex(hue, 100, lightness - 10);
  if (palette === 'monochrome') {
    const gray = Math.round((ring / numRings) * 255);
    return `#${gray.toString(16).padStart(2, '0').repeat(3)}`;
  }
};
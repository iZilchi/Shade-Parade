
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

// REAL FREE AI APIs THAT WORK WITH CORS
export const generateColorsFromAI = async (prompt) => {
  console.log('🔍 AI Request for prompt:', prompt);
  
  try {
    // API 1: Color API (CORS-enabled, free, no key needed)
    try {
      console.log('🎨 Trying Color API...');
      
      // Extract a base color from prompt
      const baseColor = getBaseColorFromPrompt(prompt);
      const hex = baseColor.replace('#', '');
      
      // Use Color API with different modes based on prompt
      let mode = 'analogic';
      const lowerPrompt = prompt.toLowerCase();
      
      if (lowerPrompt.includes('complement') || lowerPrompt.includes('contrast')) {
        mode = 'complement';
      } else if (lowerPrompt.includes('triad') || lowerPrompt.includes('triangle')) {
        mode = 'triad';
      } else if (lowerPrompt.includes('mono') || lowerPrompt.includes('single')) {
        mode = 'monochrome';
      } else if (lowerPrompt.includes('neutral')) {
        mode = 'neutral';
      }
      
      const response = await fetch(
        `https://www.thecolorapi.com/scheme?hex=${hex}&mode=${mode}&count=5&format=json`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('Color API response:', data);
        
        if (data.colors && data.colors.length > 0) {
          const colors = data.colors.map(c => c.hex.value);
          console.log('✅ Color API success:', colors);
          return colors;
        }
      }
    } catch (colorApiError) {
      console.log('Color API failed:', colorApiError);
    }
    
    // API 2: HueTools API (CORS-enabled, free)
    try {
      console.log('🌈 Trying HueTools API...');
      
      // HueTools requires a different approach
      const encodedPrompt = encodeURIComponent(prompt);
      const response = await fetch(
        `https://hue.tools/generate?format=json&query=${encodedPrompt}`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('HueTools API response:', data);
        
        if (data.colors && data.colors.length > 0) {
          const colors = data.colors.map(color => {
            // Convert RGB to hex if needed
            if (color.startsWith('rgb')) {
              const rgb = color.match(/\d+/g);
              return `#${parseInt(rgb[0]).toString(16).padStart(2, '0')}${parseInt(rgb[1]).toString(16).padStart(2, '0')}${parseInt(rgb[2]).toString(16).padStart(2, '0')}`;
            }
            return color.startsWith('#') ? color : `#${color}`;
          });
          
          console.log('✅ HueTools API success:', colors);
          return colors;
        }
      }
    } catch (hueError) {
      console.log('HueTools API failed:', hueError);
    }
    
    // API 3: Colormind API with CORS proxy
    try {
      console.log('🧠 Trying Colormind API with proxy...');
      
      // Use a public CORS proxy for Colormind
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const colormindUrl = 'http://colormind.io/api/';
      
      const requestBody = {
        model: 'default'
      };
      
      // If we can extract a color from prompt, use it
      const baseColor = getBaseColorFromPrompt(prompt);
      if (baseColor) {
        const rgb = hexToRgb(baseColor);
        requestBody.input = [[rgb.r, rgb.g, rgb.b], "N", "N", "N", "N"];
      }
      
      const response = await fetch(proxyUrl + encodeURIComponent(colormindUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Colormind API response:', data);
        
        if (data.result) {
          const colors = data.result.map(rgb => 
            `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`
          );
          console.log('✅ Colormind API success:', colors);
          return colors;
        }
      }
    } catch (colormindError) {
      console.log('Colormind API failed:', colormindError);
    }
    
    // If all APIs fail, use enhanced local generation
    console.log('⚠️ All external APIs failed, using enhanced local generation');
    return generateEnhancedLocalColors(prompt);
    
  } catch (error) {
    console.error('💥 All AI methods failed:', error);
    return generateEnhancedLocalColors(prompt);
  }
};

// Enhanced local generation as fallback
const generateEnhancedLocalColors = (prompt) => {
  console.log('🎨 Using enhanced local generation for:', prompt);
  
  const keywords = prompt.toLowerCase();
  
  // More comprehensive color mapping
  const colorThemes = {
    'dark': ['#2C3E50', '#34495E', '#2F4F4F', '#1C2833', '#212F3D'],
    'light': ['#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA'],
    'summer': ['#FF6347', '#FFD700', '#32CD32', '#1E90FF', '#FF69B4'],
    'winter': ['#FFFFFF', '#87CEEB', '#4682B4', '#F0F8FF', '#E6E6FA'],
    'spring': ['#FFB6C1', '#98FB98', '#87CEEB', '#FFD700', '#DA70D6'],
    'autumn': ['#8B4513', '#D2691E', '#FF8C00', '#B22222', '#228B22'],
    'ocean': ['#1E90FF', '#00BFFF', '#87CEEB', '#4682B4', '#5F9EA0'],
    'forest': ['#228B22', '#006400', '#2E8B57', '#3CB371', '#20B2AA'],
    'sunset': ['#FF4500', '#FF8C00', '#FFD700', '#FF6347', '#FF69B4'],
    'sunrise': ['#FF69B4', '#FFB6C1', '#FFD700', '#FF8C00', '#FF4500'],
    'night': ['#191970', '#000080', '#00008B', '#0000CD', '#0000FF'],
    'day': ['#87CEEB', '#00BFFF', '#1E90FF', '#ADD8E6', '#B0E0E6'],
    'rainbow': ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF'],
    'pastel': ['#FFB6C1', '#98FB98', '#87CEEB', '#FFD700', '#DDA0DD'],
    'neon': ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000', '#00FF00'],
    'vintage': ['#8B4513', '#D2B48C', '#CD853F', '#A0522D', '#DEB887'],
    'modern': ['#2C3E50', '#ECF0F1', '#3498DB', '#E74C3C', '#1ABC9C'],
    'professional': ['#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7', '#ECF0F1'],
    'happy': ['#FFD700', '#FF6B6B', '#4ECDC4', '#FF9A76', '#A8E6CF'],
    'calm': ['#6A5ACD', '#87CEEB', '#98FB98', '#E6E6FA', '#B0E0E6'],
    'energetic': ['#FF4500', '#FFD700', '#32CD32', '#FF1493', '#00CED1'],
  };
  
  // Check for keywords
  for (const [key, colors] of Object.entries(colorThemes)) {
    if (keywords.includes(key)) {
      console.log(`✅ Local: Found theme "${key}"`);
      return colors;
    }
  }
  
  // Generate based on text
  const hash = prompt.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const colors = [];
  for (let i = 0; i < 5; i++) {
    const hue = (hash + i * 72) % 360;
    const saturation = 70 + (i * 5);
    const lightness = 50 + (i * 5);
    colors.push(hslToHex(hue, saturation, lightness));
  }
  
  return colors;
};

// Get base color from prompt
const getBaseColorFromPrompt = (prompt) => {
  const keywords = prompt.toLowerCase();
  
  const colorMap = {
    'dark': '#2C3E50',
    'black': '#000000',
    'night': '#191970',
    'light': '#FFFFFF',
    'white': '#F8F9FA',
    'blue': '#3498DB',
    'ocean': '#1E90FF',
    'sea': '#00CED1',
    'green': '#2ECC71',
    'forest': '#228B22',
    'red': '#E74C3C',
    'fire': '#FF4500',
    'yellow': '#F1C40F',
    'sun': '#FFD700',
    'gold': '#FFD700',
    'purple': '#9B59B6',
    'violet': '#8A2BE2',
    'pink': '#FF69B4',
    'rose': '#FF007F',
    'orange': '#E67E22',
    'sunset': '#FF4500',
    'brown': '#8B4513',
    'gray': '#7F8C8D',
    'silver': '#C0C0C0',
    'summer': '#FF6347',
    'winter': '#FFFFFF',
    'spring': '#98FB98',
    'autumn': '#8B4513',
    'rainbow': '#FF0000',
    'pastel': '#FFB6C1',
    'neon': '#FF00FF',
    'vintage': '#8B4513',
    'modern': '#2C3E50',
    'professional': '#2C3E50',
    'happy': '#FFD700',
    'calm': '#6A5ACD',
    'energetic': '#FF4500',
  };
  
  // Check for keywords
  for (const [key, color] of Object.entries(colorMap)) {
    if (keywords.includes(key)) {
      return color;
    }
  }
  
  // Default color
  return '#3498DB';
};

// Get color names from free API
export const getColorNamesFromAPI = async (color) => {
  try {
    const hex = color.replace('#', '');
    const response = await fetch(`https://api.color.pizza/v1/${hex}`);
    if (response.ok) {
      const data = await response.json();
      if (data.colors && data.colors.length > 0) {
        return data.colors[0].name;
      }
    }
  } catch (error) {
    console.error('Color name API failed:', error);
  }
  return null;
};
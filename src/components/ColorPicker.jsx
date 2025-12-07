import React from 'react';
import { getColorForPalette } from '../utils/colorUtils';

const ColorPicker = ({ palette, setPalette, colorWheel, setColorWheel }) => {
  return (
    <div className="card">
      <h2 className="card-title">Color Picker</h2>
      
      <select 
        value={palette} 
        onChange={(e) => setPalette(e.target.value)} 
        className="input mb-4"
      >
        <option value="basic">Basic</option>
        <option value="pastel">Pastel</option>
        <option value="neon">Neon</option>
        <option value="monochrome">Monochrome</option>
      </select>
      
      <div className="flex justify-center mb-4">
        <svg width="500" height="500" viewBox="0 0 500 500" className="color-picker-wheel">
          {Array.from({ length: 10 }, (_, ring) =>
            Array.from({ length: 36 }, (_, slice) => {
              const innerR = (250 / 10) * ring;
              const outerR = (250 / 10) * (ring + 1);
              const startA = (slice * 360) / 36;
              const endA = ((slice + 1) * 360) / 36;
              const color = getColorForPalette(palette, slice, ring, 36, 10);
              
              return (
                <path
                  key={`${ring}-${slice}`}
                  d={`M ${250 + innerR * Math.cos((startA * Math.PI) / 180)} ${250 + innerR * Math.sin((startA * Math.PI) / 180)}
                      L ${250 + outerR * Math.cos((startA * Math.PI) / 180)} ${250 + outerR * Math.sin((startA * Math.PI) / 180)}
                      A ${outerR} ${outerR} 0 0 1 ${250 + outerR * Math.cos((endA * Math.PI) / 180)} ${250 + outerR * Math.sin((endA * Math.PI) / 180)}
                      L ${250 + innerR * Math.cos((endA * Math.PI) / 180)} ${250 + innerR * Math.sin((endA * Math.PI) / 180)}
                      A ${innerR} ${innerR} 0 0 0 ${250 + innerR * Math.cos((startA * Math.PI) / 180)} ${250 + innerR * Math.sin((startA * Math.PI) / 180)} Z`}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="0.5"
                  onMouseOver={() => setColorWheel({ ...colorWheel, hovered: color })}
                  onClick={() => setColorWheel({ ...colorWheel, selected: color })}
                  className="color-segment"
                />
              );
            })
          )}
        </svg>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="font-medium mb-2">Hovered Color</div>
          <div 
            style={{ backgroundColor: colorWheel.hovered }}
            className="color-preview"
          >
            {colorWheel.hovered}
          </div>
        </div>
        <div className="text-center">
          <div className="font-medium mb-2">Selected Color</div>
          <div 
            style={{ backgroundColor: colorWheel.selected }}
            className="color-preview"
          >
            {colorWheel.selected}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
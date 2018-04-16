import { saveAs } from 'file-saver';

export const download = (json, jsonName) => {
  const blob = new Blob([json], { type: 'text/json;charset=utf-8' });

  saveAs(blob, jsonName);
};

// color manipulation utils

export const fade = (color, opacity = 0.4) => {
  const { r, g, b } = hexToRgb(color);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const hexToRgb = hex => {
  const rgb = hexToComponents(hex);

  return rgb
    ? {
        r: parseInt(rgb[1], 16),
        g: parseInt(rgb[2], 16),
        b: parseInt(rgb[3], 16)
      }
    : {
        r: 0,
        g: 0,
        b: 0
      };
};

export const invert = hex => {
  const rgb = hexToComponents(hex);

  const { r, g, b } = rgb
    ? {
        r: 255 - parseInt(rgb[1], 16),
        g: 255 - parseInt(rgb[2], 16),
        b: 255 - parseInt(rgb[3], 16)
      }
    : {
        r: 1,
        g: 1,
        b: 1
      };

  return rgbToHex(r, g, b);
};

export const toUnitVector = n => Math.round(n / 255 * 1000) / 1000;

export const fromUnitVector = n => Math.round(n * 255);

export const rgbToHex = (r, g, b) =>
  `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;

const hexToComponents = hex =>
  /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

const componentToHex = c => {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
};

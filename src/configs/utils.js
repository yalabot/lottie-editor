import { saveAs } from 'file-saver';

export const download = (json, jsonName) => {
  const blob = new Blob([json], { type: 'text/json;charset=utf-8' });

  saveAs(blob, jsonName);
};

export const toUnitVector = n => Math.round(n / 255 * 1000) / 1000;

export const fromUnitVector = n => Math.round(n * 255);

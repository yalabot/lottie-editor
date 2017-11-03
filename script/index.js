// @flow

const chalk = require('chalk');

const { rgbToHex } = require('../src/utils');

const json = require('./whale.json');

const getColors = tree =>
  tree.forEach(
    (layer, i) =>
      layer.shapes &&
      layer.shapes.forEach((shape, j) =>
        shape.it.forEach((prop, k) => {
          if (prop.ty === 'fl') {
            const color = prop.c.k;

            let [r, g, b] = color;
            const { a } = color;

            r = Math.round(r * 255);
            g = Math.round(g * 255);
            b = Math.round(b * 255);

            console.log(chalk.rgb(r, g, b)(rgbToHex(r, g, b)));

            // tree[i].shapes[j].it[k].c.k = [0 / 255, 0 / 255, 0 / 255, a];
          }
        })
      )
  );

getColors(json.layers);

json.assets.forEach(asset => getColors(asset.layers));

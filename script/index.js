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
          if (prop.ty === 'fl' || prop.ty === 'st') {
            const color = prop.c.k;

            // eslint-disable-next-line
            let [r, g, b, a] = color;

            r = Math.round(r * 255);
            g = Math.round(g * 255);
            b = Math.round(b * 255);

            console.log(chalk.rgb(r, g, b)(rgbToHex(r, g, b)));

            // tree[i].shapes[j].it[k].c.k = [0 / 255, 0 / 255, 0 / 255, a];
          }

          if (
            i === tree.length - 1 &&
            j === layer.shapes.length - 1 &&
            k === shape.it.length - 1
          )
            console.log('Reached end of loop ..');
        })
      )
  );

getColors(json.layers);

json.assets.forEach(asset => getColors(asset.layers));

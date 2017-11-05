// @flow

import React, { Component } from 'react';

import Dropzone from 'react-dropzone';
import { SketchPicker as Picker } from 'react-color';

import {
  download,
  fade,
  getColors,
  hexToRgb,
  invert,
  toUnitVector
} from './utils';

import { Button, Bodymovin, Full, Icons, Paper, Table } from './helpers';

const palette = {
  gray: '#9e9e9e',
  green: '#58d370',
  white: '#ffffff'
};

export default class extends Component<any, any> {
  state = {
    json: '',
    jsonName: '',
    picker: false,
    presetColors: [],
    rows: [],
    selectedCol: -1,
    selectedRow: -1
  };

  cols = [
    {
      prop: 'color',
      render: (color: string, row: number, col: number) => (
        <div // eslint-disable-line
          style={Object.assign({}, { backgroundColor: color }, styles.colorRow)}
          onClick={() =>
            this.setState({
              picker: !this.state.picker,
              selectedCol: col,
              selectedRow: row
            })}
        />
      )
    }
  ];

  original = '';

  hidePicker = () => this.setState({ picker: false });

  pickColor = (color: Object) => {
    const { rows, selectedRow, selectedCol } = this.state;

    const { i, j, k, a, asset } = rows[selectedRow];

    const newColor = color.hex;

    const newRows = rows;
    newRows[selectedRow][this.cols[selectedCol].prop] = newColor;
    this.setState({ rows: newRows });

    const newJson = JSON.parse(this.state.json);

    const { r, g, b } = hexToRgb(newColor);

    if (asset === -1) {
      if (newJson && newJson.layers)
        newJson.layers[i].shapes[j].it[k].c.k = [
          toUnitVector(r),
          toUnitVector(g),
          toUnitVector(b),
          a
        ];
    } else {
      // eslint-disable-next-line
      if (newJson && newJson.assets)
        newJson.assets[asset].layers[i].shapes[j].it[k].c.k = [
          toUnitVector(r),
          toUnitVector(g),
          toUnitVector(b),
          a
        ];
    }

    this.setState({ json: JSON.stringify(newJson) });
  };

  pushColor = () => {
    const { presetColors, rows, selectedRow } = this.state;
    const { color } = rows[selectedRow];

    this.setState({ presetColors: presetColors.concat(color) });
  };

  upload = (files: any) => {
    if (files[0]) {
      const reader = new FileReader();

      reader.onload = e => {
        const source = e.target.result;

        this.original = source;

        this.setState({ json: source, picker: false, rows: [] }, () => {
          const rows = [];

          const json = JSON.parse(this.state.json);

          let jsonName = files[0].name.slice(0, -5);
          jsonName += `-w${json.w}-h${json.h}.json`;

          if (json && json.layers)
            getColors(json.layers, color => rows.push(color));

          if (json && json.assets)
            json.assets.forEach((asset, i) =>
              getColors(asset.layers, color => rows.push(color), i)
            );

          this.setState({ rows, jsonName });
        });
      };

      reader.readAsText(files[0]);
    }
  };

  export = () => {
    download(this.state.json, this.state.jsonName);

    // if (process.env.NODE_ENV === 'development')
    import('diff').then(diff =>
      import('log-with-style').then(logWithStyle => {
        // console.clear();

        let additions = 0;
        let deletions = 0;

        const original = JSON.stringify(JSON.parse(this.original), null, 2);
        const parsed = JSON.stringify(JSON.parse(this.state.json), null, 2);

        diff
          .diffTrimmedLines(original, parsed, { newlineIsToken: true })
          .forEach(part => {
            const { added, removed, value } = part;

            const color = added ? 'green' : removed ? 'red' : null;

            if (color)
              logWithStyle(
                `[c="color: ${color};"]${added ? '+' : '-'} ${value}[c]`
              );

            if (added) additions += value.length;
            else if (removed) deletions += value.length;
          });

        logWithStyle(
          `[c="color: green;"]${additions} additions[c], [c="color: red;"]${deletions} deletions[c].`
        );
      })
    );
  };

  render() {
    const { presetColors, json, picker, rows, selectedRow } = this.state;

    const Animation = () =>
      json && (
        <Bodymovin
          fallback={
            <Full style={styles.landing}>
              <Icons.Sad color={palette.gray} />
            </Full>
          }
          src={JSON.parse(json)}
        />
      );

    const { color } = (rows && rows[selectedRow]) || {};

    return (
      <Full style={styles.container}>
        <Full style={styles.row}>
          {json && (
            <Paper style={styles.left}>
              {picker && (
                <div style={styles.popover}>
                  <div // eslint-disable-line
                    onClick={this.hidePicker}
                    style={styles.cover}
                  />

                  <Picker
                    color={color}
                    disableAlpha
                    onChange={this.pickColor}
                    presetColors={presetColors}
                  />

                  <div style={styles.pushButton}>
                    <Button
                      backgroundColor={color}
                      fullWidth
                      hoverColor={fade(color)}
                      icon={<Icons.Colorize color={invert(color)} />}
                      onClick={this.pushColor}
                    />
                  </div>
                </div>
              )}
              <Table cols={this.cols} rows={rows} />
            </Paper>
          )}

          <Paper style={styles.right}>
            <Dropzone
              accept="application/json"
              multiple={false}
              onDrop={this.upload}
              style={styles.dropzone}>
              <Full>
                {json ? (
                  <Animation />
                ) : (
                  <Full style={styles.landing}>
                    <Icons.Upload color={palette.green} />
                  </Full>
                )}
              </Full>
            </Dropzone>
          </Paper>
        </Full>

        {json && (
          <Paper style={styles.bottom}>
            <Button
              backgroundColor={palette.green}
              hoverColor={fade(palette.green)}
              icon={<Icons.Download color={palette.white} />}
              onClick={this.export}
            />
          </Paper>
        )}
      </Full>
    );
  }
}

const styles = {
  bottom: { marginTop: 20, maxHeight: 48 },
  colorRow: {
    cursor: 'pointer',
    display: 'inline-block',
    height: 48,
    width: '100%'
  },
  container: { padding: 20 },
  cover: { bottom: 0, left: 0, position: 'fixed', right: 0, top: 0 },
  dropzone: { cursor: 'pointer', display: 'flex', flex: 1 },
  landing: { alignItems: 'center', justifyContent: 'center' },
  left: { marginRight: 20, maxWidth: 220 },
  popover: { position: 'absolute', zIndex: 1 },
  pushButton: { backgroundColor: palette.white },
  right: { flex: 3, overflow: 'hidden' },
  row: { flexDirection: 'row' }
};

// @flow

import React, { Component } from 'react';

import Dropzone from 'react-dropzone';
import log from 'log-with-style';
import Snack from 'material-ui/Snackbar';
import { diffTrimmedLines as diff } from 'diff';
import { SketchPicker as Picker } from 'react-color';

import {
  download,
  fade,
  getColors,
  hexToRgb,
  invert,
  toUnitVector
} from './utils';

import {
  Bodymovin,
  Button,
  Corner,
  Full,
  Icons,
  Paper,
  Table
} from './helpers';

const palette = {
  black: '#171717',
  gray: '#9e9e9e',
  grayLight: '#d8d8d8',
  grayLighter: '#f7f7f7',
  green: '#58d370',
  red: '#cc4533',
  white: '#ffffff',
  yellow: '#ffdb43'
};

export default class extends Component<any, any> {
  state = {
    json: '',
    jsonName: '',
    loading: false,
    picker: false,
    presetColors: Object.values(palette),
    rows: [],
    selectedCol: -1,
    selectedRow: -1,
    snack: false,
    snackMessage: ''
  };

  cols = [
    {
      prop: 'color',
      render: (color: string, row: number, col: number) => (
        <div // eslint-disable-line
          style={Object.assign(
            {},
            { backgroundColor: color, color: invert(color) },
            styles.colorRow,
            styles.landing
          )}
          onClick={() =>
            this.setState({
              picker: !this.state.picker,
              selectedCol: col,
              selectedRow: row
            })}>
          {color}
        </div>
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

    if (this.addAnimation && this.addAnimation.ref) {
      const animation = this.addAnimation.ref;
      animation.setSpeed(3);
      animation.play();
      animation.addEventListener('complete', () =>
        setTimeout(() => animation.goToAndStop(0), 750)
      );
    }
  };

  upload = (files: any) => {
    if (files[0]) {
      this.setState({ loading: true });

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

          setTimeout(
            () => this.setState({ rows, jsonName, loading: false }),
            750
          );
        });
      };

      reader.readAsText(files[0]);
    }
  };

  export = () => {
    download(this.state.json, this.state.jsonName);

    setTimeout(() => this.snack('Diff is available in the console.'), 750);

    log('Computing diff ..');

    let additions = 0;
    let deletions = 0;

    const original = JSON.stringify(JSON.parse(this.original), null, 2);
    const parsed = JSON.stringify(JSON.parse(this.state.json), null, 2);

    diff(original, parsed, {
      newlineIsToken: true
    }).forEach(part => {
      const { added, removed, value } = part;

      const color = added ? 'green' : removed ? 'red' : null;

      if (color) log(`[c="color: ${color};"]${added ? '+' : '-'} ${value}[c]`);

      if (added) additions += value.length;
      else if (removed) deletions += value.length;
    });

    log(
      `[c="color: green;"]${additions} additions[c], [c="color: red;"]${deletions} deletions[c].`
    );
  };

  closeSnack = () => this.setState({ snack: false });

  snack = (snackMessage: string) =>
    this.setState({ snack: true, snackMessage });

  addAnimation: any;

  render() {
    const {
      json,
      loading,
      picker,
      presetColors,
      rows,
      selectedRow
    } = this.state;

    const Animation = () =>
      json && (
        <Bodymovin
          fallback={<Icons.Sad color={palette.gray} />}
          landing
          src={JSON.parse(json)}
        />
      );

    const { color } = (rows && rows[selectedRow]) || {};

    return (
      <Full style={styles.container}>
        <h3 style={styles.header}>
          <a style={styles.link} href="./">
            Bodymovin Editor
          </a>
          <sub style={styles.subtitle}> 0.0.2</sub>
        </h3>

        <Full style={styles.row}>
          {!loading &&
            json && (
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

                    <div
                      style={{
                        backgroundColor:
                          color === palette.white
                            ? palette.black
                            : palette.white
                      }}>
                      <Button
                        backgroundColor={color}
                        fullWidth
                        hoverColor={fade(color)}
                        icon={
                          <Bodymovin
                            config={{ autoplay: false, loop: false }}
                            fallback={<Icons.Colorize color={invert(color)} />}
                            ref={ref => (this.addAnimation = ref)}
                            src={require('./animations/added-w216-h216.json')}
                          />
                        }
                        onClick={this.pushColor}
                        style={styles.add}
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
              {loading && (
                <Bodymovin
                  dimensions={{ width: 128, height: 128 }}
                  fallback={<p style={styles.subtitle}>Loading ..</p>}
                  landing
                  src={require('./animations/loading-w256-h256.json')}
                />
              )}

              {!loading && (
                <Full>
                  {json ? (
                    <Animation />
                  ) : (
                    <Full style={styles.landing}>
                      <Bodymovin
                        dimensions={{ width: 128, height: 128 }}
                        fallback={<Icons.Upload color={palette.green} />}
                        src={require('./animations/upload-w712-h712.json')}
                      />
                      <h3 style={styles.subtitle}>Drag and drop your JSON</h3>
                    </Full>
                  )}
                </Full>
              )}
            </Dropzone>
          </Paper>
        </Full>

        {!loading &&
          json && (
            <Paper style={styles.bottom}>
              <Button
                backgroundColor={palette.green}
                hoverColor={fade(palette.green)}
                icon={<Icons.Download color={palette.white} />}
                onClick={this.export}
              />
            </Paper>
          )}

        {!loading &&
          !json && (
            <p style={styles.footer}>
              {
                "Files uploaded here won't be visible for public and aren't stored anywhere in the cloud."
              }
            </p>
          )}

        <Corner
          backgroundColor={palette.green}
          color={palette.white}
          link="https://github.com/sonaye/bodymovin-editor"
        />

        <Snack
          autoHideDuration={4000}
          bodyStyle={styles.snack}
          message={this.state.snackMessage}
          onRequestClose={this.closeSnack}
          open={this.state.snack}
        />
      </Full>
    );
  }
}

const styles = {
  add: { paddingBottom: 10, paddingTop: 10 },
  bottom: { marginTop: 20, maxHeight: 48 },
  colorRow: {
    cursor: 'pointer',
    fontSize: 16,
    height: 48,
    width: '100%',
    display: 'flex'
  },
  container: { padding: 20 },
  cover: { bottom: 0, left: 0, position: 'fixed', right: 0, top: 0 },
  dropzone: { cursor: 'pointer', display: 'flex', flex: 1 },
  footer: { color: palette.gray, margin: 0, marginTop: 20 },
  header: { color: palette.green, margin: 0, marginBottom: 17 },
  landing: { alignItems: 'center', justifyContent: 'center' },
  left: { marginRight: 20, maxWidth: 220 },
  link: { color: palette.green, textDecoration: 'none' },
  popover: { position: 'absolute', zIndex: 1 },
  right: { flex: 3, overflow: 'hidden' },
  row: { flexDirection: 'row' },
  snack: { borderRadius: 0 },
  subtitle: { color: palette.gray }
};

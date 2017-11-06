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
  ErrorView,
  Full,
  Icons,
  Paper,
  Table
} from './helpers';

const palette = {
  black: '#171717',
  gray: '#7a7a7a',
  grayLight: '#d8d8d8',
  grayLighter: '#f8f8f8',
  primary: '#00d2c1',
  secondary: '#00b7d2',
  tertiary: '#007a88',
  white: '#ffffff'
};

const { version } = require('../package.json');

export default class extends Component<any, any> {
  state = {
    bugHoverColor: palette.gray,
    err: false,
    json: '',
    jsonName: '',
    linkHoverColor: palette.gray,
    loading: false,
    picker: false,
    presetColors: Object.values(palette),
    rows: [],
    selectedCol: -1,
    selectedRow: -1,
    snack: false,
    snackMessage: ''
  };

  componentWillMount() {
    const url = (window.location.href.split('src=')[1] || '').split('&')[0];
    const fileName = url.split('/').pop();

    if (url) this.fetchUrl(url, fileName);
  }

  setLinkHoverActive = () => this.setState({ linkHoverColor: palette.primary });
  setLinkHoverInactive = () => this.setState({ linkHoverColor: palette.gray });

  setBugHoverActive = () => this.setState({ bugHoverColor: palette.primary });
  setBugHoverInactive = () => this.setState({ bugHoverColor: palette.gray });

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

  fetchUrl = (url: string, fileName: string) =>
    this.setState({ json: '', err: '', loading: true }, () =>
      fetch(url)
        .then(res => res.json())
        .then(json => this.parse(JSON.stringify(json), fileName))
        .catch(err =>
          this.setState({
            err: true,
            snack: true,
            snackMessage: err.message,
            loading: false
          })
        )
    );

  hidePicker = () => this.setState({ picker: false });

  assignAddAnimation = (ref: any) => (this.addAnimation = ref);

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
        setTimeout(() => animation.goToAndStop(0), 500)
      );
    }
  };

  upload = (files: any) => {
    if (files[0]) {
      this.setState({ loading: true });

      const reader = new FileReader();

      reader.onload = e => this.parse(e.target.result, files[0].name);

      reader.readAsText(files[0]);
    }
  };

  parse = (source: string, fileName: string) => {
    this.original = source;

    this.setState({ json: source, picker: false, rows: [] }, () => {
      const rows = [];

      const json = JSON.parse(this.state.json);

      let jsonName = fileName.slice(0, -5);
      jsonName += `-w${json.w}-h${json.h}.json`;

      if (json && json.layers)
        getColors(json.layers, color => rows.push(color));

      if (json && json.assets)
        json.assets.forEach((asset, i) =>
          getColors(asset.layers, color => rows.push(color), i)
        );

      setTimeout(() => this.setState({ rows, jsonName, loading: false }), 500);
    });
  };

  export = () => {
    download(this.state.json, this.state.jsonName);

    setTimeout(() => this.snack('Diff is available in the console.'), 500);

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

  n = () => null;

  addAnimation: any;

  render() {
    const {
      bugHoverColor,
      err,
      json,
      linkHoverColor,
      loading,
      picker,
      presetColors,
      rows,
      selectedRow
    } = this.state;

    const Animation = () =>
      json && (
        <Bodymovin
          fallback={<ErrorView color={palette.gray} />}
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
          <sub style={styles.subtitle}> {version}</sub>
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
                            ref={this.assignAddAnimation}
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
                  {err ? (
                    <ErrorView color={palette.gray} />
                  ) : json ? (
                    <Animation />
                  ) : (
                    <Full style={styles.landing}>
                      <Bodymovin
                        dimensions={{ width: 128, height: 128 }}
                        fallback={<Icons.Upload color={palette.primary} />}
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
                backgroundColor={palette.primary}
                hoverColor={fade(palette.primary)}
                icon={<Icons.Download color={palette.white} />}
                onClick={this.export}
              />
            </Paper>
          )}

        {!loading &&
          !json && (
            <div style={Object.assign({}, styles.footer, styles.row)}>
              <div style={Object.assign({}, styles.footerItem, { flex: 3 })}>
                {
                  "Files uploaded here won't be visible for public and aren't stored anywhere in the cloud."
                }
              </div>

              <div style={styles.footerItem}>
                <a
                  href="./?src=https://editor.lottiefiles.com/whale.json"
                  style={styles.link}
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Append with /?src=YOUR_LINK">
                  <Icons.Link
                    color={linkHoverColor}
                    onBlur={this.n}
                    onFocus={this.n}
                    onMouseOut={this.setLinkHoverInactive}
                    onMouseOver={this.setLinkHoverActive}
                  />
                </a>
              </div>

              <div
                style={Object.assign({}, styles.footerItem, {
                  marginLeft: 20
                })}>
                <a
                  href="https://github.com/sonaye/bodymovin-editor/issues/1"
                  rel="noopener noreferrer"
                  style={styles.link}
                  target="_blank"
                  title="Not working? report here">
                  <Icons.Bug
                    color={bugHoverColor}
                    onBlur={this.n}
                    onFocus={this.n}
                    onMouseOut={this.setBugHoverInactive}
                    onMouseOver={this.setBugHoverActive}
                  />
                </a>
              </div>
            </div>
          )}

        <Corner
          backgroundColor={palette.primary}
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
  container: { padding: 20, backgroundColor: palette.grayLighter },
  cover: { bottom: 0, left: 0, position: 'fixed', right: 0, top: 0 },
  dropzone: { cursor: 'pointer', display: 'flex', flex: 1 },
  footer: { marginTop: 20 },
  footerItem: { color: palette.gray, display: 'flex' },
  header: { color: palette.primary, margin: 0, marginBottom: 17 },
  landing: { alignItems: 'center', justifyContent: 'center' },
  left: { marginRight: 20, maxWidth: 220 },
  link: { color: palette.primary, textDecoration: 'none' },
  popover: { position: 'absolute', zIndex: 1 },
  right: { flex: 3, overflow: 'hidden' },
  row: { display: 'flex', flexDirection: 'row' },
  snack: { borderRadius: 0 },
  subtitle: { color: palette.gray }
};

// @flow

import React, { Component } from 'react';

import Table from 'react-dt';
import fetch from 'isomorphic-fetch';
import FlatButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import { Full, Paper } from './helpers';
import { rgbToHex, hexToRgb } from './utils';

import Bodymovin from './bodymovin';

export default class extends Component<any, any> {
  state = {
    err: '',
    i: -1,
    j: -1,
    json: null,
    rows: [],
    url: 'https://bodymovin-editor.firebaseapp.com/whale.json'
  };

  onChange = (e: any, url: string) => this.setState({ url });

  onKeyUp = (e: any) => e.keyCode === 13 && this.upload();

  getColors = (tree: Object, asset: number = -1) =>
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

              this.colors.push({
                i,
                j,
                k,
                a,
                r,
                g,
                b,
                asset,
                color: rgbToHex(r, g, b)
              });
            }
          })
        )
    );

  colors = [];

  updateColor = (newValue: string, i: number, j: number) => {
    const newRows = this.state.rows;
    newRows[i][this.cols[j].prop] = newValue;
    this.setState({ rows: newRows });
  };

  upload = () =>
    this.setState({ json: null, err: '' }, () =>
      fetch(this.state.url)
        .then(res => res.json())
        .then(json =>
          this.setState({ json }, () => {
            this.colors = [];

            if (this.state.json && this.state.json.layers)
              this.getColors(this.state.json.layers);

            if (this.state.json && this.state.json.assets)
              this.state.json.assets.forEach((asset, i) =>
                this.getColors(asset.layers, i)
              );

            this.setState({ rows: this.colors });
          })
        )
        .catch(err => this.setState({ err: err.message }))
    );

  download = () => {
    const uri = `data:text/json;charset=utf-8,${JSON.stringify(
      this.state.json
    )}`;
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(uri));
    link.setAttribute('download', 'animation.json');
    link.click();
  };

  cols = [
    {
      prop: 'color',
      label: 'Colors',
      render: (prop: string) => (
        <div style={{ backgroundColor: prop, padding: 20 }}>{prop}</div>
      ),
      editor: (value: string, row: number, col: number) => {
        const { i, j, k, a, asset } = this.state.rows[row];
        return (
          <div style={{ paddingLeft: 20, paddingRight: 20 }}>
            <TextField
              autoFocus
              fullWidth
              maxLength="7"
              name={`editor-${row}-${col}`}
              onBlur={this.reset}
              onChange={(e, newValue) => {
                this.updateColor(newValue, row, col);

                const { r, g, b } = hexToRgb(newValue);

                const newJson = this.state.json;

                if (asset === -1) {
                  if (newJson && newJson.layers)
                    newJson.layers[i].shapes[j].it[k].c.k = [
                      r / 255,
                      g / 255,
                      b / 255,
                      a
                    ];
                } else {
                  // eslint-disable-next-line
                  if (newJson && newJson.assets)
                    newJson.assets[asset].layers[i].shapes[j].it[k].c.k = [
                      r / 255,
                      g / 255,
                      b / 255,
                      a
                    ];
                }

                this.setState({ json: newJson });
              }}
              onKeyUp={e => {
                if (e.keyCode === 13) this.reset();
              }}
              value={value}
            />
          </div>
        );
      }
    }
  ];

  tableProps = {
    tableProps: {
      fixedHeader: false,
      selectable: false,
      onCellClick: (i: number, j: number) => this.setState({ i, j })
    },
    tableRowColumnProps: { style: { padding: 0 } },
    tableBodyProps: { displayRowCheckbox: false },
    tableHeaderProps: {
      adjustForCheckbox: false,
      displaySelectAll: false
    }
  };

  reset = () => this.setState({ i: -1, j: -1 });

  render() {
    const Animation = () => (
      <Bodymovin
        opts={{
          animationData: this.state.json,
          autoplay: true,
          loop: true
        }}
      />
    );

    return (
      <Full style={{ padding: 20 }}>
        <TextField
          fullWidth
          name="animation-url"
          onChange={this.onChange}
          onKeyUp={this.onKeyUp}
          value={this.state.url}
        />
        <FlatButton
          label="Upload"
          labelStyle={{ textTransform: 'none' }}
          onClick={this.upload}
        />
        {this.state.err && <p style={{ color: 'red' }}>{this.state.err}</p>}
        {this.state.json && (
          <Full
            style={{ flexDirection: 'row', marginTop: 20, marginBottom: 20 }}>
            <Paper>
              <Table
                cols={this.cols}
                rows={this.state.rows}
                {...this.tableProps}
                selectedRow={this.state.i}
                selectedCol={this.state.j}
              />
            </Paper>
            <Paper style={{ flex: 3, marginLeft: 20, overflow: 'hidden' }}>
              <Animation />
            </Paper>
          </Full>
        )}
        {this.state.json && (
          <FlatButton
            label="Download"
            labelStyle={{ textTransform: 'none' }}
            onClick={this.download}
            primary
          />
        )}
      </Full>
    );
  }
}

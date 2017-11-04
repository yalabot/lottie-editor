// @flow

import React, { Component } from 'react';

import Button from 'material-ui/FlatButton';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import Dropzone from 'react-dropzone';
import Table from 'react-dt';
import TextField from 'material-ui/TextField';
import UploadIcon from 'material-ui/svg-icons/file/file-upload';

import { Full, Paper } from './helpers';
import { rgbToHex, hexToRgb } from './utils';

import Bodymovin from './bodymovin';

export default class extends Component<any, any> {
  state = {
    i: -1,
    j: -1,
    json: null,
    name: '',
    rows: []
  };

  getColors = (tree: Object, asset: number = -1) =>
    tree.forEach(
      (layer, i) =>
        layer.shapes &&
        layer.shapes.forEach((shape, j) =>
          shape.it.forEach((prop, k) => {
            if (prop.ty === 'fl' || prop.ty === 'st') {
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
                nm: prop.nm,
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

  upload = (files: any) => {
    if (files[0]) {
      const reader = new FileReader();

      reader.onload = e =>
        this.setState(
          { json: JSON.parse(e.target.result), name: files[0].name },
          () => {
            this.colors = [];

            if (this.state.json && this.state.json.layers)
              this.getColors(this.state.json.layers);

            if (this.state.json && this.state.json.assets)
              this.state.json.assets.forEach((asset, i) =>
                this.getColors(asset.layers, i)
              );

            this.setState({ rows: this.colors });
          }
        );

      reader.readAsText(files[0]);
    }
  };

  download = () => {
    const json = JSON.stringify(this.state.json);
    const uri = `data:text/json;charset=utf-8,${json}`;

    const link = document.createElement('a');

    link.setAttribute('href', encodeURI(uri));
    link.setAttribute('download', this.state.name);
    link.click();
  };

  cols = [
    {
      prop: 'color',
      label: 'Available Colors',
      render: (prop: string, row: number) => (
        <div style={{ backgroundColor: prop, fontSize: 16, padding: 20 }}>
          {prop}
          <br />
          <small style={{ color: '#9e9e9e' }}>{this.state.rows[row].nm}</small>
        </div>
      ),
      editor: (value: string, row: number, col: number) => {
        const { i, j, k, a, asset, nm } = this.state.rows[row];
        return (
          <div style={{ backgroundColor: value, padding: 20 }}>
            <TextField
              autoFocus
              fullWidth
              maxLength="7"
              name={`editor-${row}-${col}`}
              onBlur={this.reset}
              onChange={(e, newValue) => {
                const formattedValue = newValue.toLowerCase();

                this.updateColor(formattedValue, row, col);

                const { r, g, b } = hexToRgb(formattedValue);

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
            <br />
            <small style={{ color: '#9e9e9e' }}>{nm}</small>
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
    const Animation = () =>
      this.state.json && (
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
        <Full style={{ flexDirection: 'row' }}>
          {this.state.json && (
            <Paper style={{ marginRight: 20 }}>
              <Table
                cols={this.cols}
                rows={this.state.rows}
                {...this.tableProps}
                selectedRow={this.state.i}
                selectedCol={this.state.j}
              />
            </Paper>
          )}
          <Paper style={{ flex: 3, overflow: 'hidden' }}>
            <Dropzone
              onDrop={this.upload}
              accept="application/json"
              multiple={false}
              style={{ display: 'flex', flex: 1, cursor: 'pointer' }}>
              <Full>
                {this.state.json ? (
                  <Animation />
                ) : (
                  <Full
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                    <UploadIcon color="#58d370" />
                  </Full>
                )}
              </Full>
            </Dropzone>
          </Paper>
        </Full>
        {this.state.json && (
          <Button
            backgroundColor="#58d370"
            hoverColor="rgba(88, 211, 112, 0.4)"
            icon={<DownloadIcon color="#ffffff" />}
            onClick={this.download}
            style={{ marginTop: 20 }}
          />
        )}
      </Full>
    );
  }
}

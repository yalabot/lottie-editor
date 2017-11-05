// @flow

import React, { Component } from 'react';

import bodymovin from 'bodymovin/build/player/bodymovin.min';
import DataTable from 'react-dt';

import MUIButton from 'material-ui/FlatButton';
import { Paper as MUIPaper } from 'material-ui';

import Colorize from 'material-ui/svg-icons/image/colorize';
import Download from 'material-ui/svg-icons/file/file-download';
import Sad from 'material-ui/svg-icons/social/sentiment-very-dissatisfied';
import Upload from 'material-ui/svg-icons/file/file-upload';

export const Button = (props: Object) => (
  <MUIButton {...props} style={Object.assign({}, styles.button, props.style)} />
);

export const Icons = { Colorize, Download, Sad, Upload };

export class Bodymovin extends Component<any, any> {
  state = { err: false };

  componentWillUnmount() {
    if (this.animation) this.animation.destroy();
  }

  play = (wrapper: any) => {
    try {
      this.animation = bodymovin.loadAnimation({
        animationData: this.props.src,
        autoplay: true,
        loop: true,
        renderer: 'svg',
        wrapper
      });
    } catch (err) {
      this.setState({ err: true });
    }
  };

  animation: any;
  ref: any;

  render() {
    if (this.state.err) return this.props.fallback;

    return <div ref={this.play} />;
  }
}

export const Full = (props: Object) => (
  <div {...props} style={Object.assign({}, styles.full, props.style)} />
);

export const Paper = (props: Object) => (
  <MUIPaper
    zDepth={1}
    {...props}
    style={Object.assign({}, styles.paper, props.style)}
  />
);

export const Table = (props: Object) => (
  <DataTable {...tableProps} {...props} />
);

const tableProps = {
  tableProps: { fixedHeader: false, selectable: false },
  tableRowColumnProps: { style: { padding: 0 } },
  tableBodyProps: { displayRowCheckbox: false },
  tableHeaderProps: {
    adjustForCheckbox: false,
    displaySelectAll: false,
    style: { display: 'none' }
  }
};

const styles = {
  button: { borderRadius: 0, height: 48 },
  full: { display: 'flex', flex: 1, flexDirection: 'column' },
  paper: {
    borderRadius: 0,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: -1.5, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1
  }
};

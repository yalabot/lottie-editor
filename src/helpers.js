// @flow

import React, { Component } from 'react';

import lottie from 'lottie-web/build/player/lottie.min';
import DataTable from 'react-dt';

import MUIButton from 'material-ui/FlatButton';
import { Paper as MUIPaper } from 'material-ui';

import Bug from 'material-ui/svg-icons/action/bug-report';
import Colorize from 'material-ui/svg-icons/image/colorize';
import Download from 'material-ui/svg-icons/file/file-download';
import Link from 'material-ui/svg-icons/content/link';
import Sad from 'material-ui/svg-icons/social/sentiment-very-dissatisfied';
import Upload from 'material-ui/svg-icons/file/file-upload';
import Layers from 'material-ui/svg-icons/maps/layers';

export const Button = (props: Object) => (
  <MUIButton {...props} style={Object.assign({}, styles.button, props.style)} />
);

export const Icons = { Bug, Colorize, Download, Link, Sad, Upload, Layers };

export class Lottie extends Component<any, any> {
  state = { err: false };

  componentWillUnmount() {
    if (this.animation) this.ref.destroy();
  }

  play = (wrapper: any) => {
    try {
      this.ref = lottie.loadAnimation({
        autoplay: true,
        loop: true,
        ...this.props.config,
        animationData: this.props.src,
        renderer: 'svg',
        wrapper
      });
    } catch (err) {
      this.setState({ err: true });
    }
  };

  ref: any;

  render() {
    if (this.state.err) {
      const fallback = this.props.fallback || null;

      if (this.props.landing)
        return <Full style={styles.landing}>{fallback}</Full>;

      return fallback;
    }

    const animation = (
      <Full
        style={{
          maxHeight:
            (this.props.dimensions && this.props.dimensions.height) || null,
          width: (this.props.dimensions && this.props.dimensions.width) || null
        }}>
        <div ref={this.play} />
      </Full>
    );

    if (this.props.landing)
      return <Full style={styles.landing}>{animation}</Full>;

    return animation;
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

export const ErrorView = (props: Object) => (
  <Full style={styles.landing}>
    <Icons.Sad color={props.color} />
  </Full>
);

export const Corner = (props: Object) => (
  <a
    aria-label="View on Github"
    className="github-corner"
    href={props.link}
    rel="noopener noreferrer"
    target="_blank"
    title="View on Github">
    <svg
      aria-hidden="true"
      height="80"
      style={Object.assign({}, styles.corner, {
        color: props.color,
        fill: props.backgroundColor
      })}
      viewBox="0 0 250 250"
      width="80">
      <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
      <path
        className="octo-arm"
        d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
        fill="currentColor"
        style={styles.arm}
      />
      <path
        className="octo-body"
        d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
        fill="currentColor"
      />
    </svg>
  </a>
);

const styles = {
  arm: { transformOrigin: '130px 106px' },
  button: { borderRadius: 0, height: 48 },
  corner: { border: 0, position: 'absolute', right: 0, top: 0 },
  full: { display: 'flex', flex: 1, flexDirection: 'column' },
  landing: { alignItems: 'center', justifyContent: 'center' },
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

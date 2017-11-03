// @flow

import React, { Component } from 'react';

import bodymovin from 'bodymovin/build/player/bodymovin.min';

export default class extends Component<any, any> {
  componentDidMount() {
    this.animation = bodymovin.loadAnimation(
      Object.assign({}, this.props.opts, {
        wrapper: this.ref,
        renderer: 'svg'
      })
    );
  }

  componentWillUnmount() {
    this.animation.destroy();
  }

  animation: any;
  ref: any;

  render() {
    return <div ref={ref => (this.ref = ref)} />;
  }
}

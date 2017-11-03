// @flow

import React from 'react';

import { Paper as MUIPaper } from 'material-ui';

export const Full = (props: Object) => (
  <div
    {...props}
    style={Object.assign(
      {
        display: 'flex',
        flex: 1,
        flexDirection: 'column'
      },
      props.style
    )}
  />
);

export const Paper = (props: Object) => (
  <MUIPaper
    rounded={false}
    zDepth={1}
    {...props}
    style={Object.assign(
      {
        borderRadius: 0,
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        shadowColor: '#000',
        shadowOffset: { width: -1.5, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 1
      },
      props.style
    )}
  />
);

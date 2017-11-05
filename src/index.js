// @flow

import React from 'react';
import { render } from 'react-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import App from './app';
import { Full } from './helpers';

import registerServiceWorker from './registerServiceWorker';

import './style.css';

const Index = () => (
  <MuiThemeProvider>
    <Full>
      <App />
    </Full>
  </MuiThemeProvider>
);

// flow-disable-next-line
render(<Index />, document.getElementById('root'));

registerServiceWorker();

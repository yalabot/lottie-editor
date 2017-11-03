// @flow

import React from 'react';
import { render } from 'react-dom';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import registerServiceWorker from './registerServiceWorker';

import { Full } from './helpers';

import App from './app';

import './style.css';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#58d370',
    accent1Color: '#d8d8d8'
  }
});

const Index = () => (
  <MuiThemeProvider muiTheme={muiTheme}>
    <Full>
      <App />
    </Full>
  </MuiThemeProvider>
);

// flow-disable-next-line
render(<Index />, document.getElementById('root'));

registerServiceWorker();

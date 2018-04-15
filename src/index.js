import React from 'react';
import { render } from 'react-dom';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ThemeProvider from 'material-ui/styles/MuiThemeProvider';

import App from './app';
import { Full } from './helpers';

import registerServiceWorker from './registerServiceWorker';

import './style.css';

const muiTheme = getMuiTheme({ fontFamily: 'Delius' });

const Index = () => (
  <ThemeProvider muiTheme={muiTheme}>
    <Full>
      <App />
    </Full>
  </ThemeProvider>
);

render(<Index />, document.getElementById('root'));

registerServiceWorker();

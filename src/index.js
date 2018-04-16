import React from 'react';
import { render } from 'react-dom';

import CssBaseline from 'material-ui/CssBaseline';
import { MuiThemeProvider } from 'material-ui/styles';

import { theme } from './configs/colors';

import Root from './components/Root';

import './assets/styles/app.css';
import './assets/styles/react-color-overwrite.css';
import './assets/styles/github-corner.css';

// import registerServiceWorker from './registerServiceWorker';

const App = () => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />

    <Root />
  </MuiThemeProvider>
);

render(<App />, document.getElementById('root'));

// registerServiceWorker();

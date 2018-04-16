import React, { Fragment } from 'react';
import { render } from 'react-dom';

import CssBaseline from 'material-ui/CssBaseline';

import Root from './components/Root';

import './assets/styles/app.css';
import './assets/styles/react-color-overwrite.css';
import './assets/styles/github-corner.css';

// import registerServiceWorker from './registerServiceWorker';

const App = () => (
  <Fragment>
    <CssBaseline />

    <Root />
  </Fragment>
);

render(<App />, document.getElementById('root'));

// registerServiceWorker();

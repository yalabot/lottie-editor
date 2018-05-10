import React from 'react';

import PropTypes from 'prop-types';

import Icon from './Icon';
import Landing from './Landing';

const ErrorView = props => (
  <Landing>
    <Icon name="SentimentVeryDissatisfied" color={props.color} />
  </Landing>
);

ErrorView.propTypes = {
  color: PropTypes.string.isRequired
};

export default ErrorView;

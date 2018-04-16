import React from 'react';

import Icon from './Icon';
import Landing from './Landing';

const ErrorView = props => (
  <Landing>
    <Icon name="SentimentVeryDissatisfied" color={props.color} />
  </Landing>
);

export default ErrorView;

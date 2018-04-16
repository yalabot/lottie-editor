import React from 'react';

import Button from 'material-ui/Button';
import styled from 'styled-components';

import Icon from './Icon';

const IconBtn = styled(Button).attrs({
  children: props => <Icon name={props.name} />
})`
  background-color: #fff !important;
  border-radius: 0 !important;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1);
  height: 40px;
  margin: 10px !important;
  min-width: 40px !important;
  max-width: 40px !important;
  opacity: 0.75;

  &:hover {
    opacity: 1;
  }
`;

export default IconBtn;

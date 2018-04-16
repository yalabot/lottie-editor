import styled from 'styled-components';

import MUIPaper from 'material-ui/Paper';

const Paper = styled(MUIPaper).attrs({ square: true })`
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1) !important;
`;

export default Paper;

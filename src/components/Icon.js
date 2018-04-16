import React from 'react';

import BugReport from '@material-ui/icons/BugReport';
import Colorize from '@material-ui/icons/Colorize';
import FileDownload from '@material-ui/icons/FileDownload';
import FileUpload from '@material-ui/icons/FileUpload';
import Layers from '@material-ui/icons/Layers';
import Link from '@material-ui/icons/Link';
import SentimentVeryDissatisfied from '@material-ui/icons/SentimentVeryDissatisfied';

const icons = {
  BugReport,
  Colorize,
  FileDownload,
  FileUpload,
  Layers,
  Link,
  SentimentVeryDissatisfied
};

const Icon = props => {
  const I = icons[props.name];
  return <I style={{ color: props.color, width: props.size }} />;
};

Icon.defaultProps = {
  color: undefined,
  size: 16
};

export default Icon;

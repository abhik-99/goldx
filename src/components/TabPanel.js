import React from 'react';
import { Box } from '@mui/material';

function TabPanel(props) {
  const { children, value, index, boxSx,  ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, ...boxSx }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default TabPanel;
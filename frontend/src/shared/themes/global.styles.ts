// import { css } from '@emotion/react';

import { css } from '@mui/material';

export const cssGlobal = css(css`
  /* width */
  *::-webkit-scrollbar {
    width: 0.7rem;
    height: 0.7rem;
  }

  /* Track */
  *::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  /* Handle */
  *::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 10px;
  }

  /* Handle on hover */
  *::-webkit-scrollbar-thumb:hover {
    background: #444;
  }

  html {
    overflow: hidden;
  }
`);

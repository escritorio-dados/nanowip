import { styled } from '@mui/material';
import { deepPurple } from '@mui/material/colors';

export const Container = styled('div')`
  header {
    background: ${deepPurple[500]};
    border-radius: 5px 5px 0 0;

    button {
      background: ${deepPurple[500]};
      transition: filter 0.2s;
      border-right: 1px solid #eee;

      &:hover {
        filter: brightness(0.8);
      }

      &:first-child {
        border-top-left-radius: 5px;
      }
    }
  }

  > div {
    position: relative;
    padding: 1rem;

    border: 1px solid #999;
    border-top: 0;
    border-radius: 0 0 5px 5px;

    &:after {
      content: '';
      position: absolute;
      bottom: -2rem;
      width: 1px;
      height: 1px;
    }
  }
`;

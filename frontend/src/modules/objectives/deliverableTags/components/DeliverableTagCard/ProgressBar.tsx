import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';

type IProgressBar = {
  progress: number;
  goal: number;
  prefix?: string | JSX.Element;
  color?: string;
};

export function ProgressBar({ goal, progress, prefix, color }: IProgressBar) {
  const percent = useMemo(() => Math.floor((progress / goal) * 100), [goal, progress]);

  return (
    <Box display="flex" alignItems="center">
      <Box>
        {prefix && typeof prefix === 'string' ? (
          <Typography fontSize="0.875rem" marginRight="0.3rem">
            {prefix}
          </Typography>
        ) : (
          prefix
        )}
      </Box>
      <Box
        sx={(theme) => ({
          background: theme.palette.text.primary,
          height: '1rem',
          borderRadius: '7px',
          width: '100%',
          flex: 1,
          marginRight: '0.3rem',
        })}
      >
        <Box
          sx={(theme) => ({
            height: '1rem',
            width: `${percent}%`,
            background: color || theme.palette.success.main,
            borderRadius: '7px',
          })}
        />
        {'  '}
      </Box>
      <Box marginLeft="auto">
        <Typography fontSize="0.875rem">
          {progress}/{goal} ({percent}%)
        </Typography>
      </Box>
    </Box>
  );
}

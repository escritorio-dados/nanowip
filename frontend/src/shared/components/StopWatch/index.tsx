import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { getDurationSeconds } from '#shared/utils/parseDateApi';

type IStopWatch = { initialDuration: number };

export function StopWatch({ initialDuration }: IStopWatch) {
  const [time, setTime] = useState(initialDuration);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.2);
    }, 200);

    // Limpar interval quando o componente desmontar
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Isso é necessario para casos de iniciar um nova tarefa com uma em andamento para atualizar o timer
  useEffect(() => {
    setTime(initialDuration);
  }, [initialDuration]);

  return <Typography>{getDurationSeconds({ duration: time })}</Typography>;
}

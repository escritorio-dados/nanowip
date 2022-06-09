import { Typography } from '@mui/material';
import { differenceInSeconds, subSeconds } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

import { getDurationSeconds } from '#shared/utils/parseDateApi';

type IStopWatch = { initialDuration: number };

export function StopWatch({ initialDuration }: IStopWatch) {
  const [time, setTime] = useState(initialDuration);

  const startDate = useMemo(() => {
    return subSeconds(new Date(), initialDuration);
  }, [initialDuration]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(() => differenceInSeconds(new Date(), startDate));
    }, 500);

    // Limpar interval quando o componente desmontar
    return () => {
      clearInterval(interval);
    };
  }, [startDate]);

  // Isso é necessario para casos de iniciar um nova tarefa com uma em andamento para atualizar o timer
  useEffect(() => {
    setTime(initialDuration);
  }, [initialDuration]);

  const textTime = useMemo(() => {
    return getDurationSeconds({ duration: time });
  }, [time]);

  return <Typography>{textTime}</Typography>;
}

import { Tabs, Tab } from '@mui/material';
import { ReactNode, useCallback, useMemo, useState } from 'react';

import { useKeepStates } from '#shared/hooks/keepStates';

import { Container } from './styles';

export type ITab = { title: string; content: ReactNode; hide?: boolean };

type CTabProps = { tabs: ITab[]; startTab?: number; stateCategory?: string; stateKey?: string };

export function CustomTab({ tabs, startTab, stateCategory, stateKey }: CTabProps) {
  const { getState, updateState } = useKeepStates();

  const [tab, setTab] = useState(() => {
    if (stateCategory && stateKey) {
      const tabState = getState<number>({ category: stateCategory, key: stateKey });

      return tabState || 0;
    }

    return startTab || 0;
  });

  const handleChangeTab = useCallback(
    (newTab: any) => {
      setTab(newTab);

      if (stateCategory && stateKey) {
        updateState({ category: stateCategory, key: stateKey, value: newTab });
      }
    },
    [stateCategory, stateKey, updateState],
  );

  const titles = useMemo(() => {
    return tabs.filter(({ hide }) => !hide).map(({ title }) => title);
  }, [tabs]);

  const contents = useMemo(() => {
    return {
      ...tabs.filter(({ hide }) => !hide).map(({ content }) => content),
    };
  }, [tabs]);

  return (
    <Container>
      <header>
        <Tabs value={tab} onChange={(_, newTab) => handleChangeTab(newTab)}>
          {titles.map((title) => (
            <Tab key={title} label={title} />
          ))}
        </Tabs>
      </header>

      <div>{contents[tab]}</div>
    </Container>
  );
}

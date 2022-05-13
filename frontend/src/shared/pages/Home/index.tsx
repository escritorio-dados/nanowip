import { useEffect } from 'react';

import { useTitle } from '#shared/hooks/title';

export function Home() {
  const { updateTitle } = useTitle();

  useEffect(() => {
    updateTitle('Home');
  }, [updateTitle]);

  return (
    <>
      <h1>Bem-Vindo</h1>
    </>
  );
}

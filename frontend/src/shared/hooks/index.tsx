import { ReactNode } from 'react';

import { AuthProvider } from './auth';
import { GoBackUrlProvider } from './goBackUrl';
import { KeepStatesProvider } from './keepStates';
import { NavBarProvider } from './navBar';
import { TitleProvider } from './title';
import { ToastProvider } from './toast';

type IAppProvider = { children: ReactNode };

export function AppProvider({ children }: IAppProvider) {
  return (
    <ToastProvider>
      <KeepStatesProvider>
        <GoBackUrlProvider>
          <NavBarProvider>
            <TitleProvider>
              <AuthProvider>{children}</AuthProvider>
            </TitleProvider>
          </NavBarProvider>
        </GoBackUrlProvider>
      </KeepStatesProvider>
    </ToastProvider>
  );
}

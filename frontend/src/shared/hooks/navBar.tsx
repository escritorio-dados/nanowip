import { createContext, useCallback, useState, useContext, ReactNode, useMemo } from 'react';

type INavBarProviderProps = { children: ReactNode };

type INavBarContextData = {
  openNavBar: boolean;
  togleNavBar(): void;
  closeNavBar(): void;
};

const NavBarContext = createContext<INavBarContextData>({} as INavBarContextData);

export function NavBarProvider({ children }: INavBarProviderProps) {
  const [openNavBar, setOpenNavBar] = useState(true);

  const togleNavBar = useCallback(() => {
    setOpenNavBar(!openNavBar);
  }, [openNavBar]);

  const closeNavBar = useCallback(() => {
    setOpenNavBar(false);
  }, []);

  const navBarValue = useMemo(() => {
    return {
      openNavBar,
      togleNavBar,
      closeNavBar,
    };
  }, [closeNavBar, openNavBar, togleNavBar]);

  return <NavBarContext.Provider value={navBarValue}>{children}</NavBarContext.Provider>;
}

export function useNavBar(): INavBarContextData {
  const context = useContext(NavBarContext);

  if (!context) {
    throw new Error('useNavBar must be used within an NavBarProvider');
  }

  return context;
}

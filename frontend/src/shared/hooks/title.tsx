import { createContext, useCallback, useState, useContext, ReactNode, useMemo } from 'react';

interface ITitleProviderProps {
  children: ReactNode;
}

interface ITitleContextData {
  title: string;
  updateTitle(title: string, document_title?: string): void;
}

const TitleContext = createContext<ITitleContextData>({} as ITitleContextData);

export function TitleProvider({ children }: ITitleProviderProps) {
  const [title, setTitle] = useState('Nanowip');

  const updateTitle = useCallback((newTitle: string, document_title?: string) => {
    setTitle(newTitle);

    document.title = `Nanowip - ${document_title || newTitle}`;
  }, []);

  const titleValue = useMemo(() => {
    return { title, updateTitle };
  }, [title, updateTitle]);

  return <TitleContext.Provider value={titleValue}>{children}</TitleContext.Provider>;
}

export function useTitle(): ITitleContextData {
  const context = useContext(TitleContext);

  if (!context) {
    throw new Error('useTitle must be used within an TitleProvider');
  }

  return context;
}

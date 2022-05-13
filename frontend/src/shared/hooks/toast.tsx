import { Snackbar } from '@mui/material';
import { Alert } from '@mui/material';
import { createContext, useCallback, useState, useContext, ReactNode, useMemo } from 'react';

interface IToastData {
  message: string;
  severity: 'error' | 'info' | 'success' | 'warning';
  duration?: number;
}

interface IToastContextData {
  toast(data: IToastData): void;
}

type IToastProviderProps = { children: ReactNode };

const ToastContext = createContext<IToastContextData>({} as IToastContextData);

export function ToastProvider({ children }: IToastProviderProps) {
  const [open, setOpen] = useState(false);
  const [toastData, setToastData] = useState<IToastData>({
    message: '',
    severity: 'info',
    duration: 6000,
  });

  const toast = useCallback(({ message, severity, duration }: IToastData) => {
    setOpen(true);

    setToastData({
      message,
      severity,
      duration: duration || 6000,
    });
  }, []);

  const toastValue = useMemo(() => {
    return { toast };
  }, [toast]);

  return (
    <ToastContext.Provider value={toastValue}>
      {children}

      <Snackbar
        open={open}
        autoHideDuration={toastData.duration}
        onClose={() => setOpen(false)}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        <Alert
          elevation={6}
          variant="filled"
          severity={toastData.severity}
          sx={(theme) => ({ border: `1px solid ${theme.palette.divider}` })}
        >
          {toastData.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast(): IToastContextData {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within an ToastProvider');
  }

  return context;
}

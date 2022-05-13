import { AxiosRequestConfig } from 'axios';
import { useCallback, useEffect, useState } from 'react';

import { getError } from '#shared/utils/getError';

import { axiosClient } from './axiosClient';

type ISendWithInput<T> = { data?: T; error?: string };

type IUseWithoutInput<T> = {
  data?: T;
  error: string;
  loading: boolean;
  send(conf?: AxiosRequestConfig): Promise<void>;
};

type IUseGet<T> = IUseWithoutInput<T> & {
  updateData: React.Dispatch<React.SetStateAction<T | undefined>>;
};

type IUseWithInput<T, D> = {
  loading: boolean;
  send(input: D, conf?: AxiosRequestConfig): Promise<ISendWithInput<T>>;
};

type IUseDelete<T> = {
  loading: boolean;
  send(): Promise<ISendWithInput<T>>;
};

type IUseGetParams = { url: string; config?: AxiosRequestConfig; lazy?: boolean };

export function useGet<T>({ url, lazy, config }: IUseGetParams): IUseGet<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!lazy);

  const send = useCallback(
    async (conf?: AxiosRequestConfig) => {
      setLoading(true);

      try {
        const response = await axiosClient.get<T>(url, conf);

        setData(response);
      } catch (e) {
        setError((current) => {
          const newError = getError(e);

          if (current === newError) {
            if (current[current.length - 1] === ' ') {
              return newError;
            }

            return `${newError} `;
          }

          return newError;
        });
      } finally {
        setLoading(false);
      }
    },
    [url],
  );

  useEffect(() => {
    if (lazy) {
      return;
    }

    send(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, error, loading, send, updateData: setData };
}

export function usePost<T, D>(url: string, config?: AxiosRequestConfig): IUseWithInput<T, D> {
  const [loading, setLoading] = useState(false);

  const send = async (input: D, conf?: AxiosRequestConfig) => {
    setLoading(true);

    let data;
    let error;

    try {
      const response = await axiosClient.post<T, D>(url, input, { ...config, ...conf });

      data = response;
    } catch (e) {
      error = getError(e);
    }

    setLoading(false);

    return { data, error };
  };

  return { loading, send };
}

export function usePut<T, D>(url: string, config?: AxiosRequestConfig): IUseWithInput<T, D> {
  const [loading, setLoading] = useState(false);

  const send = async (input: D, conf?: AxiosRequestConfig) => {
    setLoading(true);

    let data;
    let error;

    try {
      const response = await axiosClient.put<T, D>(url, input, { ...config, ...conf });

      data = response;
    } catch (e) {
      error = getError(e);
    }

    setLoading(false);

    return { data, error };
  };

  return { loading, send };
}

export function usePatch<T, D>(url: string, config?: AxiosRequestConfig): IUseWithInput<T, D> {
  const [loading, setLoading] = useState(false);

  const send = async (input: D, conf?: AxiosRequestConfig) => {
    setLoading(true);

    let data;
    let error;

    try {
      const response = await axiosClient.patch<T, D>(url, input, { ...config, ...conf });

      data = response;
    } catch (e) {
      error = getError(e);
    }

    setLoading(false);

    return { data, error };
  };

  return { loading, send };
}

export function useDelete<T = void>(url: string, config?: AxiosRequestConfig): IUseDelete<T> {
  const [loading, setLoading] = useState(false);

  const send = async (conf?: AxiosRequestConfig) => {
    setLoading(true);

    let error;

    try {
      await axiosClient.delete<T>(url, { ...config, ...conf });
    } catch (e) {
      error = getError(e);
    }

    setLoading(false);

    return { error };
  };

  return { loading, send };
}

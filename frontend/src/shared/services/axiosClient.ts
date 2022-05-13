import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

type IApiError = { message: string; userMessage?: string };

class ApiClient {
  protected readonly instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
    });

    this.setInterceptors();
  }

  private setInterceptors() {
    this.instance.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError<IApiError>) => {
        const { response } = error;

        let message = 'Aconteceu algum erro';

        if (response) {
          if (Math.floor(response.status / 100) === 4) {
            if (response.data.userMessage) {
              message = response.data.userMessage;
            } else if (response.status === 401) {
              message = 'Ação não Autorizada';
            } else {
              message = 'Não foi possivel completar a ação!';
            }
          } else if (Math.floor(response.status / 100) === 5) {
            message = 'Erro interno no servidor';
          }
        }

        return Promise.reject(message);
      },
    );

    this.instance.interceptors.request.use((config) => {
      // add the authorization to the headers
      const token = localStorage.getItem('@nanowip:token');

      config.headers = {
        ...config.headers,
        Authorization: token ? `Bearer ${token}` : false,
      };

      return config;
    });
  }

  get = <T>(url: string, config?: AxiosRequestConfig) => this.instance.get<T, T>(url, config);

  post = <T, D>(url: string, data: D, config?: AxiosRequestConfig) =>
    this.instance.post<T, T, D>(url, data, config);

  put = <T, D>(url: string, data: D, config?: AxiosRequestConfig) =>
    this.instance.put<T, T, D>(url, data, config);

  patch = <T, D>(url: string, data: D, config?: AxiosRequestConfig) =>
    this.instance.patch<T, T, D>(url, data, config);

  delete = <T>(url: string, config?: AxiosRequestConfig) => this.instance.delete<T, T>(url, config);
}

const axiosClient = new ApiClient(process.env.REACT_APP_API_BASE_URL || '');

export { axiosClient };

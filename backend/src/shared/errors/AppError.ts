import { HttpException } from '@nestjs/common';

interface IError {
  message: string;
  statusCode?: number;
  userMessage?: string;
}

export class AppError extends HttpException {
  constructor({ message, userMessage, statusCode }: IError) {
    super(
      {
        status: 'error',
        message,
        userMessage,
      },
      statusCode || 400,
    );
  }
}

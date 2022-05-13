import { HttpException } from '@nestjs/common';

export default class AppErrorOld extends HttpException {
  constructor(message: string, statusCode?: number) {
    super(
      {
        status: 'error',
        message,
      },
      statusCode || 400,
    );
  }
}

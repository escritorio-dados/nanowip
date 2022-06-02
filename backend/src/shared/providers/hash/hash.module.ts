import { Module } from '@nestjs/common';

import { HashProvider } from './hashProvider';

@Module({
  providers: [HashProvider],
  exports: [HashProvider],
})
export class HashModule {}

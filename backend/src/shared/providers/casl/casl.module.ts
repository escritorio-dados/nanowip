import { Module } from '@nestjs/common';

import { AbilityCaslFactory } from './factories/ability.casl.factory';

@Module({
  providers: [AbilityCaslFactory],
  exports: [AbilityCaslFactory],
})
export class CaslModule {}

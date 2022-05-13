import { Module } from '@nestjs/common';

import CaslModule from '@shared/providers/casl/casl.module';

import { AssignmentsServiceModule } from './assignments.service.module';
import { AssignmentsController } from './controllers/assignments.controller';

@Module({
  controllers: [AssignmentsController],
  imports: [AssignmentsServiceModule, CaslModule],
})
export class AssignmentsModule {}

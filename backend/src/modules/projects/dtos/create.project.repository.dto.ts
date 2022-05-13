import { Customer } from '@modules/customers/entities/Customer';
import { Portfolio } from '@modules/portfolios/entities/Portfolio';
import { ProjectType } from '@modules/projectTypes/entities/ProjectType';

import { Project } from '../entities/Project';

export type ICreateProjectRepository = {
  name: string;
  organization_id: string;
  customer?: Customer;
  projectParent?: Project;
  projectType: ProjectType;
  portfolios?: Portfolio[];
  deadline?: Date;
  startDate?: Date;
  endDate?: Date | null;
  availableDate?: Date;
};

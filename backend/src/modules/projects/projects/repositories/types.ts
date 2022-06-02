import { Customer } from '@modules/customers/entities/Customer';
import { Portfolio } from '@modules/portfolios/entities/Portfolio';
import { ProjectType } from '@modules/projects/projectTypes/entities/ProjectType';

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

export type IFindByNameProjectRepository = {
  name: string;
  customer_id?: string;
  project_parent_id?: string;
  organization_id: string;
};

export type IFindAllProjectRepository = {
  onlyRoot?: boolean;
  onlySub?: boolean;
  relations?: string[];
  organization_id: string;
};

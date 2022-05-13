import { IStatusDate } from '../IStatusDate';
import { ICustomer } from './ICustomer';
import { IPortfolio } from './IPortfolio';
import { IProduct } from './IProduct';
import { IProjectType } from './IProjectType';
import { ICommonApi } from './shared/ICommonApi';
import { IDatesApi } from './shared/IDatesApi';

export type IProject = ICommonApi &
  IDatesApi & {
    name: string;
    projectType: IProjectType;
    portfolios: IPortfolio[];
    customer: ICustomer;
    customer_id?: string;
    projectParent?: IProject;
    project_parent_id?: string;
    subprojects: IProject[];
    products: IProduct[];
    statusDate: IStatusDate;
  };

export type IProjectFilters = {
  name: string;
  customer: { id: string; name: string } | null;
  project_type: { id: string; name: string } | null;
  portfolio: { id: string; name: string } | null;
  status_date: string | null;

  min_start: Date | null;
  max_start: Date | null;

  min_end: Date | null;
  max_end: Date | null;

  min_available: Date | null;
  max_available: Date | null;

  min_deadline: Date | null;
  max_deadline: Date | null;

  min_updated: Date | null;
  max_updated: Date | null;
};

export type IProjectInput = {
  name: string;
  project_type_id: string;
  portfolios_id?: string[];
  customer_id?: string;
  project_parent_id?: string;
  deadline?: Date | null;
  availableDate?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
};

export const limitedProjectsLength = 100;

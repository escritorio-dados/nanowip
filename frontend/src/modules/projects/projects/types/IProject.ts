import { ICommonApi } from '#shared/types/backend/shared/ICommonApi';
import { IDatesApi } from '#shared/types/backend/shared/IDatesApi';
import { IStatusDate } from '#shared/types/IStatusDate';

import { ICustomer } from '#modules/customers/types/ICustomer';
import { IPortfolio } from '#modules/portfolios/types/IPortfolio';
import { IProduct } from '#modules/products/products/types/IProduct';
import { IProjectType } from '#modules/projects/projectTypes/types/IProjectType';

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
  status_date: { value: string; label: string } | null;

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

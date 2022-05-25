import { Assignment } from '@modules/assignments/entities/Assignment';
import { CollaboratorStatus } from '@modules/colaboratorsStatus/entities/CollaboratorStatus';
import { Collaborator } from '@modules/collaborators/entities/Collaborator';
import { CostDistribution } from '@modules/costs/costDistribuitions/entities/CostDistribution';
import { Cost } from '@modules/costs/costs/entities/Cost';
import { DocumentTypeCost } from '@modules/costs/documentTypes/entities/DocumentType';
import { ServiceProvider } from '@modules/costs/serviceProviders/entities/ServiceProvider';
import { Service } from '@modules/costs/services/entities/Service';
import { Customer } from '@modules/customers/entities/Customer';
import { Measure } from '@modules/measures/entities/Measure';
import { Portfolio } from '@modules/portfolios/entities/Portfolio';
import { Product } from '@modules/products/entities/Product';
import { ProductType } from '@modules/productTypes/entities/ProductType';
import { Project } from '@modules/projects/entities/Project';
import { ProjectType } from '@modules/projectTypes/entities/ProjectType';
import { Role } from '@modules/roles/entities/Role';
import { TaskReportComment } from '@modules/tasks/taskReportComments/entities/TaskReportComment';
import { Task } from '@modules/tasks/tasks/entities/Task';
import { TaskType } from '@modules/tasks/taskTypes/entities/TaskType';
import { Tracker } from '@modules/trackers/entities/Tracker';
import { Trail } from '@modules/trails/entities/Trail';
import { User } from '@modules/users/entities/User';
import { ValueChain } from '@modules/valueChains/entities/ValueChain';

export type Subjects =
  | typeof User
  | typeof Role
  | typeof Customer
  | typeof Portfolio
  | typeof ProjectType
  | typeof Project
  | typeof ProductType
  | typeof Measure
  | typeof Product
  | typeof ValueChain
  | typeof TaskType
  | typeof Task
  | typeof Collaborator
  | typeof CollaboratorStatus
  | typeof Assignment
  | typeof Tracker
  | typeof Trail
  | typeof Cost
  | typeof DocumentTypeCost
  | typeof ServiceProvider
  | typeof Service
  | typeof CostDistribution
  | typeof TaskReportComment
  | 'admin'
  | 'all';

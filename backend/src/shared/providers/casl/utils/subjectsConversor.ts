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
import { Task } from '@modules/tasks/entities/Task';
import { TaskType } from '@modules/taskTypes/entities/TaskType';
import { Tracker } from '@modules/trackers/entities/Tracker';
import { Trail } from '@modules/trails/entities/Trail';
import { User } from '@modules/users/entities/User';
import { ValueChain } from '@modules/valueChains/entities/ValueChain';

import { Subjects } from '../types/subjects.type';

type subjectConversor = {
  [key: string]: Subjects;
};

const subjectsConversor: subjectConversor = {
  customer: Customer,
  portfolio: Portfolio,
  project: Project,
  project_type: ProjectType,
  product: Product,
  value_chain: ValueChain,
  task: Task,
  assignment: Assignment,
  collaborator: Collaborator,
  user: User,
  product_type: ProductType,
  measure: Measure,
  task_type: TaskType,
  collaborator_status: CollaboratorStatus,
  tracker: Tracker,
  role: Role,
  trail: Trail,
  cost: Cost,
  document_type: DocumentTypeCost,
  service_provider: ServiceProvider,
  service: Service,
  cost_distribution: CostDistribution,
};

export default subjectsConversor;

import { Assignment } from '@modules/assignments/entities/Assignment';
import { CollaboratorStatus } from '@modules/collaborators/colaboratorsStatus/entities/CollaboratorStatus';
import { Collaborator } from '@modules/collaborators/collaborators/entities/Collaborator';
import { CostDistribution } from '@modules/costs/costDistribuitions/entities/CostDistribution';
import { Cost } from '@modules/costs/costs/entities/Cost';
import { DocumentTypeCost } from '@modules/costs/documentTypes/entities/DocumentType';
import { ServiceProvider } from '@modules/costs/serviceProviders/entities/ServiceProvider';
import { Customer } from '@modules/customers/entities/Customer';
import { Deliverable } from '@modules/objectives/deliverables/entities/Deliverable';
import { IntegratedObjective } from '@modules/objectives/integratedObjectives/entities/IntegratedObjective';
import { ObjectiveCategory } from '@modules/objectives/objectiveCategories/entities/ObjectiveCategory';
import { OperationalObjective } from '@modules/objectives/operacionalObjectives/entities/OperationalObjective';
import { SectionTrail } from '@modules/objectives/trailsSections/sectionTrails/entities/SectionTrail';
import { Portfolio } from '@modules/portfolios/entities/Portfolio';
import { Measure } from '@modules/products/measures/entities/Measure';
import { Product } from '@modules/products/products/entities/Product';
import { ProductType } from '@modules/products/productTypes/entities/ProductType';
import { Project } from '@modules/projects/projects/entities/Project';
import { ProjectType } from '@modules/projects/projectTypes/entities/ProjectType';
import { TaskReportComment } from '@modules/tasks/taskReportComments/entities/TaskReportComment';
import { Task } from '@modules/tasks/tasks/entities/Task';
import { TaskType } from '@modules/tasks/taskTypes/entities/TaskType';
import { Tracker } from '@modules/trackers/entities/Tracker';
import { Trail } from '@modules/trails/trails/entities/Trail';
import { Role } from '@modules/users/roles/entities/Role';
import { User } from '@modules/users/users/entities/User';
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
  | typeof CostDistribution
  | typeof TaskReportComment
  | typeof OperationalObjective
  | typeof IntegratedObjective
  | typeof ObjectiveCategory
  | typeof SectionTrail
  | typeof Deliverable
  | 'admin'
  | 'all';

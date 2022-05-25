const CustomerPermissions = {
  manage_customer: 'manage_customer',
  read_customer: 'read_customer',
  create_customer: 'create_customer',
  update_customer: 'update_customer',
  delete_customer: 'delete_customer',
};

const PortfolioPermissions = {
  manage_portfolio: 'manage_portfolio',
  read_portfolio: 'read_portfolio',
  create_portfolio: 'create_portfolio',
  update_portfolio: 'update_portfolio',
  delete_portfolio: 'delete_portfolio',
};

const ProjectPermissions = {
  manage_project: 'manage_project',
  read_project: 'read_project',
  create_project: 'create_project',
  update_project: 'update_project',
  delete_project: 'delete_project',
};

const ProjectTypePermissions = {
  manage_project_type: 'manage_project_type',
  read_project_type: 'read_project_type',
  create_project_type: 'create_project_type',
  update_project_type: 'update_project_type',
  delete_project_type: 'delete_project_type',
};

const ProductPermissions = {
  manage_product: 'manage_product',
  read_product: 'read_product',
  create_product: 'create_product',
  update_product: 'update_product',
  delete_product: 'delete_product',
};

const ProductTypePermissions = {
  manage_product_type: 'manage_product_type',
  read_product_type: 'read_product_type',
  create_product_type: 'create_product_type',
  update_product_type: 'update_product_type',
  delete_product_type: 'delete_product_type',
};

const MeasurePermissions = {
  manage_measure: 'manage_measure',
  read_measure: 'read_measure',
  create_measure: 'create_measure',
  update_measure: 'update_measure',
  delete_measure: 'delete_measure',
};

const TaskPermissions = {
  manage_task: 'manage_task',
  read_task: 'read_task',
  create_task: 'create_task',
  update_task: 'update_task',
  delete_task: 'delete_task',
};

const ValueChainPermissions = {
  manage_value_chain: 'manage_value_chain',
  read_value_chain: 'read_value_chain',
  create_value_chain: 'create_value_chain',
  update_value_chain: 'update_value_chain',
  delete_value_chain: 'delete_value_chain',
};

const TaskTypePermissions = {
  manage_task_type: 'manage_task_type',
  read_task_type: 'read_task_type',
  create_task_type: 'create_task_type',
  update_task_type: 'update_task_type',
  delete_task_type: 'delete_task_type',
};

const CollaboratorPermissions = {
  personal_collaborator: 'personal_collaborator',
  manage_collaborator: 'manage_collaborator',
  read_collaborator: 'read_collaborator',
  create_collaborator: 'create_collaborator',
  update_collaborator: 'update_collaborator',
  delete_collaborator: 'delete_collaborator',
};

const CollaboratorStatusPermissions = {
  manage_collaborator_status: 'manage_collaborator_status',
  read_collaborator_status: 'read_collaborator_status',
  create_collaborator_status: 'create_collaborator_status',
  update_collaborator_status: 'update_collaborator_status',
  delete_collaborator_status: 'delete_collaborator_status',
};

const AssignmentPermissions = {
  personal_assignment: 'personal_assignment',
  manage_assignment: 'manage_assignment',
  read_assignment: 'read_assignment',
  create_assignment: 'create_assignment',
  update_assignment: 'update_assignment',
  delete_assignment: 'delete_assignment',
};

const TrackerPermissions = {
  personal_tracker: 'personal_tracker',
  manage_tracker: 'manage_tracker',
  read_tracker: 'read_tracker',
  create_tracker: 'create_tracker',
  update_tracker: 'update_tracker',
  delete_tracker: 'delete_tracker',
};

const UserPermissions = {
  manage_user: 'manage_user',
  read_user: 'read_user',
  create_user: 'create_user',
  update_user: 'update_user',
  delete_user: 'delete_user',
};

const RolePermissions = {
  manage_role: 'manage_role',
  read_role: 'read_role',
  create_role: 'create_role',
  update_role: 'update_role',
  delete_role: 'delete_role',
};

const TrailPermissions = {
  manage_trail: 'manage_trail',
  read_trail: 'read_trail',
  create_trail: 'create_trail',
  update_trail: 'update_trail',
  delete_trail: 'delete_trail',
};

const CostPermissions = {
  manage_cost: 'manage_cost',
  read_cost: 'read_cost',
  create_cost: 'create_cost',
  update_cost: 'update_cost',
  delete_cost: 'delete_cost',
};

const DocumentTypePermissions = {
  manage_document_type: 'manage_document_type',
  read_document_type: 'read_document_type',
  create_document_type: 'create_document_type',
  update_document_type: 'update_document_type',
  delete_document_type: 'delete_document_type',
};

const ServiceProviderPermissions = {
  manage_service_provider: 'manage_service_provider',
  read_service_provider: 'read_service_provider',
  create_service_provider: 'create_service_provider',
  update_service_provider: 'update_service_provider',
  delete_service_provider: 'delete_service_provider',
};

const ServicePermissions = {
  manage_service: 'manage_service',
  read_service: 'read_service',
  create_service: 'create_service',
  update_service: 'update_service',
  delete_service: 'delete_service',
};

const CostDistributionPermissions = {
  manage_cost_distribution: 'manage_cost_distribution',
  read_cost_distribution: 'read_cost_distribution',
  create_cost_distribution: 'create_cost_distribution',
  update_cost_distribution: 'update_cost_distribution',
  delete_cost_distribution: 'delete_cost_distribution',
};

const TaskReportCommentPermissions = {
  manage_task_report_comment: 'manage_task_report_comment',
  read_task_report_comment: 'read_task_report_comment',
  create_task_report_comment: 'create_task_report_comment',
  update_task_report_comment: 'update_task_report_comment',
  delete_task_report_comment: 'delete_task_report_comment',
};

export const PermissionsUser = {
  // All
  admin: 'admin',

  ...CustomerPermissions,

  ...PortfolioPermissions,

  ...ProjectPermissions,

  ...ProjectTypePermissions,

  ...ProductPermissions,

  ...ProductTypePermissions,

  ...MeasurePermissions,

  ...ValueChainPermissions,

  ...TaskPermissions,

  ...TaskTypePermissions,

  ...CollaboratorPermissions,

  ...CollaboratorStatusPermissions,

  ...AssignmentPermissions,

  ...TrackerPermissions,

  ...UserPermissions,

  ...RolePermissions,

  ...TrailPermissions,

  ...CostPermissions,

  ...DocumentTypePermissions,

  ...ServiceProviderPermissions,

  ...ServicePermissions,

  ...CostDistributionPermissions,

  ...TaskReportCommentPermissions,
};

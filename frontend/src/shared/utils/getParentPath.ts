import { ICustomer } from '#shared/types/backend/ICustomer';
import { IProduct } from '#shared/types/backend/IProduct';
import { IProject } from '#shared/types/backend/IProject';
import { ITask } from '#shared/types/backend/ITask';

type IGetParentPathTaskProps = {
  task: ITask;
  getProject?: boolean;
  getValueChain?: boolean;
  getCustomer?: boolean;
};

type IGetParentPathProductProps = {
  product: IProduct;
  getProject?: boolean;
  getCustomer?: boolean;
};

type IGetParentPathProjectProps = { project: IProject; getCustomer?: boolean };

type IResolveParentPathProps = {
  parent: ITask | IProduct | IProject;
  getProject?: boolean;
  getValueChain?: boolean;
  getCustomer?: boolean;
};

export function resolveParentPath({ parent, ...rest }: IResolveParentPathProps) {
  if (parent.__typename === 'Task') {
    return getParentPathTask({
      task: parent as ITask,
      ...rest,
    });
  }

  if (parent.__typename === 'Product') {
    return getParentPathProduct({
      product: parent as IProduct,
      ...rest,
    });
  }

  return getParentPathProject({ project: parent as IProject, ...rest });
}

function getParentPathTask({
  task,
  getValueChain,
  getProject,
  getCustomer,
}: IGetParentPathTaskProps) {
  const { valueChain } = task;

  let parentPath = task.name;

  if (getValueChain) {
    parentPath += ` / ${valueChain.name}`;
  }

  parentPath += ` / ${getParentPathProduct({
    product: valueChain.product,
    getCustomer,
    getProject,
  })}`;

  return parentPath;
}

function getParentPathProduct({ product, getProject, getCustomer }: IGetParentPathProductProps) {
  let parentPath = product.name;

  let project = product.parent as IProject;

  if (product.parent.__typename === 'Product') {
    parentPath += ` / ${product.parent.name}`;

    project = product.parent.parent as IProject;
  }

  if (getProject) {
    parentPath += ` / ${getParentPathProject({ project, getCustomer })}`;
  }

  return parentPath;
}

function getParentPathProject({ project, getCustomer }: IGetParentPathProjectProps) {
  let parentPath = project.name;

  let customer = project.parent as ICustomer;

  if (project.parent.__typename === 'Project') {
    parentPath += ` / ${project.parent.name}`;

    customer = (project.parent as IProject).parent as ICustomer;
  }

  if (getCustomer) {
    parentPath += ` / ${customer.name}`;
  }

  return parentPath;
}

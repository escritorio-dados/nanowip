import { SelectQueryBuilder } from 'typeorm';

import { Product } from '@modules/products/entities/Product';
import { Project } from '@modules/projects/entities/Project';
import { Task } from '@modules/tasks/entities/Task';
import { ValueChain } from '@modules/valueChains/entities/ValueChain';

type IOptionsPath = {
  getProject?: boolean;
  getValueChain?: boolean;
  getCustomer?: boolean;
  getProduct?: boolean;
};

// type IPathItem = { id: string; name: string; entity: string };

type IResolvePath = IOptionsPath & {
  entity: Project | Product | ValueChain | Task;
  entityType: 'project' | 'product' | 'valueChain' | 'task';
  includeEntity?: boolean;
};

type IResolvePathString = IResolvePath & { skipFirstName?: boolean };

// export function getParentPath({
//   entity,
//   entityType,
//   getCustomer,
//   getProduct,
//   getProject,
//   getValueChain,
// }: IResolvePath) {
//   const paths: IPathItem[] = [];

//   const getIdName = (obj: any) => ({ id: obj.id, name: obj.name });

//   const configPath = {
//     project(project: Project, include?: boolean) {
//       const entityName = project.projectParent ? 'Subprojeto' : 'Projeto';

//       if (include) {
//         paths.push({ entity: entityName, ...getIdName(project) });
//       }

//       if (project.projectParent) {
//         paths.push({ entity: 'Projeto', ...getIdName(project.projectParent) });

//         if (getCustomer) {
//           paths.push({ entity: 'Cliente', ...getIdName(project.projectParent.customer) });
//         }
//       } else if (getCustomer) {
//         paths.push({ entity: 'Cliente', ...getIdName(project.customer) });
//       }
//     },
//     product(product: Product, include?: boolean) {
//       const entityName = product.productParent ? 'Subproduto' : 'Produto';

//       if (include) {
//         paths.push({ entity: entityName, ...getIdName(product) });
//       }

//       if (product.productParent) {
//         paths.push({ entity: 'Produto', ...getIdName(product.productParent) });

//         if (getProject || getCustomer) {
//           configPath.project(product.productParent.project, true);
//         }
//       } else if (getProject || getCustomer) {
//         configPath.project(product.project, true);
//       }
//     },
//     valueChain(valueChain: ValueChain, include?: boolean) {
//       if (include) {
//         paths.push({ entity: 'Cadeia de valor', ...getIdName(valueChain) });
//       }

//       if (getProduct || getProject || getCustomer) {
//         configPath.product(valueChain.product, true);
//       }
//     },
//     task(task: Task, include?: boolean) {
//       if (include) {
//         paths.push({ entity: 'Tarefa', ...getIdName(task) });
//       }

//       if (getValueChain || getProduct || getProject || getCustomer) {
//         configPath.valueChain(task.valueChain, true);
//       }
//     },
//   };

//   configPath[entityType](entity as any);

//   return paths;
// }

type IAllowedKeys =
  | 'customer'
  | 'project'
  | 'product'
  | 'valueChain'
  | 'subproject'
  | 'subproduct'
  | 'task';

type IPathItem = {
  [key in IAllowedKeys]?: { id: string; name: string; entity: string };
};

export function getParentPath({
  entity,
  entityType,
  getCustomer,
  getProduct,
  getProject,
  getValueChain,
  includeEntity,
}: IResolvePath) {
  const path: IPathItem = {};

  const getIdName = (obj: any, entityName?: string) => ({
    id: obj.id,
    name: obj.name,
    entity: entityName,
  });

  const configPath = {
    project(project: Project, include?: boolean) {
      const entityName = project.projectParent ? 'Subprojeto' : 'Projeto';
      const entityType2 = project.projectParent ? 'subproject' : 'project';

      if (include) {
        path[entityType2] = getIdName(project, entityName);
      }

      if (project.projectParent) {
        path.project = getIdName(project.projectParent, 'Projeto');

        if (getCustomer) {
          path.customer = getIdName(project.projectParent.customer, 'Cliente');
        }
      } else if (getCustomer) {
        path.customer = getIdName(project.customer, 'Cliente');
      }
    },
    product(product: Product, include?: boolean) {
      const entityName = product.productParent ? 'Subproduto' : 'Produto';
      const entityType2 = product.productParent ? 'subproduct' : 'product';

      if (include) {
        path[entityType2] = getIdName(product, entityName);
      }

      if (product.productParent) {
        path.product = getIdName(product.productParent, 'Produto');

        if (getProject || getCustomer) {
          configPath.project(product.productParent.project, true);
        }
      } else if (getProject || getCustomer) {
        configPath.project(product.project, true);
      }
    },
    valueChain(valueChain: ValueChain, include?: boolean) {
      if (include) {
        path.valueChain = getIdName(valueChain, 'Cadeia de valor');
      }

      if (getProduct || getProject || getCustomer) {
        configPath.product(valueChain.product, true);
      }
    },
    task(task: Task, include?: boolean) {
      if (include) {
        path.task = getIdName(task, 'Tarefa');
      }

      if (getValueChain || getProduct || getProject || getCustomer) {
        configPath.valueChain(task.valueChain, true);
      }
    },
  };

  configPath[entityType](entity as any, includeEntity || false);

  return path;
}

export function getParentPathString({ entity, skipFirstName, ...rest }: IResolvePathString) {
  const paths = getParentPath({ entity, ...rest });

  const firstName = skipFirstName ? '' : entity.name;

  let pathString = Object.values(paths).reduce((name, current) => {
    return `${name} | ${current.name}`;
  }, firstName);

  if (skipFirstName) {
    pathString = pathString.replace(/^ \| /, '');
  }

  return pathString;
}

type IGetParentPathQuery<T> = IOptionsPath & {
  query: SelectQueryBuilder<T>;
  entityType: 'project' | 'product' | 'valueChain' | 'task' | 'assignment' | 'tracker';
};

type IPath = [string, string, string[]?];

type IConfigPath = {
  [key: string]: {
    [key: string]: IPath[];
  };
};

type IGetPathQuery<T> = { query: SelectQueryBuilder<T>; joins: IPath[] };

function getPathQuery<T>({ joins, query }: IGetPathQuery<T>) {
  joins.forEach(([join, alias, fields]) => {
    const fieldsType: string[] = fields as any;

    if (fields) {
      query.leftJoin(join, alias).addSelect(fieldsType.map(field => `${alias}.${field}`));
    } else {
      query.leftJoin(join, alias).addSelect([`${alias}.id`, `${alias}.name`]);
    }
  });
}

export function getParentPathQuery<T>({
  query,
  entityType,
  getCustomer,
  getProduct,
  getProject,
  getValueChain,
}: IGetParentPathQuery<T>) {
  const configPaths: IConfigPath = {
    project: {
      base: [['project.projectParent', 'projectParent']],
      customer: [
        ['project.customer', 'customer'],
        ['projectParent.customer', 'projectParentCustomer'],
      ],
    },
    product: {
      base: [['product.productParent', 'productParent']],
      project: [
        ['product.project', 'project'],
        ['productParent.project', 'productParentProject'],
      ],
      customer: [
        ['productParentProject.customer', 'productParentProjectCustomer'],
        ['productParentProject.projectParent', 'productParentProjectProjectParent'],
        ['productParentProjectProjectParent.customer', 'productParentProjectProjectParentCustomer'],
      ],
    },
    valueChain: {
      base: [['valueChain.product', 'product']],
    },
    task: {
      base: [['task.valueChain', 'valueChain']],
    },
    assignment: {
      base: [['assignment.task', 'task']],
    },
    tracker: {
      base: [['tracker.assignment', 'assignment', ['id']]],
    },
  };

  const paths: IPath[] = [];

  const codeEntities = {
    project() {
      paths.push(...configPaths.project.base);

      if (getCustomer) {
        paths.push(...configPaths.project.customer);
      }
    },
    product() {
      paths.push(...configPaths.product.base);

      if (getProject || getCustomer) {
        paths.push(...configPaths.product.project);

        if (getCustomer) {
          paths.push(...configPaths.product.customer);
        }

        codeEntities.project();
      }
    },
    valueChain() {
      paths.push(...configPaths.valueChain.base);

      if (getProduct || getProject || getCustomer) {
        codeEntities.product();
      }
    },
    task() {
      paths.push(...configPaths.task.base);

      if (getValueChain || getProduct || getProject || getCustomer) {
        codeEntities.valueChain();
      }
    },
    assignment() {
      paths.push(...configPaths.assignment.base);

      codeEntities.task();
    },
    tracker() {
      paths.push(...configPaths.tracker.base);

      codeEntities.assignment();
    },
  };

  codeEntities[entityType]();

  getPathQuery({
    query,
    joins: paths,
  });
}

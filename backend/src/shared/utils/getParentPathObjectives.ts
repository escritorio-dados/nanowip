import { SelectQueryBuilder } from 'typeorm';

import { ObjectiveCategory } from '@modules/objectives/objectiveCategories/entities/ObjectiveCategory';
import { OperationalObjective } from '@modules/objectives/operacionalObjectives/entities/OperationalObjective';

type IOptionsPath = {
  getOperationalObjective?: boolean;
  getIntegratedObjective?: boolean;
};

type IResolvePath = IOptionsPath & {
  entity: OperationalObjective | ObjectiveCategory;
  entityType: 'operationalObjective' | 'objectiveCategory';
  includeEntity?: boolean;
};

type IResolvePathText = IResolvePath & { skipFirstName?: boolean };

type IAllowedKeys = 'integratedObjective' | 'operationalObjective' | 'objectiveCategory';

type IPathItem = {
  [key in IAllowedKeys]?: { id: string; name: string; entity: string };
};

export function getPathObjectives({
  entity,
  entityType,
  includeEntity,
  getIntegratedObjective,
  getOperationalObjective,
}: IResolvePath) {
  const path: IPathItem = {};

  const getIdName = (obj: any, entityName?: string) => ({
    id: obj.id,
    name: obj.name,
    entity: entityName,
  });

  const configPath = {
    operationalObjective(operationalObjective: OperationalObjective, include?: boolean) {
      if (include) {
        path.operationalObjective = getIdName(operationalObjective, 'Objetivo Operacional');
      }

      if (getIntegratedObjective) {
        path.integratedObjective = getIdName(
          operationalObjective.integratedObjective,
          'Objetivo Integrado',
        );
      }
    },
    objectiveCategory(objectiveCategory: ObjectiveCategory, include?: boolean) {
      if (include) {
        path.objectiveCategory = getIdName(objectiveCategory, 'Categoria');
      }

      if (getOperationalObjective || getIntegratedObjective) {
        configPath.operationalObjective(objectiveCategory.operationalObjective, true);
      }
    },
  };

  configPath[entityType](entity as any, includeEntity || false);

  return path;
}

export function getPathStringObjectives({ entity, skipFirstName, ...rest }: IResolvePathText) {
  const paths = getPathObjectives({ entity, ...rest });

  const firstName = skipFirstName ? '' : entity.name;

  let pathString = Object.values(paths).reduce((name, current) => {
    return `${name} | ${current.name}`;
  }, firstName);

  if (skipFirstName) {
    pathString = pathString.replace(/^ \| /, '');
  }

  return pathString;
}

type IGetPathQuery<T> = IOptionsPath & {
  query: SelectQueryBuilder<T>;
  entityType: 'operationalObjective' | 'objectiveCategory';
};

type IPath = [string, string, string[]?];

type IConfigPath = {
  [key: string]: {
    [key: string]: IPath[];
  };
};

type IGetQuery<T> = { query: SelectQueryBuilder<T>; joins: IPath[] };

function getQuery<T>({ joins, query }: IGetQuery<T>) {
  joins.forEach(([join, alias, fields]) => {
    const fieldsType: string[] = fields as any;

    if (fields) {
      query.leftJoin(join, alias).addSelect(fieldsType.map(field => `${alias}.${field}`));
    } else {
      query.leftJoin(join, alias).addSelect([`${alias}.id`, `${alias}.name`]);
    }
  });
}

export function getPathQueryObjectives<T>({
  query,
  entityType,
  getIntegratedObjective,
}: IGetPathQuery<T>) {
  const configPaths: IConfigPath = {
    operationalObjective: {
      base: [['operationalObjective.integratedObjective', 'integratedObjective']],
    },
    objectiveCategory: {
      base: [['objectiveCategory.operationalObjective', 'operationalObjective']],
    },
  };

  const paths: IPath[] = [];

  const codeEntities = {
    operationalObjective() {
      paths.push(...configPaths.operationalObjective.base);
    },
    objectiveCategory() {
      paths.push(...configPaths.objectiveCategory.base);

      if (getIntegratedObjective) {
        codeEntities.operationalObjective();
      }
    },
  };

  codeEntities[entityType]();

  getQuery({
    query,
    joins: paths,
  });
}

export type IPath = {
  id: string;
  name: string;
  entity: string;
};

type IAllowedKeys =
  | 'customer'
  | 'project'
  | 'product'
  | 'valueChain'
  | 'subproject'
  | 'subproduct'
  | 'task';

export type IAllowedKeysCategories = 'integratedObjective' | 'operationalObjective';

type IKeys = IAllowedKeys | IAllowedKeysCategories;

export type IPathObject<T extends IKeys = IAllowedKeys> = {
  [key in T]: IPath;
};

export type ICommonApi<T extends IKeys = IAllowedKeys> = {
  id: string;
  created_at: Date;
  updated_at: Date;
  pathString: string;
  path: IPathObject<T>;
};

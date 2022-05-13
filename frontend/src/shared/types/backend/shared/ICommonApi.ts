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

export type IPathObject = {
  [key in IAllowedKeys]: IPath;
};

export type ICommonApi = {
  id: string;
  created_at: Date;
  updated_at: Date;
  pathString: string;
  path: IPathObject;
};

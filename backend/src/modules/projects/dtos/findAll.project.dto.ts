export type IFindAllProjectDto = {
  onlyRoot?: boolean;
  onlySub?: boolean;
  relations?: string[];
  organization_id: string;
};

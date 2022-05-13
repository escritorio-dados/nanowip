export type ICreateLinkRepositoryDto = {
  title: string;
  organization_id: string;
  url: string;
  description?: string;
  owner?: string;
  category?: string;
};

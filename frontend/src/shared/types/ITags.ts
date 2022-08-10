export type ITag = {
  id: string;
  name: string;
};

export type ITagsGroup = {
  id: string;
  tags: ITag[];
};

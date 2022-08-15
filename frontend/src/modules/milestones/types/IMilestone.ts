import { ICommonApi } from '#shared/types/ICommonApi';

export type IMilestone = ICommonApi & {
  name: string;
  date: Date;
  description?: string;
  milestones_group_id: string;
};

export type IMilestoneInput = {
  name: string;
  date: Date;
  description?: string;
};

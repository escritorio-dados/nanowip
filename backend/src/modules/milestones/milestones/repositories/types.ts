import { MilestonesGroup } from '@modules/milestones/milestonesGroups/entities/MilestonesGroup';

export type ICreateMilestoneReporitory = {
  name: string;
  date: Date;
  organization_id: string;
  description?: string;
  milestonesGroup: MilestonesGroup;
};

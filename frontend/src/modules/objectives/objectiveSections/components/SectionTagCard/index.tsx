import { Box } from '@mui/material';

import { CustomTooltip } from '#shared/components/CustomTooltip';
import { TextEllipsis } from '#shared/styledComponents/common';

import { DeliverableTagCard } from '#modules/objectives/deliverableTags/components/DeliverableTagCard';

import { IObjectiveSectionTag } from '../../types/IObjectiveSection';
import { DeliverablesContainer, SectionContainer, SectionHeader } from './styles';

type ISectionTagCard = {
  section: IObjectiveSectionTag;
  actions: JSX.Element;
  updateModal: (id: string) => void;
  deleteModal: (id: string, name: string) => void;
  infoModal: (id: string) => void;
};

export function SectionTagCard({
  section,
  actions,
  updateModal,
  deleteModal,
  infoModal,
}: ISectionTagCard) {
  return (
    <>
      <SectionContainer>
        <SectionHeader>
          <Box flex={1} maxWidth="70%">
            <CustomTooltip title={section.name}>
              <TextEllipsis>{section.name}</TextEllipsis>
            </CustomTooltip>
          </Box>

          <Box>{actions}</Box>
        </SectionHeader>

        <DeliverablesContainer>
          <Box className="items">
            {section.deliverablesTags.map((deliverable) => (
              <DeliverableTagCard
                key={deliverable.id}
                deliverable={deliverable}
                updateModal={updateModal}
                deleteModal={deleteModal}
                infoModal={infoModal}
              />
            ))}
          </Box>
        </DeliverablesContainer>
      </SectionContainer>
    </>
  );
}

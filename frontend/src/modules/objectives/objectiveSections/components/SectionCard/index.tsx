import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useMemo } from 'react';
import { useDrop } from 'react-dnd';

import { CustomTooltip } from '#shared/components/CustomTooltip';
import { useAuth } from '#shared/hooks/auth';
import { TextEllipsis } from '#shared/styledComponents/common';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { DeliverableCard } from '#modules/objectives/deliverables/components/DeliverableCard';
import { IDeliverable } from '#modules/objectives/deliverables/types/IDeliverable';

import { IObjectiveSection } from '../../types/IObjectiveSection';
import { DeliverablesContainer, SectionContainer, SectionHeader } from './styles';

type ISectionCard = {
  section: IObjectiveSection;
  actions: JSX.Element;
  category_id: string;
  onDrop: (item: IDeliverable) => void;
  createModal: (section_id: string) => void;
  updateModal: (id: string, section_id: string) => void;
  deleteModal: (id: string, name: string, section_id: string) => void;
  infoModal: (id: string) => void;
};

export function SectionCard({
  section,
  actions,
  category_id,
  onDrop,
  createModal,
  updateModal,
  deleteModal,
  infoModal,
}: ISectionCard) {
  const { checkPermissions } = useAuth();

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: `deliverable-${category_id}`,
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const permissions = useMemo(
    () => ({
      createDeliverable: checkPermissions([
        [PermissionsUser.create_deliverable, PermissionsUser.manage_deliverable],
      ]),
    }),
    [checkPermissions],
  );

  return (
    <>
      <SectionContainer
        ref={drop}
        sx={(theme) => ({
          backgroundColor: isOver ? theme.palette.backgoundAlt : undefined,
          borderColor: canDrop ? theme.palette.primary.main : undefined,
        })}
      >
        <SectionHeader>
          <Box flex={1} maxWidth="70%">
            <CustomTooltip title={section.name}>
              <TextEllipsis>{section.name}</TextEllipsis>
            </CustomTooltip>
          </Box>

          <Box>{actions}</Box>
        </SectionHeader>

        <DeliverablesContainer>
          {permissions.createDeliverable && (
            <Box display="flex" alignItems="center" justifyContent="center" marginBottom="0.5rem">
              <Button
                startIcon={<Add />}
                color="inherit"
                sx={(theme) => ({ textTransform: 'none', color: theme.palette.text.primary })}
                onClick={() => createModal(section.id)}
              >
                Adicionar Entregável
              </Button>
            </Box>
          )}

          <Box className="items">
            {section.deliverables.map((deliverable) => (
              <DeliverableCard
                key={deliverable.id}
                deliverable={deliverable}
                category_id={category_id}
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

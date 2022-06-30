import { AccessTimeFilled, Edit, Info } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { blue, green } from '@mui/material/colors';
import { differenceInDays } from 'date-fns';
import { useMemo } from 'react';
import { useDrag } from 'react-dnd';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { useAuth } from '#shared/hooks/auth';
import { TextEllipsis } from '#shared/styledComponents/common';
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IDeliverable } from '../../types/IDeliverable';
import { ProgressBar } from './ProgressBar';
import {
  DeliverableContainer,
  DeliverableDeadline,
  DeliverableHeader,
  DeliverableProgress,
} from './styles';

type IDeliverableCard = {
  deliverable: IDeliverable;
  category_id: string;
  updateModal: (id: string, section_id: string) => void;
  deleteModal: (id: string, name: string, section_id: string) => void;
  infoModal: (id: string) => void;
};

export function DeliverableCard({
  deliverable,
  category_id,
  updateModal,
  deleteModal,
  infoModal,
}: IDeliverableCard) {
  const { checkPermissions } = useAuth();

  const [{ opacity }, drag, preview] = useDrag(
    () => ({
      type: `deliverable-${category_id}`,
      item: deliverable,
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
      }),
    }),
    [deliverable, category_id],
  );

  const permissions = useMemo(
    () => ({
      readDeliverable: checkPermissions([
        [PermissionsUser.read_deliverable, PermissionsUser.manage_deliverable],
      ]),
      updateDeliverable: checkPermissions([
        [PermissionsUser.update_deliverable, PermissionsUser.manage_deliverable],
      ]),
      deleteDeliverable: checkPermissions([
        [PermissionsUser.delete_deliverable, PermissionsUser.manage_deliverable],
      ]),
    }),
    [checkPermissions],
  );

  const deadlineFormmated = useMemo(() => {
    if (!deliverable.deadline) {
      return null;
    }

    const dateFormatted = parseDateApi(deliverable.deadline, "dd 'de' MMMM '-' yyyy", '-');

    const diffDays = differenceInDays(new Date(deliverable.deadline), new Date());

    const prefix = diffDays < 0 ? 'Passou' : 'Faltam';

    return `${dateFormatted} (${prefix}: ${Math.abs(diffDays)} dias)`;
  }, [deliverable.deadline]);

  return (
    <>
      <DeliverableContainer ref={preview} sx={{ opacity }}>
        <DeliverableHeader>
          <Box flex={1} maxWidth="75%" ref={drag} sx={{ cursor: 'grab' }}>
            <CustomTooltip title={deliverable.name}>
              <TextEllipsis fontSize="0.875rem">{deliverable.name}</TextEllipsis>
            </CustomTooltip>
          </Box>

          <Box>
            {permissions.readDeliverable && (
              <CustomIconButton
                iconType="custom"
                title="Info"
                action={() => infoModal(deliverable.id)}
                CustomIcon={<Info fontSize="small" sx={{ color: 'text.primary' }} />}
                sx={{ padding: '5px' }}
              />
            )}

            {permissions.updateDeliverable && (
              <CustomIconButton
                iconType="custom"
                title="Editar Entregável"
                action={() => updateModal(deliverable.id, deliverable.objective_section_id)}
                CustomIcon={<Edit fontSize="small" sx={{ color: 'secondary.main' }} />}
                sx={{ padding: '5px' }}
              />
            )}

            {permissions.deleteDeliverable && (
              <CustomIconButton
                iconType="delete"
                iconSize="small"
                title="Deletar Entregável"
                action={() =>
                  deleteModal(deliverable.id, deliverable.name, deliverable.objective_section_id)
                }
                sx={{ padding: '5px' }}
              />
            )}
          </Box>
        </DeliverableHeader>

        {deadlineFormmated && (
          <DeliverableDeadline>
            <AccessTimeFilled fontSize="small" sx={{ marginRight: '0.3rem' }} />

            <Typography>{deadlineFormmated}</Typography>
          </DeliverableDeadline>
        )}

        {(Number.isInteger(deliverable.progress) ||
          Number.isInteger(deliverable.progressValueChains)) && (
          <DeliverableProgress>
            {Number.isInteger(deliverable.progress) && (
              <ProgressBar
                progress={deliverable.progress}
                goal={deliverable.goal}
                prefix={
                  <Typography fontSize="0.875rem" marginRight="0.3rem" width="25px">
                    M:
                  </Typography>
                }
                color={green[500]}
              />
            )}

            {Number.isInteger(deliverable.progressValueChains) && (
              <ProgressBar
                progress={deliverable.progressValueChains}
                goal={deliverable.goalValueChains}
                prefix={
                  <Typography fontSize="0.875rem" marginRight="0.3rem" width="25px">
                    CV:
                  </Typography>
                }
                color={blue[500]}
              />
            )}
          </DeliverableProgress>
        )}
      </DeliverableContainer>
    </>
  );
}

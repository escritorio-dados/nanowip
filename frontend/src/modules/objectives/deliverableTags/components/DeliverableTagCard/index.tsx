import { AccessTimeFilled, Edit, Info } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { blue, green } from '@mui/material/colors';
import { differenceInDays } from 'date-fns';
import { useMemo } from 'react';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { useAuth } from '#shared/hooks/auth';
import { TextEllipsis } from '#shared/styledComponents/common';
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IDeliverableTag } from '../../types/IDeliverableTag';
import { ProgressBar } from './ProgressBar';
import {
  DeliverableContainer,
  DeliverableDeadline,
  DeliverableHeader,
  DeliverableProgress,
} from './styles';

type IDeliverableTagCard = {
  deliverable: IDeliverableTag;
  updateModal: (id: string) => void;
  deleteModal: (id: string, name: string) => void;
  infoModal: (id: string) => void;
};

export function DeliverableTagCard({
  deliverable,
  updateModal,
  deleteModal,
  infoModal,
}: IDeliverableTagCard) {
  const { checkPermissions } = useAuth();

  const permissions = useMemo(
    () => ({
      readDeliverableTag: checkPermissions([
        [PermissionsUser.read_deliverable, PermissionsUser.manage_deliverable],
      ]),
      updateDeliverableTag: checkPermissions([
        [PermissionsUser.update_deliverable, PermissionsUser.manage_deliverable],
      ]),
      deleteDeliverableTag: checkPermissions([
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
      <DeliverableContainer>
        <DeliverableHeader>
          <Box flex={1} maxWidth="75%">
            <CustomTooltip title={deliverable.name}>
              <TextEllipsis fontSize="0.875rem">{deliverable.name}</TextEllipsis>
            </CustomTooltip>
          </Box>

          <Box>
            {permissions.readDeliverableTag && (
              <CustomIconButton
                iconType="custom"
                title="Info"
                action={() => infoModal(deliverable.id)}
                CustomIcon={<Info fontSize="small" sx={{ color: 'text.primary' }} />}
                sx={{ padding: '5px' }}
              />
            )}

            {permissions.updateDeliverableTag && (
              <CustomIconButton
                iconType="custom"
                title="Editar Entregável"
                action={() => updateModal(deliverable.id)}
                CustomIcon={<Edit fontSize="small" sx={{ color: 'secondary.main' }} />}
                sx={{ padding: '5px' }}
              />
            )}

            {permissions.deleteDeliverableTag && (
              <CustomIconButton
                iconType="delete"
                iconSize="small"
                title="Deletar Entregável"
                action={() => deleteModal(deliverable.id, deliverable.name)}
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

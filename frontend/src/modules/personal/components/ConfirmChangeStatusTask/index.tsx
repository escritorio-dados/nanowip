import { Box, Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePut } from '#shared/services/useAxios';
import { IPathObject } from '#shared/types/backend/shared/ICommonApi';
import { IReloadModal } from '#shared/types/IModal';

import { IAssignment, IChangeStatusAssignmentInput } from '#modules/assignments/types/IAssignment';

type IConfirmReopenTaskModal = IReloadModal & {
  assignment: { id: string; path: IPathObject };
  status: 'Aberto' | 'Fechado';
};

export function ConfirmChangeStatusTaskModal({
  closeModal,
  openModal,
  assignment,
  status,
  reloadList,
}: IConfirmReopenTaskModal) {
  const { toast } = useToast();

  const { loading: endTaskLoading, send: endTask } = usePut<
    IAssignment,
    IChangeStatusAssignmentInput
  >(`/assignments/personal/${assignment.id}`);

  const handleChangeStatus = useCallback(async () => {
    if (!assignment) {
      return;
    }

    const { error } = await endTask({ status });

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    reloadList();

    const message = status === 'Aberto' ? 'Tarefa reaberta' : 'Tafefa finalizada';

    toast({ message, severity: 'success' });

    closeModal();
  }, [assignment, endTask, status, reloadList, toast, closeModal]);

  return (
    <>
      <Loading loading={endTaskLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title={status === 'Aberto' ? 'Reabrir Tarefa' : 'Finalizar Tarefa'}
        maxWidth="xs"
      >
        <Typography>
          Tem Certeza que deseja {status === 'Aberto' ? 'reabrir' : 'finalizar'} a tarefa:
        </Typography>

        <Box sx={{ marginTop: '1rem', marginLeft: '1rem' }}>
          {Object.values(assignment.path)
            .reverse()
            .map(({ id, name, entity }) => (
              <Box key={id} sx={{ display: 'flex' }}>
                <Typography
                  fontSize="0.875rem"
                  sx={(theme) => ({ color: theme.palette.primary.main })}
                >
                  {entity}:
                </Typography>

                <Typography fontSize="0.875rem" sx={{ marginLeft: '0.5rem' }}>
                  {name}
                </Typography>
              </Box>
            ))}
        </Box>

        <CustomButton
          color={status === 'Aberto' ? 'success' : 'primary'}
          onClick={handleChangeStatus}
        >
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}

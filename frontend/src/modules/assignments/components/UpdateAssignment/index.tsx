import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IUpdateModal } from '#shared/types/IModal';
import { getDurationSeconds } from '#shared/utils/parseDateApi';
import { convertDurationToSeconds } from '#shared/utils/validateDuration';

import {
  updateAssignmentSchema,
  IUpdateAssignmentSchema,
} from '#modules/assignments/schemas/updateAssignment.schema';
import { IAssignment, IUpdateAssignmentInput } from '#modules/assignments/types/IAssignment';

type IUpdateAssignmentModal = IUpdateModal<IAssignment> & { assignment_id: string };

export function UpdateAssignmentModal({
  closeModal,
  assignment_id,
  openModal,
  updateList,
}: IUpdateAssignmentModal) {
  const { toast } = useToast();

  const { send: updateAssignment, loading: updateLoading } = usePut<
    IAssignment,
    IUpdateAssignmentInput
  >(`/assignments/${assignment_id}`);

  const {
    loading: assignmentLoading,
    data: assignmentData,
    error: assignmentError,
  } = useGet<IAssignment>({ url: `/assignments/${assignment_id}` });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IUpdateAssignmentSchema>({
    resolver: yupResolver(updateAssignmentSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (assignmentError) {
      toast({ message: assignmentError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, assignmentError, toast]);

  const defaultTimeLimit = useMemo(() => {
    if (!assignmentData?.timeLimit) {
      return '';
    }

    return getDurationSeconds({ duration: assignmentData.timeLimit || 0, zeroString: '' });
  }, [assignmentData]);

  const onSubmit = useCallback(
    async ({ status, timeLimit }: IUpdateAssignmentSchema) => {
      const { error: updateErrors, data } = await updateAssignment({
        status,
        timeLimit: timeLimit ? convertDurationToSeconds(timeLimit) : undefined,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(assignment_id, data as IAssignment);

      toast({ message: 'atribuição atualizada', severity: 'success' });

      closeModal();
    },
    [updateAssignment, updateList, assignment_id, toast, closeModal],
  );

  if (assignmentLoading) return <Loading loading={assignmentLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {assignmentData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Editar atribuição"
          maxWidth="xs"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormSelect
              required
              control={control}
              name="status"
              label="Status"
              options={['Aberto', 'Fechado']}
              defaultValue={assignmentData.status}
              errors={errors.status}
              margin_type="no-margin"
            />

            <FormTextField
              control={control}
              name="timeLimit"
              label="Tempo Limite"
              helperText="Formato: hh:mm:ss"
              errors={errors.timeLimit}
              defaultValue={defaultTimeLimit}
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}

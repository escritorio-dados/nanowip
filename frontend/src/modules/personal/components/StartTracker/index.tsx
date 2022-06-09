import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePost } from '#shared/services/useAxios';
import { IReloadModal } from '#shared/types/IModal';

import {
  IStartTrackerSchema,
  startTrackerSchema,
} from '#modules/personal/schema/startTracker.schema';
import { IStartTrackerInput, ITracker } from '#modules/trackers/types/ITracker';

export function StartTrackerModal({ closeModal, openModal, reloadList }: IReloadModal) {
  const { toast } = useToast();

  const { loading: startTrackerLoading, send: startTracker } = usePost<
    ITracker,
    IStartTrackerInput
  >(`/trackers/start`);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IStartTrackerSchema>({
    resolver: yupResolver(startTrackerSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ reason }: IStartTrackerSchema) => {
      const { error } = await startTracker({ reason });

      if (error) {
        toast({ message: error, severity: 'error' });

        return;
      }

      reloadList();

      closeModal();
    },
    [startTracker, reloadList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={startTrackerLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Iniciar Tracker" maxWidth="xs">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            required
            name="reason"
            label="Motivo"
            control={control}
            errors={errors.reason}
            margin_type="no-margin"
          />

          <CustomButton type="submit">Iniciar Tarefa</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}

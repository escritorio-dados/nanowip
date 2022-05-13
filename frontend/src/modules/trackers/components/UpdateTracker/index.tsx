import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IAssignment, limitedAssignmentsLength } from '#shared/types/backend/IAssignment';
import { ITracker, IUpdateTrackerInput } from '#shared/types/backend/ITracker';

import {
  updateTrackerSchema,
  IUpdateTrackerSchema,
} from '#modules/trackers/schemas/updateTracker.schema';

type IUpdateTrackerModal = {
  openModal: boolean;
  closeModal: () => void;
  tracker_id: string;
  reloadList: () => void;
};

export function UpdateTrackerModal({
  closeModal,
  tracker_id,
  openModal,
  reloadList,
}: IUpdateTrackerModal) {
  const { toast } = useToast();

  const { send: updateTracker, loading: updateLoading } = usePut<ITracker, IUpdateTrackerInput>(
    `/trackers/${tracker_id}`,
  );

  const {
    loading: trackerLoading,
    data: trackerData,
    error: trackerError,
  } = useGet<ITracker>({ url: `/trackers/${tracker_id}` });

  const {
    loading: assignmentsLoading,
    data: assignmentsData,
    error: assignmentsError,
    send: getAssignments,
  } = useGet<IAssignment[]>({
    url: '/assignments/limited/open',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IUpdateTrackerSchema>({
    resolver: yupResolver(updateTrackerSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (trackerError) {
      toast({ message: trackerError, severity: 'error' });

      closeModal();
    }

    if (assignmentsError) {
      toast({ message: assignmentsError, severity: 'error' });
    }
  }, [closeModal, trackerError, toast, assignmentsError]);

  const assignmentsOptions = useMemo(() => {
    const options = !assignmentsData ? [] : assignmentsData;

    if (trackerData?.assignment_id) {
      const filter = options.find((assignment) => assignment.id === trackerData.assignment_id);

      if (!filter) {
        const pathString = Object.values(trackerData.path)
          .map(({ name }) => name)
          .join(' | ');

        options.push({
          id: trackerData.assignment_id,
          pathString,
          path: trackerData.path,
        } as any);
      }
    }

    return options;
  }, [assignmentsData, trackerData]);

  const defaultAssignment = useMemo(() => {
    if (!trackerData?.assignment_id) {
      return null;
    }

    const pathString = Object.values(trackerData.path)
      .map(({ name }) => name)
      .join(' | ');

    return {
      id: trackerData.assignment_id,
      pathString,
      path: trackerData.path,
    };
  }, [trackerData]);

  const onSubmit = useCallback(
    async ({ assignment, end, start, reason }: IUpdateTrackerSchema) => {
      const { error: updateErrors } = await updateTracker({
        assignment_id: assignment?.id,
        start,
        end,
        reason: reason || undefined,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'tracker atualizado', severity: 'success' });

      closeModal();
    },
    [updateTracker, reloadList, toast, closeModal],
  );

  if (trackerLoading) return <Loading loading={trackerLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {trackerData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title={`Editar tracker - ${trackerData.collaborator.name} | ${
            trackerData.reason || trackerData.path.task.name
          }`}
          maxWidth="sm"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormSelectAsync
              control={control}
              margin_type="no-margin"
              name="assignment"
              label="Atribuição"
              options={assignmentsOptions}
              optionValue="id"
              optionLabel="pathString"
              filterField="name"
              defaultValue={defaultAssignment}
              errors={errors.assignment as any}
              loading={assignmentsLoading}
              handleOpen={() => {
                getAssignments({ params: { collaborator_id: trackerData.collaborator_id } });
              }}
              renderOption={(props, option: IAssignment) => (
                <CustomTooltip
                  key={option.id}
                  title={
                    <Box>
                      {Object.values(option.path)
                        .reverse()
                        .map(({ id, name, entity }) => (
                          <Box key={id} sx={{ display: 'flex' }}>
                            <Typography sx={(theme) => ({ color: theme.palette.primary.main })}>
                              {entity}:
                            </Typography>

                            <Typography sx={{ marginLeft: '0.5rem' }}>{name}</Typography>
                          </Box>
                        ))}
                    </Box>
                  }
                  text={
                    <Box {...props} key={option.id} component="li">
                      <Box width="100%">
                        <TextEllipsis
                          sx={(theme) => ({
                            color: theme.palette.primary.main,
                          })}
                        >
                          {option.path.subproduct?.name ? `${option.path.subproduct?.name} | ` : ''}
                          {option.path.product.name}
                        </TextEllipsis>

                        <TextEllipsis>
                          {option.path.task.name} | {option.path.valueChain.name}
                        </TextEllipsis>
                      </Box>
                    </Box>
                  }
                />
              )}
              handleFilter={(params) =>
                getAssignments({
                  params: { ...params, collaborator_id: trackerData.collaborator_id },
                })
              }
              limitFilter={limitedAssignmentsLength}
            />

            <FormTextField
              control={control}
              name="reason"
              label="Motivo"
              errors={errors.reason}
              defaultValue={trackerData.reason}
              helperText="Preecher o motivo ou a atribuição"
            />

            <FormDateTimePicker
              control={control}
              name="start"
              label="Inicio"
              errors={errors.start}
              defaultValue={trackerData.start}
            />

            <FormDateTimePicker
              control={control}
              name="end"
              label="Fim"
              errors={errors.end}
              defaultValue={trackerData.end}
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}

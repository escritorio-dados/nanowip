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
import { useAuth } from '#shared/hooks/auth';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePost } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IAssignment, limitedAssignmentsLength } from '#shared/types/backend/IAssignment';
import { ITracker, ICreateTrackerInputPersonal } from '#shared/types/backend/ITracker';

import {
  createTrackerPersonalSchema,
  ICreateTrackerPersonalSchema,
} from '#modules/personal/schema/createTrackerPersonal.schema';

type ICreateTrackerModal = {
  openModal: boolean;
  closeModal(): void;
  reloadList: () => void;
};

export function CreateTrackerPersonalModal({
  openModal,
  closeModal,
  reloadList,
}: ICreateTrackerModal) {
  const { toast } = useToast();
  const { user } = useAuth();

  const { send: createTracker, loading: createLoading } = usePost<
    ITracker,
    ICreateTrackerInputPersonal
  >('trackers/personal');

  const {
    loading: assignmentsLoading,
    data: assignmentsData,
    error: assignmentsError,
    send: getAssignments,
  } = useGet<IAssignment[]>({
    url: '/assignments/personal/limited/open',
    lazy: true,
  });

  useEffect(() => {
    if (assignmentsError) {
      toast({ message: assignmentsError, severity: 'error' });
    }
  }, [toast, closeModal, assignmentsError]);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ICreateTrackerPersonalSchema>({
    resolver: yupResolver(createTrackerPersonalSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const assignmentsOptions = useMemo(() => {
    if (!assignmentsData) {
      return [];
    }

    return assignmentsData;
  }, [assignmentsData]);

  const onSubmit = useCallback(
    async ({ assignment, end, start, reason }: ICreateTrackerPersonalSchema) => {
      const { error: createErrors } = await createTracker({
        assignment_id: assignment?.id,
        start,
        end,
        reason: reason || undefined,
      });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'tracker criado', severity: 'success' });

      closeModal();
    },
    [createTracker, reloadList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Tracker"
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormSelectAsync
            control={control}
            name="assignment"
            label="Atribuição"
            options={assignmentsOptions}
            optionValue="id"
            optionLabel="pathString"
            filterField="name"
            margin_type="no-margin"
            defaultValue={null}
            errors={errors.assignment as any}
            loading={assignmentsLoading}
            handleOpen={() => {
              getAssignments({ params: { collaborator_id: user.collaborator?.id || '' } });
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
                params: { ...params, collaborator_id: user.collaborator?.id || '' },
              })
            }
            limitFilter={limitedAssignmentsLength}
          />

          <FormTextField
            control={control}
            name="reason"
            label="Motivo"
            errors={errors.reason}
            helperText="Preecher o motivo ou a atribuição"
          />

          <FormDateTimePicker
            required
            control={control}
            name="start"
            label="Inicio"
            errors={errors.start}
            defaultValue={null}
          />

          <FormDateTimePicker
            control={control}
            name="end"
            label="Fim"
            errors={errors.end}
            defaultValue={null}
          />

          <CustomButton type="submit">Cadastrar Tracker</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}

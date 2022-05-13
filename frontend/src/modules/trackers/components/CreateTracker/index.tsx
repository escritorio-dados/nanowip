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
import { useGet, usePost } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IAssignment, limitedAssignmentsLength } from '#shared/types/backend/IAssignment';
import { ICollaborator, limitedCollaboratorsLength } from '#shared/types/backend/ICollaborator';
import { ITracker, ICreateTrackerInput } from '#shared/types/backend/ITracker';

import {
  ICreateTrackerSchema,
  createTrackerSchema,
} from '#modules/trackers/schemas/createTracker.schema';

type ICreateTrackerModal = {
  openModal: boolean;
  closeModal(): void;
  reloadList: () => void;
  defaultCollaborator?: { id: string; name: string } | null;
};

export function CreateTrackerModal({
  openModal,
  closeModal,
  reloadList,
  defaultCollaborator,
}: ICreateTrackerModal) {
  const { toast } = useToast();

  const { send: createTracker, loading: createLoading } = usePost<ITracker, ICreateTrackerInput>(
    'trackers',
  );

  const {
    loading: collaboratorsLoading,
    data: collaboratorsData,
    error: collaboratorsError,
    send: getCollaborators,
  } = useGet<ICollaborator[]>({
    url: '/collaborators/limited/trackers',
    lazy: true,
  });

  const {
    loading: assignmentsLoading,
    data: assignmentsData,
    error: assignmentsError,
    send: getAssignments,
  } = useGet<IAssignment[]>({
    url: '/assignments/limited/open',
    lazy: true,
  });

  useEffect(() => {
    if (collaboratorsError) {
      toast({ message: collaboratorsError, severity: 'error' });

      return;
    }

    if (assignmentsError) {
      toast({ message: assignmentsError, severity: 'error' });
    }
  }, [toast, closeModal, collaboratorsError, assignmentsError]);

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<ICreateTrackerSchema>({
    resolver: yupResolver(createTrackerSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const collaboratorSelected = watch('collaborator', defaultCollaborator as any);

  useEffect(() => {
    if (collaboratorSelected) {
      getAssignments({ params: { collaborator_id: collaboratorSelected.id } });
    }
  }, [collaboratorSelected, getAssignments]);

  const assignmentsOptions = useMemo(() => {
    if (!assignmentsData || !collaboratorSelected) {
      return [];
    }

    return assignmentsData;
  }, [assignmentsData, collaboratorSelected]);

  const collaboratorsOptions = useMemo(() => {
    const options = !collaboratorsData ? [] : collaboratorsData;

    if (defaultCollaborator) {
      const filter = options.find((collaborator) => collaborator.id === defaultCollaborator.id);

      if (!filter) {
        options.push(defaultCollaborator as any);
      }
    }

    return options;
  }, [collaboratorsData, defaultCollaborator]);

  const onSubmit = useCallback(
    async ({ assignment, end, start, reason, collaborator }: ICreateTrackerSchema) => {
      const { error: createErrors } = await createTracker({
        collaborator_id: collaborator.id,
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
            required
            control={control}
            name="collaborator"
            label="Colaborador"
            options={collaboratorsOptions}
            optionLabel="name"
            optionValue="id"
            defaultValue={defaultCollaborator || null}
            margin_type="no-margin"
            errors={errors.collaborator as any}
            loading={collaboratorsLoading}
            handleOpen={() => getCollaborators()}
            handleFilter={(params) => getCollaborators(params)}
            limitFilter={limitedCollaboratorsLength}
            filterField="name"
          />

          <FormSelectAsync
            control={control}
            disabled={!collaboratorSelected}
            name="assignment"
            label="Atribuição"
            options={assignmentsOptions}
            optionValue="id"
            optionLabel="pathString"
            filterField="name"
            defaultValue={null}
            errors={errors.assignment as any}
            loading={assignmentsLoading}
            handleOpen={() => {
              if (collaboratorSelected) {
                getAssignments({ params: { collaborator_id: collaboratorSelected.id } });
              }
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
              getAssignments({ params: { ...params, collaborator_id: collaboratorSelected.id } })
            }
            limitFilter={limitedAssignmentsLength}
            helperText="Selecione um colaborador primeiro"
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

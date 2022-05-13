import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { ICollaborator, ICollaboratorInput } from '#shared/types/backend/ICollaborator';
import { IUser, limitedUsersLength } from '#shared/types/backend/IUser';

import {
  collaboratorSchema,
  ICollaboratorSchema,
} from '#modules/collaborators/schema/collaborator.schema';

type IUpdateCollaboratorModal = {
  openModal: boolean;
  closeModal: () => void;
  collaborator_id: string;
  handleUpdateData: (id: string, newData: ICollaborator) => void;
};

export function UpdateCollaboratorModal({
  closeModal,
  collaborator_id,
  openModal,
  handleUpdateData,
}: IUpdateCollaboratorModal) {
  const { toast } = useToast();

  const { send: updateCollaborator, loading: updateLoading } = usePut<
    ICollaborator,
    ICollaboratorInput
  >(`/collaborators/${collaborator_id}`);

  const {
    loading: collaboratorLoading,
    data: collaboratorData,
    error: collaboratorError,
  } = useGet<ICollaborator>({ url: `/collaborators/${collaborator_id}` });

  const {
    loading: usersLoading,
    data: usersData,
    error: usersError,
    send: getUsers,
  } = useGet<IUser[]>({
    url: '/users/limited',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ICollaboratorSchema>({
    resolver: yupResolver(collaboratorSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (collaboratorError) {
      toast({ message: collaboratorError, severity: 'error' });

      closeModal();
    }

    if (usersError) {
      toast({ message: usersError, severity: 'error' });
    }
  }, [closeModal, collaboratorError, toast, usersError]);

  const usersOptions = useMemo(() => {
    const options = !usersData ? [] : usersData;

    if (collaboratorData && !!collaboratorData.user) {
      const filter = options.find((option) => option.id === collaboratorData.user!.id);

      if (!filter) {
        options.push(collaboratorData.user);
      }
    }

    return options;
  }, [collaboratorData, usersData]);

  const onSubmit = useCallback(
    async ({ name, jobTitle, type, user }: ICollaboratorSchema) => {
      const { error: updateErrors, data } = await updateCollaborator({
        name,
        jobTitle,
        type: type || '',
        user_id: user?.id,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      handleUpdateData(collaborator_id, data as ICollaborator);

      toast({ message: 'colaborador atualizado', severity: 'success' });

      closeModal();
    },
    [updateCollaborator, handleUpdateData, collaborator_id, toast, closeModal],
  );

  if (collaboratorLoading) return <Loading loading={collaboratorLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {collaboratorData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title={`Editar colaborador - ${collaboratorData.name}`}
          maxWidth="xs"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              required
              name="name"
              label="Nome"
              defaultValue={collaboratorData.name}
              control={control}
              errors={errors.name}
              margin_type="no-margin"
            />

            <FormTextField
              required
              name="jobTitle"
              label="Cargo"
              defaultValue={collaboratorData.jobTitle}
              control={control}
              errors={errors.jobTitle}
            />

            <FormSelect
              required
              control={control}
              label="Tipo"
              name="type"
              options={['Interno', 'Externo']}
              defaultValue={collaboratorData.type}
              errors={errors.type as any}
            />

            <FormSelectAsync
              control={control}
              name="user"
              label="Usuario"
              options={usersOptions}
              optionLabel="email"
              optionValue="id"
              filterField="email"
              defaultValue={collaboratorData.user}
              errors={errors.user as any}
              loading={usersLoading}
              handleOpen={() => getUsers({ params: { free: true } })}
              handleFilter={(params) => getUsers({ params: { ...params.params, free: true } })}
              limitFilter={limitedUsersLength}
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}

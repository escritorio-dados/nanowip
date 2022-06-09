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
import { useGet, usePost } from '#shared/services/useAxios';
import { IAddModal } from '#shared/types/IModal';

import {
  collaboratorSchema,
  ICollaboratorSchema,
} from '#modules/collaborators/collaborators/schema/collaborator.schema';
import {
  ICollaborator,
  ICollaboratorInput,
} from '#modules/collaborators/collaborators/types/ICollaborator';
import { IUser, limitedUsersLength } from '#modules/users/users/types/IUser';

export function CreateCollaboratorModal({
  openModal,
  closeModal,
  addList,
}: IAddModal<ICollaborator>) {
  const { toast } = useToast();

  const { send: createCollaborator, loading: createLoading } = usePost<
    ICollaborator,
    ICollaboratorInput
  >('collaborators');

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
    formState: { errors },
    control,
  } = useForm<ICollaboratorSchema>({
    resolver: yupResolver(collaboratorSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (usersError) {
      toast({ message: usersError, severity: 'error' });
    }
  }, [usersError, toast]);

  const usersOptions = useMemo(() => {
    const options = !usersData ? [] : usersData;

    return options;
  }, [usersData]);

  const onSubmit = useCallback(
    async ({ name, jobTitle, type, user }: ICollaboratorSchema) => {
      const { error: createErrors, data } = await createCollaborator({
        name,
        jobTitle,
        type: type || '',
        user_id: user?.id,
      });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      addList(data as ICollaborator);

      toast({ message: 'colaborador criado', severity: 'success' });

      closeModal();
    },
    [createCollaborator, addList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Colaborador"
        maxWidth="xs"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            required
            name="name"
            label="Nome"
            control={control}
            errors={errors.name}
            margin_type="no-margin"
          />

          <FormTextField
            required
            name="jobTitle"
            label="Cargo"
            control={control}
            errors={errors.jobTitle}
          />

          <FormSelect
            required
            control={control}
            label="Tipo"
            name="type"
            options={['Interno', 'Externo']}
            defaultValue={null}
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
            defaultValue={null}
            errors={errors.user as any}
            loading={usersLoading}
            handleOpen={() => getUsers({ params: { free: true } })}
            handleFilter={(params) => getUsers({ params: { ...params.params, free: true } })}
            limitFilter={limitedUsersLength}
          />

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}

import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useNavBar } from '#shared/hooks/navBar';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';

import { IOrganization } from '#modules/organizations/types/IOrganization';
import { authSchema, IAuthSchema } from '#modules/users/users/schema/auth.schema';

import { AuthContainer, FormStyled } from './styles';

export function Auth() {
  const { openNavBar, closeNavBar } = useNavBar();
  const { updateTitle } = useTitle();
  const { signIn, logged } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { toast } = useToast();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IAuthSchema>({
    resolver: yupResolver(authSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const {
    data: organizations,
    error: organizationsError,
    loading: organizationsLoading,
  } = useGet<IOrganization[]>({ url: '/organizations/public' });

  useEffect(() => {
    if (organizationsError) {
      toast({ message: organizationsError, severity: 'error' });
    }
  }, [organizationsError, toast]);

  useEffect(() => {
    if (logged) {
      if ((state as any)?.returnThisPage) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }

    if (openNavBar) {
      closeNavBar();
    }

    updateTitle('Autenticação');
  }, [closeNavBar, navigate, logged, openNavBar, updateTitle, state]);

  const onSubmit = useCallback(
    async ({ organization, ...rest }: IAuthSchema) => {
      await signIn({ ...rest, organization_id: organization.id });
    },
    [signIn],
  );

  if (organizationsLoading) return <Loading loading={organizationsLoading} />;

  return (
    <AuthContainer elevation={3}>
      <FormStyled onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormTextField
          required
          control={control}
          name="email"
          label="E-mail"
          margin_type="no-margin"
          errors={errors.email}
        />

        <FormTextField
          required
          control={control}
          autoComplete="current-password"
          type="password"
          name="password"
          label="Senha"
          errors={errors.password}
        />

        <FormSelect
          control={control}
          name="organization"
          label="Organização"
          options={organizations}
          optionLabel="name"
          optionValue="id"
          defaultValue={null}
          errors={errors.organization?.name}
        />

        <CustomButton type="submit">Entrar</CustomButton>
      </FormStyled>
    </AuthContainer>
  );
}

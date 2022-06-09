import { yupResolver } from '@hookform/resolvers/yup';
import { Grid } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePost } from '#shared/services/useAxios';
import { IReloadModal } from '#shared/types/IModal';

import { ICustomer, limitedCustomersLength } from '#modules/customers/types/ICustomer';
import { IPortfolio, limitedPortfoliosLength } from '#modules/portfolios/types/IPortfolio';
import {
  ICreateProjectSchema,
  createProjectSchema,
  createSubProjectSchema,
} from '#modules/projects/projects/schemas/createProject.schema';
import {
  IProjectType,
  limitedProjectTypesLength,
} from '#modules/projects/projectTypes/types/IProjectType';

import { IProject, IProjectInput, limitedProjectsLength } from '../../types/IProject';

type ICreateProjectModal = IReloadModal & {
  project_id?: string;
  defaultCustomer?: { id: string; name: string } | null;
};

export function CreateProjectModal({
  openModal,
  closeModal,
  reloadList,
  project_id,
  defaultCustomer,
}: ICreateProjectModal) {
  const { toast } = useToast();

  const { send: createProject, loading: createLoading } = usePost<IProject, IProjectInput>(
    'projects',
  );

  const {
    loading: customersLoading,
    data: customersData,
    error: customersError,
    send: getCustomers,
  } = useGet<ICustomer[]>({
    url: '/customers/limited',
    lazy: true,
  });

  const {
    loading: portfoliosLoading,
    data: portfoliosData,
    error: portfoliosError,
    send: getPortfolios,
  } = useGet<IPortfolio[]>({
    url: '/portfolios/limited',
    lazy: true,
  });

  const {
    loading: projectTypesLoading,
    data: projectTypesData,
    error: projectTypesError,
    send: getProjectTypes,
  } = useGet<IProjectType[]>({
    url: '/project_types/limited',
    lazy: true,
  });

  const {
    loading: projectParentsLoading,
    data: projectParentsData,
    error: projectParentsError,
    send: getProjectParents,
  } = useGet<IProject[]>({
    url: '/projects/limited/root',
    lazy: true,
  });

  useEffect(() => {
    if (projectTypesError) {
      toast({ message: projectTypesError, severity: 'error' });

      return;
    }

    if (portfoliosError) {
      toast({ message: portfoliosError, severity: 'error' });

      return;
    }

    if (projectParentsError) {
      toast({ message: projectParentsError, severity: 'error' });

      return;
    }

    if (customersError) {
      toast({ message: customersError, severity: 'error' });
    }
  }, [projectTypesError, portfoliosError, toast, closeModal, customersError, projectParentsError]);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ICreateProjectSchema>({
    resolver: yupResolver(project_id ? createSubProjectSchema : createProjectSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const customersOptions = useMemo(() => {
    const options = !customersData ? [] : customersData;

    if (defaultCustomer) {
      const filter = options.find((customer) => customer.id === defaultCustomer.id);

      if (!filter) {
        options.push(defaultCustomer as any);
      }
    }

    return options;
  }, [defaultCustomer, customersData]);

  const onSubmit = useCallback(
    async ({ customer, portfolios, projectType, projectParent, ...rest }: ICreateProjectSchema) => {
      const portfolios_id = portfolios.map(({ id }) => id);

      const newProject = {
        ...rest,
        customer_id: customer?.id,
        project_parent_id: project_id || projectParent?.id,
        portfolios_id,
        project_type_id: projectType.id,
      };

      const { error: createErrors } = await createProject(newProject);

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'projeto criado', severity: 'success' });

      closeModal();
    },
    [closeModal, createProject, project_id, reloadList, toast],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Projeto"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormTextField
                required
                name="name"
                label="Nome"
                control={control}
                errors={errors.name}
                margin_type="no-margin"
              />
            </Grid>

            {!project_id && (
              <>
                <Grid item xs={12} md={6}>
                  <FormSelectAsync
                    required
                    control={control}
                    name="customer"
                    label="Cliente"
                    options={customersOptions}
                    optionLabel="name"
                    optionValue="id"
                    defaultValue={defaultCustomer || null}
                    margin_type="no-margin"
                    errors={errors.customer as any}
                    loading={customersLoading}
                    handleOpen={() => getCustomers()}
                    handleFilter={(params) => getCustomers(params)}
                    limitFilter={limitedCustomersLength}
                    filterField="name"
                    helperText="Preencher o projeto Pai ou o cliente"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormSelectAsync
                    control={control}
                    name="projectParent"
                    label="Projeto Pai"
                    options={projectParentsData || []}
                    optionLabel="pathString"
                    optionValue="id"
                    defaultValue={null}
                    margin_type="no-margin"
                    errors={errors.projectParent as any}
                    loading={projectParentsLoading}
                    handleOpen={() => getProjectParents()}
                    handleFilter={(params) => getProjectParents(params)}
                    limitFilter={limitedProjectsLength}
                    filterField="name"
                    helperText="Preencher o projeto Pai ou o cliente"
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <FormSelectAsync
                required
                control={control}
                name="projectType"
                label="Tipo de Projeto"
                options={projectTypesData || []}
                optionLabel="name"
                optionValue="id"
                defaultValue={null}
                margin_type="no-margin"
                errors={errors.projectType as any}
                loading={projectTypesLoading}
                handleOpen={() => getProjectTypes()}
                handleFilter={(params) => getProjectTypes(params)}
                limitFilter={limitedProjectTypesLength}
                filterField="name"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormSelectAsync
                multiple
                control={control}
                name="portfolios"
                label="Portfolios"
                options={portfoliosData || []}
                optionLabel="name"
                optionValue="id"
                defaultValue={[]}
                margin_type="no-margin"
                errors={errors.portfolios as any}
                loading={portfoliosLoading}
                handleOpen={() => getPortfolios()}
                handleFilter={(params) => getPortfolios(params)}
                limitFilter={limitedPortfoliosLength}
                filterField="name"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormDateTimePicker
                control={control}
                name="deadline"
                label="Prazo"
                errors={errors.deadline}
                defaultValue={null}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormDateTimePicker
                control={control}
                name="availableDate"
                label="Data de Disponibilidade"
                errors={errors.availableDate}
                defaultValue={null}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormDateTimePicker
                control={control}
                name="startDate"
                label="Data de Inicio"
                errors={errors.startDate}
                defaultValue={null}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormDateTimePicker
                control={control}
                name="endDate"
                label="Data de Término"
                errors={errors.endDate}
                defaultValue={null}
                margin_type="no-margin"
              />
            </Grid>
          </Grid>

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}

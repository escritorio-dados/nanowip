import { yupResolver } from '@hookform/resolvers/yup';
import { Grid } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormDatePicker } from '#shared/components/form/FormDatePicker';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePost } from '#shared/services/useAxios';
import { IReloadModal } from '#shared/types/IModal';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { ICost, ICostInput } from '#modules/costs/costs/types/ICost';
import {
  IDocumentType,
  limitedDocumentTypesLength,
} from '#modules/costs/documentTypes/types/IDocumentType';
import {
  IServiceProvider,
  limitedServiceProvidersLength,
} from '#modules/costs/serviceProviders/types/IServiceProvider';

import { costSchema, ICostSchema } from '../../schema/cost.schema';

export function CreateCostModal({ openModal, closeModal, reloadList }: IReloadModal) {
  const { toast } = useToast();

  const { send: createCost, loading: createLoading } = usePost<ICost, ICostInput>('costs');

  const {
    loading: serviceProvidersLoading,
    data: serviceProvidersData,
    error: serviceProvidersError,
    send: getServiceProviders,
  } = useGet<IServiceProvider[]>({
    url: '/service_providers/limited',
    lazy: true,
  });

  const {
    loading: documentTypesLoading,
    data: documentTypesData,
    error: documentTypesError,
    send: getDocumentTypes,
  } = useGet<IDocumentType[]>({
    url: '/document_types/limited',
    lazy: true,
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ICostSchema>({
    resolver: yupResolver(costSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (serviceProvidersError) {
      toast({ message: serviceProvidersError, severity: 'error' });

      return;
    }

    if (documentTypesError) {
      toast({ message: documentTypesError, severity: 'error' });
    }
  }, [serviceProvidersError, toast, documentTypesError]);

  const serviceProvidersOptions = useMemo(() => {
    const options = !serviceProvidersData ? [] : serviceProvidersData;

    return options;
  }, [serviceProvidersData]);

  const documentTypesOptions = useMemo(() => {
    const options = !documentTypesData ? [] : documentTypesData;

    return options;
  }, [documentTypesData]);

  const onSubmit = useCallback(
    async ({ documentType, serviceProvider, value, ...rest }: ICostSchema) => {
      const { error: createErrors } = await createCost({
        ...removeEmptyFields(rest),
        value: Number(value),
        document_type_id: documentType?.id,
        service_provider_id: serviceProvider?.id,
      });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'custo criado', severity: 'success' });

      closeModal();
    },
    [createCost, reloadList, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Cadastrar Custo" maxWidth="md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormTextField
                required
                name="reason"
                label="Motivo"
                control={control}
                errors={errors.reason}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormTextField
                required
                name="value"
                label="Valor"
                control={control}
                errors={errors.value}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormDatePicker
                control={control}
                name="issueDate"
                label="Data de Lançamento"
                errors={errors.issueDate}
                defaultValue={null}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormDatePicker
                control={control}
                name="dueDate"
                label="Data de Vencimento"
                errors={errors.dueDate}
                defaultValue={null}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormDatePicker
                control={control}
                name="paymentDate"
                label="Data de Pagamento"
                errors={errors.paymentDate}
                defaultValue={null}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormSelectAsync
                control={control}
                margin_type="no-margin"
                name="serviceProvider"
                label="Prestador do Serviço"
                options={serviceProvidersOptions}
                filterField="name"
                optionLabel="name"
                optionValue="id"
                defaultValue={null}
                errors={errors.serviceProvider as any}
                loading={serviceProvidersLoading}
                handleOpen={() => getServiceProviders()}
                handleFilter={(params) => getServiceProviders(params)}
                limitFilter={limitedServiceProvidersLength}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormSelectAsync
                control={control}
                name="documentType"
                margin_type="no-margin"
                label="Tipo de Documento"
                options={documentTypesOptions}
                filterField="name"
                optionLabel="name"
                optionValue="id"
                defaultValue={null}
                errors={errors.documentType as any}
                loading={documentTypesLoading}
                handleOpen={() => getDocumentTypes()}
                handleFilter={(params) => getDocumentTypes(params)}
                limitFilter={limitedDocumentTypesLength}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormTextField
                required
                name="documentNumber"
                label="Numero do Documento"
                control={control}
                errors={errors.documentNumber}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormTextField
                name="documentLink"
                label="Link do Documento"
                control={control}
                errors={errors.documentLink}
                margin_type="no-margin"
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextField
                multiline
                name="description"
                label="Descrição"
                control={control}
                errors={errors.description}
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

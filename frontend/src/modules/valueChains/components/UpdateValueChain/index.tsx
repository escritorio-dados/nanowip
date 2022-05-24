import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IProduct, limitedProductLength } from '#shared/types/backend/IProduct';
import { IValueChain, IValueChainInput } from '#shared/types/backend/IValueChain';

import {
  IValueChainSchema,
  valueChainSchema,
} from '#modules/valueChains/schemas/valueChain.schema';

type IUpdateValueChainModal = {
  openModal: boolean;
  closeModal(): void;
  value_chain_id: string;
  reloadList: () => void;
};

export function UpdateValueChainModal({
  closeModal,
  value_chain_id,
  openModal,
  reloadList,
}: IUpdateValueChainModal) {
  const { toast } = useToast();

  const {
    loading: valueChainLoading,
    data: valueChainData,
    error: valueChainError,
  } = useGet<IValueChain>({ url: `/value_chains/${value_chain_id}` });

  const {
    loading: productsLoading,
    data: productsData,
    error: productsError,
    send: getProducts,
  } = useGet<IProduct[]>({
    url: '/products/limited/all',
    lazy: true,
  });

  const { send: updateValueChain, loading: updateLoading } = usePut<IValueChain, IValueChainInput>(
    `/value_chains/${value_chain_id}`,
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IValueChainSchema>({
    resolver: yupResolver(valueChainSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (valueChainError) {
      toast({ message: valueChainError, severity: 'error' });

      return;
    }

    if (productsError) {
      toast({ message: productsError, severity: 'error' });
    }
  }, [closeModal, productsError, valueChainError, toast]);

  const productsOptions = useMemo(() => {
    const options = !productsData ? [] : productsData;

    if (valueChainData?.product) {
      const filter = options.find((product) => product.id === valueChainData.product!.id);

      if (!filter) {
        options.push({
          id: valueChainData.product.id,
          pathString: valueChainData.pathString,
          path: valueChainData.path,
        } as any);
      }
    }

    return options;
  }, [productsData, valueChainData]);

  const productDefault = useMemo(() => {
    if (valueChainData?.product) {
      return {
        id: valueChainData.product.id,
        pathString: valueChainData.pathString,
        path: valueChainData.path,
      };
    }

    return null;
  }, [valueChainData]);

  const onSubmit = useCallback(
    async ({ product, name }: IValueChainSchema) => {
      const { error: updateErrors } = await updateValueChain({
        product_id: product?.id,
        name,
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'cadeia de valor atualizada', severity: 'success' });

      closeModal();
    },
    [updateValueChain, reloadList, toast, closeModal],
  );

  if (valueChainLoading) return <Loading loading={valueChainLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {valueChainData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title={`Editar cadeia de valor - ${valueChainData.name}`}
          maxWidth="sm"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              required
              name="name"
              label="Nome"
              control={control}
              errors={errors.name}
              defaultValue={valueChainData.name}
              margin_type="no-margin"
            />

            <FormSelectAsync
              required
              control={control}
              name="product"
              label="Produto"
              options={productsOptions}
              optionLabel="pathString"
              optionValue="id"
              defaultValue={productDefault}
              errors={errors.product as any}
              loading={productsLoading}
              handleOpen={() => getProducts()}
              handleFilter={(params) => getProducts(params)}
              limitFilter={limitedProductLength}
              filterField="name"
              renderOption={(props, option: IProduct) => (
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
                  children={
                    <Box {...props} key={option.id} component="li">
                      <Box width="100%">
                        <TextEllipsis
                          sx={(theme) => ({
                            color: theme.palette.primary.main,
                          })}
                        >
                          {option.path.subproject?.name ? `${option.path.subproject?.name} | ` : ''}
                          {option.path.project.name}
                        </TextEllipsis>

                        <TextEllipsis>
                          {option.path.subproduct?.name ? `${option.path.subproduct?.name} | ` : ''}
                          {option.path.product.name}
                        </TextEllipsis>
                      </Box>
                    </Box>
                  }
                />
              )}
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}

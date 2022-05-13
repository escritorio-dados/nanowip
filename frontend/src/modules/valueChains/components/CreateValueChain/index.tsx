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
import { useGet, usePost } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IProduct, limitedProductLength } from '#shared/types/backend/IProduct';
import { IValueChain, IValueChainInput } from '#shared/types/backend/IValueChain';

import {
  IValueChainSchema,
  valueChainSchema,
} from '#modules/valueChains/schemas/valueChain.schema';

type ICreateValueChainModal = {
  openModal: boolean;
  closeModal(): void;
  reloadList: () => void;
  defaultProduct?: { id: string; pathString: string } | null;
};

export function CreateValueChainModal({
  openModal,
  closeModal,
  reloadList,
  defaultProduct,
}: ICreateValueChainModal) {
  const { toast } = useToast();

  const { send: createValueChain, loading: createLoading } = usePost<IValueChain, IValueChainInput>(
    'value_chains',
  );

  const {
    loading: productsLoading,
    data: productsData,
    error: productsError,
    send: getProducts,
  } = useGet<IProduct[]>({
    url: '/products/limited/all',
    lazy: true,
  });

  useEffect(() => {
    if (productsError) {
      toast({ message: productsError, severity: 'error' });
    }
  }, [toast, closeModal, productsError]);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IValueChainSchema>({
    resolver: yupResolver(valueChainSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const productsOptions = useMemo(() => {
    const options = !productsData ? [] : productsData;

    if (defaultProduct) {
      const filter = options.find((product) => product.id === defaultProduct.id);

      if (!filter) {
        options.push(defaultProduct as any);
      }
    }

    return options;
  }, [defaultProduct, productsData]);

  const onSubmit = useCallback(
    async ({ product, ...rest }: IValueChainSchema) => {
      const newValueChain = {
        ...rest,
        product_id: product?.id,
      };

      const { error: createErrors } = await createValueChain(newValueChain);

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'cadeia de valor criada', severity: 'success' });

      closeModal();
    },
    [closeModal, createValueChain, reloadList, toast],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Cadeia de valor"
        maxWidth="sm"
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

          <FormSelectAsync
            required
            control={control}
            name="product"
            label="Produto"
            options={productsOptions}
            optionLabel="pathString"
            optionValue="id"
            defaultValue={defaultProduct || null}
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
                text={
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

          <CustomButton type="submit">Cadastrar Cadeia de valor</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}

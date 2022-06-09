import { yupResolver } from '@hookform/resolvers/yup';
import { Preview } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePost } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IReloadModal } from '#shared/types/IModal';

import { IProduct, limitedProductLength } from '#modules/products/products/types/IProduct';
import { PreviewTrail } from '#modules/trails/taskTrails/components/PreviewTrail';
import {
  IInstantiateTrailInput,
  ITrail,
  limitedTrailsLength,
} from '#modules/trails/trails/types/ITrail';
import {
  IValueChainTrailSchema,
  valueChainTrailSchema,
} from '#modules/valueChains/schemas/valueChainTrail.schema';
import { IValueChain } from '#modules/valueChains/types/IValueChain';

type ICreateValueChainModal = IReloadModal & {
  defaultProduct?: { id: string; pathString: string } | null;
};

export function CreateValueChainTrailModal({
  openModal,
  closeModal,
  reloadList,
  defaultProduct,
}: ICreateValueChainModal) {
  const [viewPreview, setViewPreview] = useState(false);

  const { toast } = useToast();

  const { send: createValueChain, loading: createLoading } = usePost<
    IValueChain,
    IInstantiateTrailInput
  >('trails/instantiate');

  const {
    loading: productsLoading,
    data: productsData,
    error: productsError,
    send: getProducts,
  } = useGet<IProduct[]>({
    url: '/products/limited/all',
    lazy: true,
  });

  const {
    loading: trailsLoading,
    data: trailsData,
    error: trailsError,
    send: getTrails,
  } = useGet<ITrail[]>({
    url: '/trails/limited',
    lazy: true,
  });

  useEffect(() => {
    if (productsError) {
      toast({ message: productsError, severity: 'error' });

      return;
    }

    if (trailsError) {
      toast({ message: trailsError, severity: 'error' });
    }
  }, [toast, closeModal, productsError, trailsError]);

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<IValueChainTrailSchema>({
    resolver: yupResolver(valueChainTrailSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const trailSelected = watch('trail', undefined);

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
    async ({ product, name, trail }: IValueChainTrailSchema) => {
      const newValueChain = {
        name,
        product_id: product?.id,
        trail_id: trail?.id,
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

      {viewPreview && (
        <PreviewTrail
          openModal={viewPreview}
          closeModal={() => setViewPreview(false)}
          trail={trailSelected}
        />
      )}

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Cadeia de valor (Trilha)"
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
              >
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
              </CustomTooltip>
            )}
          />

          <Box display="flex" alignItems="center" marginTop="1rem">
            <FormSelectAsync
              control={control}
              name="trail"
              label="Trilha"
              options={trailsData || []}
              optionLabel="name"
              optionValue="id"
              defaultValue={null}
              errors={errors.trail as any}
              loading={trailsLoading}
              handleOpen={() => getTrails()}
              handleFilter={(params) => getTrails(params)}
              limitFilter={limitedTrailsLength}
              filterField="name"
              margin_type="no-margin"
            />

            {trailSelected && (
              <CustomIconButton
                action={() => setViewPreview(true)}
                title="Pré-visualizar Trilha"
                iconType="custom"
                CustomIcon={<Preview color="info" />}
                sx={{ marginLeft: '1rem' }}
              />
            )}
          </Box>

          <CustomButton type="submit">Cadastrar</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}

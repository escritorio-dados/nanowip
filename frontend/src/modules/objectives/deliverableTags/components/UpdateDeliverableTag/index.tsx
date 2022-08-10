import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormTextField } from '#shared/components/form/FormTextField';
import { CustomSelectAsync } from '#shared/components/inputs/CustomSelectAsync';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IUpdateModal } from '#shared/types/IModal';
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { mapFromArray } from '#shared/utils/mapFromArray';

import { IProduct, limitedProductLength } from '#modules/products/products/types/IProduct';
import { IValueChain, limitedValueChainLength } from '#modules/valueChains/types/IValueChain';

import { IDeliverableTagSchema, deliverableTagSchema } from '../../schemas/deliverableTag.schema';
import { IDeliverableTag, IUpdateDeliverableTagInput } from '../../types/IDeliverableTag';

type IUpdateDeliverableTagModal = Omit<IUpdateModal<IDeliverableTag>, 'updateList'> & {
  deliverable_id: string;
  reloadList: () => void;
};

type IValueChainsMap = {
  [key: string]: IValueChain;
};

export function UpdateDeliverableTagModal({
  closeModal,
  deliverable_id,
  openModal,
  reloadList,
}: IUpdateDeliverableTagModal) {
  const [product, setProduct] = useState<IProduct>(null);
  const [valueChain, setValueChain] = useState<IValueChain>(null);
  const [valueChains, setValueChains] = useState<IValueChainsMap>({});

  const { toast } = useToast();
  const { checkPermissions } = useAuth();

  const {
    loading: deliverableLoading,
    data: deliverableData,
    error: deliverableError,
  } = useGet<IDeliverableTag>({ url: `/deliverable_tags/${deliverable_id}` });

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
    loading: valueChainsLoading,
    data: valueChainsData,
    error: valueChainsError,
    send: getValueChains,
  } = useGet<IValueChain[]>({
    url: '/value_chains/limited/product',
    lazy: true,
  });

  const { send: deliverable, loading: updateLoading } = usePut<
    IDeliverableTag,
    IUpdateDeliverableTagInput
  >(`/deliverable_tags/${deliverable_id}`);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IDeliverableTagSchema>({
    resolver: yupResolver(deliverableTagSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (deliverableError) {
      toast({ message: deliverableError, severity: 'error' });

      closeModal();
    }

    if (productsError) {
      toast({ message: productsError, severity: 'error' });

      return;
    }

    if (valueChainsError) {
      toast({ message: valueChainsError, severity: 'error' });
    }
  }, [closeModal, deliverableError, productsError, toast, valueChainsError]);

  useEffect(() => {
    if (!product) {
      setValueChain(null);

      return;
    }

    getValueChains({ params: { product_id: product.id } });
  }, [getValueChains, product]);

  useEffect(() => {
    if (deliverableData && deliverableData.valueChains) {
      setValueChains(mapFromArray(deliverableData.valueChains, (vc) => vc.id));
    }
  }, [deliverableData]);

  const permissions = useMemo(() => {
    return {
      linkValueChains: checkPermissions([
        [PermissionsUser.read_product, PermissionsUser.manage_product],
        [PermissionsUser.read_value_chain, PermissionsUser.manage_value_chain],
      ]),
    };
  }, [checkPermissions]);

  const onSubmit = useCallback(
    async ({ name, goal, progress, description, deadline }: IDeliverableTagSchema) => {
      const { error: updateErrors } = await deliverable({
        name,
        description: description || undefined,
        progress: progress ? Number(progress) : undefined,
        goal: goal ? Number(goal) : undefined,
        deadline,
        value_chains_id: Object.keys(valueChains),
      });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      reloadList();

      toast({ message: 'entregável atualizado', severity: 'success' });

      closeModal();
    },
    [deliverable, valueChains, reloadList, toast, closeModal],
  );

  const addValueChain = useCallback(() => {
    if (!valueChain || !product) {
      return;
    }

    setValueChains((old) => ({
      ...old,
      [valueChain.id]: {
        ...valueChain,
        path: product.path,
      },
    }));
  }, [product, valueChain]);

  const removeValueChain = useCallback((id: string) => {
    setValueChains((old) => {
      const newData = { ...old };

      delete newData[id];

      return newData;
    });
  }, []);

  if (deliverableLoading) return <Loading loading={deliverableLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {deliverableData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Editar Entregável"
          maxWidth="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormTextField
                  required
                  name="name"
                  label="Nome"
                  control={control}
                  errors={errors.name}
                  margin_type="no-margin"
                  defaultValue={deliverableData.name}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormDateTimePicker
                  control={control}
                  name="deadline"
                  label="Prazo"
                  errors={errors.deadline}
                  margin_type="no-margin"
                  defaultValue={deliverableData.deadline}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormTextField
                  name="progress"
                  label="Progresso Atual"
                  control={control}
                  errors={errors.progress}
                  margin_type="no-margin"
                  defaultValue={deliverableData.progress}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormTextField
                  name="goal"
                  label="Progresso Alvo"
                  control={control}
                  errors={errors.goal}
                  margin_type="no-margin"
                  defaultValue={deliverableData.goal}
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
                  defaultValue={deliverableData.description}
                />
              </Grid>

              {permissions.linkValueChains && (
                <>
                  <Grid item xs={12}>
                    <Typography
                      sx={(theme) => ({
                        width: '100%',
                        textAlign: 'center',
                        background: theme.palette.secondary.main,
                        padding: '0.7rem',
                        margin: '0.7rem 0',
                      })}
                    >
                      Link com Cadeias de Valor
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <CustomSelectAsync
                      margin_type="no-margin"
                      label="Produto"
                      options={productsData || []}
                      optionLabel="pathString"
                      optionValue="id"
                      value={product}
                      onChange={(newProduct) => {
                        setValueChain(null);
                        setProduct(newProduct);
                      }}
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
                                    <Typography
                                      sx={(theme) => ({ color: theme.palette.primary.main })}
                                    >
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
                                {option.path.subproject?.name
                                  ? `${option.path.subproject?.name} | `
                                  : ''}
                                {option.path.project.name}
                              </TextEllipsis>

                              <TextEllipsis>
                                {option.path.subproduct?.name
                                  ? `${option.path.subproduct?.name} | `
                                  : ''}
                                {option.path.product.name}
                              </TextEllipsis>
                            </Box>
                          </Box>
                        </CustomTooltip>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Grid container spacing={0}>
                      <Grid item xs={10}>
                        <CustomSelectAsync
                          disabled={!product}
                          margin_type="no-margin"
                          label="Cadeia de Valor"
                          options={valueChainsData || []}
                          optionLabel="name"
                          optionValue="id"
                          value={valueChain}
                          onChange={(newValueChain) => setValueChain(newValueChain)}
                          loading={valueChainsLoading}
                          handleOpen={() => null}
                          handleFilter={(params) =>
                            getProducts({ params: { ...params, product_id: product.id } })
                          }
                          limitFilter={limitedValueChainLength}
                          filterField="name"
                        />
                      </Grid>

                      <Grid
                        item
                        xs={2}
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <CustomIconButton title="Adicionar" action={addValueChain} iconType="add" />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} sx={{ maxHeight: '400px', overflow: 'auto' }}>
                    <Grid container spacing={1}>
                      {Object.values(valueChains).map((vc) => (
                        <Grid item xs={6} sm={6} key={vc.id}>
                          <Box
                            sx={(theme) => ({
                              border: `1px solid ${theme.palette.divider}`,
                              padding: '0.5rem',
                              borderRadius: '5px',
                              display: 'flex',
                              alignItems: 'center',
                            })}
                          >
                            <CustomTooltip
                              title={
                                <Box>
                                  {Object.values(vc.path)
                                    .reverse()
                                    .map(({ id, name, entity }) => (
                                      <Box key={id} sx={{ display: 'flex' }}>
                                        <Typography
                                          sx={(theme) => ({ color: theme.palette.primary.main })}
                                        >
                                          {entity}:
                                        </Typography>

                                        <Typography sx={{ marginLeft: '0.5rem' }}>
                                          {name}
                                        </Typography>
                                      </Box>
                                    ))}
                                </Box>
                              }
                            >
                              <Box flex={1} maxWidth="90%">
                                <TextEllipsis
                                  sx={(theme) => ({
                                    color: theme.palette.primary.main,
                                  })}
                                  fontSize="0.875rem"
                                >
                                  {vc.path.subproduct?.name ? `${vc.path.subproduct?.name} | ` : ''}
                                  {vc.path.product.name}
                                </TextEllipsis>

                                <TextEllipsis fontSize="0.875rem">{vc.name}</TextEllipsis>
                              </Box>
                            </CustomTooltip>

                            <CustomIconButton
                              sx={{ marginLeft: 'auto' }}
                              title="Remover"
                              action={() => removeValueChain(vc.id)}
                              iconType="delete"
                              size="small"
                              iconSize="small"
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </>
              )}
            </Grid>

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}

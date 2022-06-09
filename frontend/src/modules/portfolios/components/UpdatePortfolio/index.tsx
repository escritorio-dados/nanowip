import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IUpdateModal } from '#shared/types/IModal';

import { IPortfolioSchema, portfolioSchema } from '#modules/portfolios/schema/portfolio.schema';
import { IPortfolio, IPortfolioInput } from '#modules/portfolios/types/IPortfolio';

type IUpdatePortfolioModal = IUpdateModal<IPortfolio> & { portfolio_id: string };

export function UpdatePortfolioModal({
  closeModal,
  openModal,
  portfolio_id,
  updateList,
}: IUpdatePortfolioModal) {
  const { toast } = useToast();

  const {
    loading: portfolioLoading,
    data: portfolioData,
    error: portfolioError,
  } = useGet<IPortfolio>({ url: `/portfolios/${portfolio_id}` });

  const { send: updatePortfolio, loading: updateLoading } = usePut<IPortfolio, IPortfolioInput>(
    `/portfolios/${portfolio_id}`,
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IPortfolioSchema>({
    resolver: yupResolver(portfolioSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (portfolioError) {
      toast({ message: portfolioError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, portfolioError, toast]);

  const onSubmit = useCallback(
    async ({ name }: IPortfolioSchema) => {
      const { error: updateErrors, data } = await updatePortfolio({ name });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(portfolio_id, data as IPortfolio);

      toast({ message: 'portfólio atualizado', severity: 'success' });

      closeModal();
    },
    [updatePortfolio, updateList, portfolio_id, toast, closeModal],
  );

  if (portfolioLoading) return <Loading loading={portfolioLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {portfolioData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Editar portfólio"
          maxWidth="xs"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              name="name"
              label="Nome"
              defaultValue={portfolioData.name}
              control={control}
              errors={errors.name}
              margin_type="no-margin"
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}

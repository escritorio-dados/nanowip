import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePost } from '#shared/services/useAxios';
import { IPortfolio, IPortfolioInput } from '#shared/types/backend/IPortfolio';

import { IPortfolioSchema, portfolioSchema } from '#modules/portfolios/schema/portfolio.schema';

type ICreatePortfolioModal = {
  openModal: boolean;
  closeModal: () => void;
  handleAdd(data: IPortfolio): void;
};

export function CreatePortfolioModal({ openModal, closeModal, handleAdd }: ICreatePortfolioModal) {
  const { toast } = useToast();

  const { send: createPortfolio, loading: createLoading } = usePost<IPortfolio, IPortfolioInput>(
    'portfolios',
  );

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<IPortfolioSchema>({
    resolver: yupResolver(portfolioSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ name }: IPortfolioSchema) => {
      const { error: createErrors, data } = await createPortfolio({ name });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      handleAdd(data as IPortfolio);

      toast({ message: 'portfolio criado', severity: 'success' });

      closeModal();
    },
    [createPortfolio, handleAdd, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Portifólio"
        maxWidth="xs"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            name="name"
            label="Nome"
            control={control}
            errors={errors.name}
            margin_type="no-margin"
          />

          <CustomButton type="submit">Cadastrar Portfolio</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}

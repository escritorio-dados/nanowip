import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { TagsInfo } from '#shared/components/info/TagsInfo';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IPortfolio } from '#modules/portfolios/types/IPortfolio';

type IInfoPortfolioModal = IBaseModal & { portfolio_id: string };

export function InfoPortfolioModal({ closeModal, portfolio_id, openModal }: IInfoPortfolioModal) {
  const { toast } = useToast();

  const {
    loading: portfolioLoading,
    data: portfolioData,
    error: portfolioError,
  } = useGet<IPortfolio>({ url: `/portfolios/${portfolio_id}` });

  useEffect(() => {
    if (portfolioError) {
      toast({ message: portfolioError, severity: 'error' });

      closeModal();
    }
  }, [portfolioError, toast, closeModal]);

  const portfolioInfo = useMemo(() => {
    if (!portfolioData) {
      return null;
    }

    return {
      ...portfolioData,
      created_at: parseDateApi(portfolioData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(portfolioData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [portfolioData]);

  if (portfolioLoading) return <Loading loading={portfolioLoading} />;

  return (
    <>
      {portfolioInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Portfolio"
          maxWidth="sm"
        >
          <LabelValue label="Nome:" value={portfolioInfo.name} />

          <TagsInfo
            label="Projetos:"
            tagsData={portfolioInfo.projects}
            getId={(data) => data.id}
            getValue={(data) => data.name}
          />

          <LabelValue label="Criado em:" value={portfolioInfo.created_at} />

          <LabelValue label="Atualizado em:" value={portfolioInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}

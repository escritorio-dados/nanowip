import { useEffect, useMemo } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { ILink } from '#modules/links/types/ILink';

type IInfoLinkModal = IBaseModal & { link_id: string };

export function InfoLinkModal({ closeModal, link_id, openModal }: IInfoLinkModal) {
  const { toast } = useToast();

  const {
    loading: linkLoading,
    data: linkData,
    error: linkError,
  } = useGet<ILink>({ url: `/links/${link_id}` });

  useEffect(() => {
    if (linkError) {
      toast({ message: linkError, severity: 'error' });

      closeModal();
    }
  }, [linkError, toast, closeModal]);

  const linkInfo = useMemo(() => {
    if (!linkData) {
      return null;
    }

    return {
      ...linkData,
      state: linkData.active ? 'Ativo' : 'Desativado',
      created_at: parseDateApi(linkData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(linkData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
    };
  }, [linkData]);

  if (linkLoading) return <Loading loading={linkLoading} />;

  return (
    <>
      {linkInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Link"
          maxWidth="sm"
        >
          <LabelValue label="Titulo:" value={linkInfo.title} />

          <LabelValue
            label="Link:"
            value={
              <CustomButton
                size="small"
                color="info"
                margin_type="no-margin"
                onClick={() => window.open(linkInfo.url)}
                fullWidth={false}
              >
                Acessar
              </CustomButton>
            }
          />

          <LabelValue label="Categoria:" value={linkInfo.category} />

          <LabelValue label="Responsavel:" value={linkInfo.owner} />

          <LabelValue label="Descrição:" value={linkInfo.description} />

          <LabelValue label="Criado em:" value={linkInfo.created_at} />

          <LabelValue label="Atualizado em:" value={linkInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}

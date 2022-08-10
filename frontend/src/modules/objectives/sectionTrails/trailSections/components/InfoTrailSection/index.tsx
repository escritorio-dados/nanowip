import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { TagsInfo } from '#shared/components/info/TagsInfo';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { ITrailSection } from '../../types/ITrailSection';

type IInfoTrailSectionModal = IBaseModal & { trail_section_id: string };

export function InfoTrailSectionModal({
  closeModal,
  trail_section_id,
  openModal,
}: IInfoTrailSectionModal) {
  const { toast } = useToast();

  const {
    loading: trailSectionLoading,
    data: trailSectionData,
    error: trailSectionError,
  } = useGet<ITrailSection>({ url: `/trail_sections/${trail_section_id}` });

  useEffect(() => {
    if (trailSectionError) {
      toast({ message: trailSectionError, severity: 'error' });

      closeModal();
    }
  }, [trailSectionError, toast, closeModal]);

  const trailSectionInfo = useMemo(() => {
    if (!trailSectionData) {
      return null;
    }

    return {
      ...trailSectionData,
      created_at: parseDateApi(trailSectionData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(trailSectionData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
      tags: trailSectionData.tagsGroup
        ? trailSectionData.tagsGroup.tags.map((tag) => tag.name)
        : [],
    };
  }, [trailSectionData]);

  if (trailSectionLoading) return <Loading loading={trailSectionLoading} />;

  return (
    <>
      {trailSectionInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações da Seção"
          maxWidth="sm"
        >
          <LabelValue label="Nome:" value={trailSectionInfo.name} />

          <LabelValue label="Trilha:" value={trailSectionInfo.sectionTrail.name} />

          <TagsInfo
            label="Tags:"
            tagsData={trailSectionInfo.tags}
            getId={(data) => data}
            getValue={(data) => data}
          />

          <LabelValue label="Criado em:" value={trailSectionInfo.created_at} />

          <LabelValue label="Atualizado em:" value={trailSectionInfo.updated_at} />
        </CustomDialog>
      )}
    </>
  );
}

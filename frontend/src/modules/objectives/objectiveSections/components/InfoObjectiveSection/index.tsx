import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { TagsInfo } from '#shared/components/info/TagsInfo';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IObjectiveSection } from '../../types/IObjectiveSection';

type IInfoObjectiveSectionModal = {
  openModal: boolean;
  closeModal: () => void;
  section_id: string;
};

export function InfoObjectiveSectionModal({
  closeModal,
  section_id,
  openModal,
}: IInfoObjectiveSectionModal) {
  const { toast } = useToast();

  const {
    loading: sectionLoading,
    data: sectionData,
    error: sectionError,
  } = useGet<IObjectiveSection>({ url: `/objective_sections/${section_id}` });

  useEffect(() => {
    if (sectionError) {
      toast({ message: sectionError, severity: 'error' });

      closeModal();
    }
  }, [sectionError, toast, closeModal]);

  const sectionInfo = useMemo(() => {
    if (!sectionData) {
      return null;
    }

    return {
      ...sectionData,
      created_at: parseDateApi(sectionData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(sectionData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
      tags: sectionData.tagsGroup ? sectionData.tagsGroup.tags.map((tag) => tag.name) : [],
    };
  }, [sectionData]);

  if (sectionLoading) return <Loading loading={sectionLoading} />;

  return (
    <>
      {sectionInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações da Seção"
          maxWidth="sm"
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <LabelValue label="Nome:" value={sectionInfo.name} />
            </Grid>

            <Grid item xs={12}>
              <TagsInfo
                label="Tags:"
                tagsData={sectionInfo.tags}
                getId={(data) => data}
                getValue={(data) => data}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Criado em:" value={sectionInfo.created_at} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Atualizado em:" value={sectionInfo.updated_at} />
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}

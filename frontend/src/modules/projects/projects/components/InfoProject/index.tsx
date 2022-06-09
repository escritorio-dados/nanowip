import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { LabelValue } from '#shared/components/info/LabelValue';
import { TagsInfo } from '#shared/components/info/TagsInfo';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IBaseModal } from '#shared/types/IModal';
import { getStatusText } from '#shared/utils/getStatusText';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { IProject } from '../../types/IProject';

type IInfoProjectModal = IBaseModal & { project_id: string };

export function InfoProjectModal({ closeModal, project_id, openModal }: IInfoProjectModal) {
  const { toast } = useToast();

  const {
    loading: projectLoading,
    data: projectData,
    error: projectError,
  } = useGet<IProject>({ url: `/projects/${project_id}` });

  useEffect(() => {
    if (projectError) {
      toast({ message: projectError, severity: 'error' });

      closeModal();
    }
  }, [projectError, toast, closeModal]);

  const projectInfo = useMemo(() => {
    if (!projectData) {
      return null;
    }

    return {
      ...projectData,
      startDate: parseDateApi(projectData.startDate, 'dd/MM/yyyy (HH:mm)', '-'),
      deadline: parseDateApi(projectData.deadline, 'dd/MM/yyyy (HH:mm)', '-'),
      availableDate: parseDateApi(projectData.availableDate, 'dd/MM/yyyy (HH:mm)', '-'),
      endDate: parseDateApi(projectData.endDate, 'dd/MM/yyyy (HH:mm)', '-'),
      created_at: parseDateApi(projectData.created_at, 'dd/MM/yyyy (HH:mm)', '-'),
      updated_at: parseDateApi(projectData.updated_at, 'dd/MM/yyyy (HH:mm)', '-'),
      status: getStatusText(projectData.statusDate),
      projectType: projectData.projectType.name,
      portfolios: projectData.portfolios.length > 0 ? projectData.portfolios : undefined,
    };
  }, [projectData]);

  if (projectLoading) return <Loading loading={projectLoading} />;

  return (
    <>
      {projectInfo && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Informações do Projeto"
          maxWidth="md"
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <LabelValue label="Nome:" value={projectInfo.name} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Local:" value={projectInfo.pathString} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Tipo de Projeto:" value={projectInfo.projectType} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Status:" value={projectInfo.status} />
            </Grid>

            {projectInfo.portfolios && (
              <Grid item xs={12}>
                <TagsInfo
                  label="Portfolios:"
                  tagsData={projectInfo.portfolios}
                  getId={(data) => data.id}
                  getValue={(data) => data.name}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <LabelValue label="Prazo:" value={projectInfo.deadline} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Disponivel em:" value={projectInfo.availableDate} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Iniciado em:" value={projectInfo.startDate} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Finalizado em:" value={projectInfo.endDate} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Criado em:" value={projectInfo.created_at} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LabelValue label="Atualizado em:" value={projectInfo.updated_at} />
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}

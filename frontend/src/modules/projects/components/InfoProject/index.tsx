import { Grid, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IProject } from '#shared/types/backend/IProject';
import { getStatusText } from '#shared/utils/getStatusText';
import { parseDateApi } from '#shared/utils/parseDateApi';

import { FieldContainer, FieldValueContainer, TagsContainer } from './styles';

type IInfoProjectModal = { openModal: boolean; closeModal: () => void; project_id: string };

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
              <FieldValueContainer>
                <Typography component="strong">Nome: </Typography>

                <Typography>{projectInfo.name}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Local: </Typography>

                <Typography>{projectInfo.pathString}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Tipo de Projeto: </Typography>

                <Typography>{projectInfo.projectType}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Status: </Typography>

                <Typography>{projectInfo.status}</Typography>
              </FieldValueContainer>
            </Grid>

            {projectInfo.portfolios && (
              <Grid item xs={12}>
                <FieldContainer>
                  <Typography component="strong">Portfolios: </Typography>

                  <TagsContainer>
                    {projectInfo.portfolios.map((portfolio) => (
                      <Typography component="span" key={portfolio.id}>
                        {portfolio.name}
                      </Typography>
                    ))}
                  </TagsContainer>
                </FieldContainer>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Prazo: </Typography>

                <Typography>{projectInfo.deadline}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Disponivel em: </Typography>

                <Typography>{projectInfo.availableDate}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Iniciado em </Typography>

                <Typography>{projectInfo.startDate}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Finalizado em: </Typography>

                <Typography>{projectInfo.endDate}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Criado em: </Typography>

                <Typography>{projectInfo.created_at}</Typography>
              </FieldValueContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FieldValueContainer>
                <Typography component="strong">Atualizado em: </Typography>

                <Typography>{projectInfo.updated_at}</Typography>
              </FieldValueContainer>
            </Grid>
          </Grid>
        </CustomDialog>
      )}
    </>
  );
}

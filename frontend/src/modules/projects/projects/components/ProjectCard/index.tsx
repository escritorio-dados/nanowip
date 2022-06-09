import { ExpandLess, ExpandMore, ListAlt } from '@mui/icons-material';
import { Box, Grid, Typography } from '@mui/material';
import { useState } from 'react';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { LabelValue } from '#shared/components/info/LabelValue';

import { ISubprojectCardInfo, SubprojectCard } from '../SubprojectCard';
import { ProjectCardContainer, SubProjectsContainer, CardActions } from './styles';

export type IProjectCardInfo = {
  id: string;
  name: string;
  customer: string;
  statusColor: string;
  status: string;
  lateColor?: string;
  subprojects: ISubprojectCardInfo[];
  pathString: string;
};

type permissionsFields = 'createProject' | 'updateProject' | 'deleteProject' | 'readProduct';

type IProjectCard = {
  project: IProjectCardInfo;
  permissions: { [key in permissionsFields]: boolean };
  setCreateSub: (id: string) => void;
  setInfo: (id: string) => void;
  setUpdate: (id: string) => void;
  setDelete: (id: string, name: string) => void;
  navigateProducts: (id: string, pathString: string) => void;
};

export function ProjectCard({
  project,
  permissions,
  setInfo,
  setUpdate,
  setDelete,
  setCreateSub,
  navigateProducts,
}: IProjectCard) {
  const [showSubs, setShowSubs] = useState(true);

  return (
    <>
      <ProjectCardContainer>
        <CustomTooltip title={project.status}>
          <Box className="status">
            {project.lateColor && <Box className="late" sx={{ background: project.lateColor }} />}

            <Box sx={{ background: project.statusColor }} />
          </Box>
        </CustomTooltip>

        <Grid container spacing={0} justifyContent="flex-start" alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography>{project.name}</Typography>
          </Grid>

          <Grid item md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <LabelValue fontSize="0.9rem" label="Cliente:" value={project.customer} />
          </Grid>
        </Grid>

        <CardActions>
          {permissions.createProject && (
            <CustomIconButton
              iconType="add"
              iconSize="small"
              title="Criar Subprojeto"
              action={() => setCreateSub(project.id)}
            />
          )}

          {permissions.readProduct && (
            <CustomIconButton
              iconType="custom"
              iconSize="small"
              title="Ir para produtos"
              CustomIcon={<ListAlt fontSize="small" />}
              action={() => navigateProducts(project.id, project.pathString)}
            />
          )}

          <CustomIconButton
            iconType="info"
            iconSize="small"
            title="Informações"
            action={() => setInfo(project.id)}
          />

          {permissions.updateProject && (
            <CustomIconButton
              iconType="edit"
              iconSize="small"
              title="Editar Projeto"
              action={() => setUpdate(project.id)}
            />
          )}

          {permissions.deleteProject && (
            <CustomIconButton
              iconType="delete"
              iconSize="small"
              title="Deletar Projeto"
              action={() => setDelete(project.id, project.name)}
            />
          )}
        </CardActions>

        <Box className="expand">
          <CustomIconButton
            action={() => setShowSubs((old) => !old)}
            title={showSubs ? 'Esconder subprojetos' : 'Mostrar subprojectos'}
            iconType="custom"
            CustomIcon={
              showSubs ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />
            }
          />
        </Box>
      </ProjectCardContainer>

      <SubProjectsContainer in={showSubs}>
        {project.subprojects.map((subproject) => (
          <SubprojectCard
            key={subproject.id}
            subproject={subproject}
            permissions={permissions}
            setInfo={(id) => setInfo(id)}
            setUpdate={(id) => setUpdate(id)}
            setDelete={(id, name) => setDelete(id, name)}
            navigateProducts={navigateProducts}
          />
        ))}
      </SubProjectsContainer>
    </>
  );
}

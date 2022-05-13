import { ExpandLess, ExpandMore, ListAlt } from '@mui/icons-material';
import { Grid, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';

import { CustomIconButton } from '#shared/components/CustomIconButton';

import { ISubprojectCardInfo, SubprojectCard } from '../SubprojectCard';
import {
  ProjectCardContainer,
  SubProjectsContainer,
  Container,
  CardActions,
  FieldValueContainer,
} from './styles';

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
    <Container>
      <ProjectCardContainer>
        <Tooltip title={project.status}>
          <div className="status">
            {project.lateColor && (
              <div className="late" style={{ background: project.lateColor }} />
            )}

            <div style={{ background: project.statusColor }} />
          </div>
        </Tooltip>

        <Grid container spacing={0} justifyContent="flex-start" alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography>{project.name}</Typography>
          </Grid>

          <Grid item md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <FieldValueContainer>
              <strong>Cliente:</strong>
              <span>{project.customer}</span>
            </FieldValueContainer>
          </Grid>
        </Grid>

        <CardActions>
          {permissions.createProject && (
            <CustomIconButton
              type="add"
              size="small"
              title="Criar Subprojeto"
              action={() => setCreateSub(project.id)}
            />
          )}

          {permissions.readProduct && (
            <CustomIconButton
              type="custom"
              size="small"
              title="Ir para produtos"
              CustomIcon={<ListAlt fontSize="small" />}
              action={() => navigateProducts(project.id, project.pathString)}
            />
          )}

          <CustomIconButton
            type="info"
            size="small"
            title="Informações"
            action={() => setInfo(project.id)}
          />

          {permissions.updateProject && (
            <CustomIconButton
              type="edit"
              size="small"
              title="Editar Projeto"
              action={() => setUpdate(project.id)}
            />
          )}

          {permissions.deleteProject && (
            <CustomIconButton
              type="delete"
              size="small"
              title="Deletar Projeto"
              action={() => setDelete(project.id, project.name)}
            />
          )}
        </CardActions>

        <div className="expand">
          <CustomIconButton
            action={() => setShowSubs((old) => !old)}
            title={showSubs ? 'Esconder subprojetos' : 'Mostrar subprojectos'}
            type="custom"
            CustomIcon={
              showSubs ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />
            }
          />
        </div>
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
    </Container>
  );
}

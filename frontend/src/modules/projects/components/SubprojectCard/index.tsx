import { ListAlt } from '@mui/icons-material';
import { Grid, Tooltip, Typography } from '@mui/material';

import { CustomIconButton } from '#shared/components/CustomIconButton';

import { SubProjectContainer, CardActions } from './styles';

export type ISubprojectCardInfo = {
  id: string;
  name: string;
  statusColor: string;
  status: string;
  lateColor?: string;
  pathString: string;
};

type permissionsFields = 'updateProject' | 'deleteProject' | 'readProduct';

type ISubprojectCard = {
  subproject: ISubprojectCardInfo;
  permissions: { [key in permissionsFields]: boolean };
  setInfo: (id: string) => void;
  setUpdate: (id: string) => void;
  setDelete: (id: string, name: string) => void;
  navigateProducts: (id: string, pathString: string) => void;
};

export function SubprojectCard({
  subproject,
  permissions,
  setInfo,
  setUpdate,
  setDelete,
  navigateProducts,
}: ISubprojectCard) {
  return (
    <SubProjectContainer>
      <Tooltip title={subproject.status}>
        <div className="status">
          {subproject.lateColor && (
            <div className="late" style={{ background: subproject.lateColor }} />
          )}

          <div style={{ background: subproject.statusColor }} />
        </div>
      </Tooltip>

      <Grid container spacing={0} alignItems="center">
        <Grid item xs={12}>
          <Typography>{subproject.name}</Typography>
        </Grid>
      </Grid>

      <CardActions>
        {permissions.readProduct && (
          <CustomIconButton
            type="custom"
            size="small"
            title="Ir para produtos"
            CustomIcon={<ListAlt fontSize="small" />}
            action={() => navigateProducts(subproject.id, subproject.pathString)}
          />
        )}

        <CustomIconButton
          type="info"
          size="small"
          title="Informações"
          action={() => setInfo(subproject.id)}
        />

        {permissions.updateProject && (
          <CustomIconButton
            type="edit"
            size="small"
            title="Editar Projeto"
            action={() => setUpdate(subproject.id)}
          />
        )}

        {permissions.deleteProject && (
          <CustomIconButton
            type="delete"
            size="small"
            title="Deletar Projeto"
            action={() => setDelete(subproject.id, subproject.name)}
          />
        )}
      </CardActions>
    </SubProjectContainer>
  );
}

import { ListAlt } from '@mui/icons-material';
import { Box, Grid, Typography } from '@mui/material';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';

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
      <CustomTooltip title={subproject.status}>
        <Box className="status">
          {subproject.lateColor && (
            <Box className="late" sx={{ background: subproject.lateColor }} />
          )}

          <Box sx={{ background: subproject.statusColor }} />
        </Box>
      </CustomTooltip>

      <Grid container spacing={0} alignItems="center">
        <Grid item xs={12}>
          <Typography>{subproject.name}</Typography>
        </Grid>
      </Grid>

      <CardActions>
        {permissions.readProduct && (
          <CustomIconButton
            iconType="custom"
            iconSize="small"
            title="Ir para produtos"
            CustomIcon={<ListAlt fontSize="small" />}
            action={() => navigateProducts(subproject.id, subproject.pathString)}
          />
        )}

        <CustomIconButton
          iconType="info"
          iconSize="small"
          title="Informações"
          action={() => setInfo(subproject.id)}
        />

        {permissions.updateProject && (
          <CustomIconButton
            iconType="edit"
            iconSize="small"
            title="Editar Projeto"
            action={() => setUpdate(subproject.id)}
          />
        )}

        {permissions.deleteProject && (
          <CustomIconButton
            iconType="delete"
            iconSize="small"
            title="Deletar Projeto"
            action={() => setDelete(subproject.id, subproject.name)}
          />
        )}
      </CardActions>
    </SubProjectContainer>
  );
}

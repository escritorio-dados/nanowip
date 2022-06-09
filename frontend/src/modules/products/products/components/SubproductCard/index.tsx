import { ListAlt } from '@mui/icons-material';
import { Box, Grid, Typography } from '@mui/material';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';

import { SubProductContainer, CardActions } from './styles';

export type ISubproductCardInfo = {
  id: string;
  name: string;
  statusColor: string;
  status: string;
  lateColor?: string;
  pathString: string;
};

type permissionsFields = 'updateProduct' | 'deleteProduct' | 'readValueChain';

type ISubproductCard = {
  subproduct: ISubproductCardInfo;
  permissions: { [key in permissionsFields]: boolean };
  setInfo: (id: string) => void;
  setUpdate: (id: string) => void;
  setDelete: (id: string, name: string) => void;
  navigateValueChains: (id: string, pathString: string) => void;
};

export function SubproductCard({
  subproduct,
  permissions,
  setInfo,
  setUpdate,
  setDelete,
  navigateValueChains,
}: ISubproductCard) {
  return (
    <SubProductContainer>
      <CustomTooltip title={subproduct.status}>
        <Box className="status">
          {subproduct.lateColor && (
            <Box className="late" sx={{ background: subproduct.lateColor }} />
          )}

          <Box sx={{ background: subproduct.statusColor }} />
        </Box>
      </CustomTooltip>

      <Grid container spacing={0} alignItems="center">
        <Grid item xs={12}>
          <Typography>{subproduct.name}</Typography>
        </Grid>
      </Grid>

      <CardActions>
        {permissions.readValueChain && (
          <CustomIconButton
            iconType="custom"
            iconSize="small"
            title="Ir para cadeias de valor"
            CustomIcon={<ListAlt fontSize="small" />}
            action={() => navigateValueChains(subproduct.id, subproduct.pathString)}
          />
        )}

        <CustomIconButton
          iconType="info"
          iconSize="small"
          title="Informações"
          action={() => setInfo(subproduct.id)}
        />

        {permissions.updateProduct && (
          <CustomIconButton
            iconType="edit"
            iconSize="small"
            title="Editar Produto"
            action={() => setUpdate(subproduct.id)}
          />
        )}

        {permissions.deleteProduct && (
          <CustomIconButton
            iconType="delete"
            iconSize="small"
            title="Deletar Produto"
            action={() => setDelete(subproduct.id, subproduct.name)}
          />
        )}
      </CardActions>
    </SubProductContainer>
  );
}

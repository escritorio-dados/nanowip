import { ListAlt } from '@mui/icons-material';
import { Grid, Tooltip, Typography } from '@mui/material';

import { CustomIconButton } from '#shared/components/CustomIconButton';

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
      <Tooltip title={subproduct.status}>
        <div className="status">
          {subproduct.lateColor && (
            <div className="late" style={{ background: subproduct.lateColor }} />
          )}

          <div style={{ background: subproduct.statusColor }} />
        </div>
      </Tooltip>

      <Grid container spacing={0} alignItems="center">
        <Grid item xs={12}>
          <Typography>{subproduct.name}</Typography>
        </Grid>
      </Grid>

      <CardActions>
        {permissions.readValueChain && (
          <CustomIconButton
            type="custom"
            size="small"
            title="Ir para cadeias de valor"
            CustomIcon={<ListAlt fontSize="small" />}
            action={() => navigateValueChains(subproduct.id, subproduct.pathString)}
          />
        )}

        <CustomIconButton
          type="info"
          size="small"
          title="Informações"
          action={() => setInfo(subproduct.id)}
        />

        {permissions.updateProduct && (
          <CustomIconButton
            type="edit"
            size="small"
            title="Editar Produto"
            action={() => setUpdate(subproduct.id)}
          />
        )}

        {permissions.deleteProduct && (
          <CustomIconButton
            type="delete"
            size="small"
            title="Deletar Produto"
            action={() => setDelete(subproduct.id, subproduct.name)}
          />
        )}
      </CardActions>
    </SubProductContainer>
  );
}

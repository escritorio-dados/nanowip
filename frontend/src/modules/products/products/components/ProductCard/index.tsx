import { ExpandLess, ExpandMore, ListAlt } from '@mui/icons-material';
import { Box, Grid, Typography } from '@mui/material';
import { useState } from 'react';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { LabelValue } from '#shared/components/info/LabelValue';

import { ISubproductCardInfo, SubproductCard } from '../SubproductCard';
import { ProductCardContainer, SubProductsContainer, CardActions } from './styles';

export type IProductCardInfo = {
  id: string;
  name: string;
  path: string;
  pathString: string;
  statusColor: string;
  status: string;
  lateColor?: string;
  subproducts: ISubproductCardInfo[];
};

type permissionsFields = 'createProduct' | 'updateProduct' | 'deleteProduct' | 'readValueChain';

type IProductCard = {
  product: IProductCardInfo;
  permissions: { [key in permissionsFields]: boolean };
  setCreateSub: (id: string) => void;
  setInfo: (id: string) => void;
  setUpdate: (id: string) => void;
  setDelete: (id: string, name: string) => void;
  navigateValueChains: (id: string, pathString: string) => void;
};

export function ProductCard({
  product,
  permissions,
  setInfo,
  setUpdate,
  setDelete,
  setCreateSub,
  navigateValueChains,
}: IProductCard) {
  const [showSubs, setShowSubs] = useState(true);

  return (
    <>
      <ProductCardContainer>
        <CustomTooltip title={product.status}>
          <Box className="status">
            {product.lateColor && <Box className="late" sx={{ background: product.lateColor }} />}

            <Box sx={{ background: product.statusColor }} />
          </Box>
        </CustomTooltip>

        <Grid container spacing={0} justifyContent="flex-start" alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography>{product.name}</Typography>
          </Grid>

          <Grid item md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <LabelValue fontSize="0.9rem" label="Local:" value={product.path} />
          </Grid>
        </Grid>

        <CardActions>
          {permissions.createProduct && (
            <CustomIconButton
              iconType="add"
              iconSize="small"
              title="Criar Subproduto"
              action={() => setCreateSub(product.id)}
            />
          )}

          {permissions.readValueChain && (
            <CustomIconButton
              iconType="custom"
              iconSize="small"
              title="Ir para cadeias de valor"
              CustomIcon={<ListAlt fontSize="small" />}
              action={() => navigateValueChains(product.id, product.pathString)}
            />
          )}

          <CustomIconButton
            iconType="info"
            iconSize="small"
            title="Informações"
            action={() => setInfo(product.id)}
          />

          {permissions.updateProduct && (
            <CustomIconButton
              iconType="edit"
              iconSize="small"
              title="Editar Produto"
              action={() => setUpdate(product.id)}
            />
          )}

          {permissions.deleteProduct && (
            <CustomIconButton
              iconType="delete"
              iconSize="small"
              title="Deletar Produto"
              action={() => setDelete(product.id, product.name)}
            />
          )}
        </CardActions>

        <Box className="expand">
          <CustomIconButton
            action={() => setShowSubs((old) => !old)}
            title={showSubs ? 'Esconder subprodutos' : 'Mostrar subprodutos'}
            iconType="custom"
            CustomIcon={
              showSubs ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />
            }
          />
        </Box>
      </ProductCardContainer>

      <SubProductsContainer in={showSubs}>
        {product.subproducts.map((subproduct) => (
          <SubproductCard
            key={subproduct.id}
            subproduct={subproduct}
            permissions={permissions}
            setInfo={(id) => setInfo(id)}
            setUpdate={(id) => setUpdate(id)}
            setDelete={(id, name) => setDelete(id, name)}
            navigateValueChains={navigateValueChains}
          />
        ))}
      </SubProductsContainer>
    </>
  );
}

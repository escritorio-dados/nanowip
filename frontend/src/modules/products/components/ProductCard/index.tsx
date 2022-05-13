import { ExpandLess, ExpandMore, ListAlt } from '@mui/icons-material';
import { Grid, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';

import { CustomIconButton } from '#shared/components/CustomIconButton';

import { ISubproductCardInfo, SubproductCard } from '../SubproductCard';
import {
  ProductCardContainer,
  SubProductsContainer,
  Container,
  CardActions,
  FieldValueContainer,
} from './styles';

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
    <Container>
      <ProductCardContainer>
        <Tooltip title={product.status}>
          <div className="status">
            {product.lateColor && (
              <div className="late" style={{ background: product.lateColor }} />
            )}

            <div style={{ background: product.statusColor }} />
          </div>
        </Tooltip>

        <Grid container spacing={0} justifyContent="flex-start" alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography>{product.name}</Typography>
          </Grid>

          <Grid item md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <FieldValueContainer>
              <strong>Local:</strong>
              <span>{product.path}</span>
            </FieldValueContainer>
          </Grid>
        </Grid>

        <CardActions>
          {permissions.createProduct && (
            <CustomIconButton
              type="add"
              size="small"
              title="Criar Subproduto"
              action={() => setCreateSub(product.id)}
            />
          )}

          {permissions.readValueChain && (
            <CustomIconButton
              type="custom"
              size="small"
              title="Ir para cadeias de valor"
              CustomIcon={<ListAlt fontSize="small" />}
              action={() => navigateValueChains(product.id, product.pathString)}
            />
          )}

          <CustomIconButton
            type="info"
            size="small"
            title="Informações"
            action={() => setInfo(product.id)}
          />

          {permissions.updateProduct && (
            <CustomIconButton
              type="edit"
              size="small"
              title="Editar Produto"
              action={() => setUpdate(product.id)}
            />
          )}

          {permissions.deleteProduct && (
            <CustomIconButton
              type="delete"
              size="small"
              title="Deletar Produto"
              action={() => setDelete(product.id, product.name)}
            />
          )}
        </CardActions>

        <div className="expand">
          <CustomIconButton
            action={() => setShowSubs((old) => !old)}
            title={showSubs ? 'Esconder subprodutos' : 'Mostrar subprodutos'}
            type="custom"
            CustomIcon={
              showSubs ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />
            }
          />
        </div>
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
    </Container>
  );
}

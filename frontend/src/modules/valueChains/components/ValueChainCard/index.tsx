import { ListAlt } from '@mui/icons-material';
import { Box, Grid, Tooltip, Typography } from '@mui/material';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IPathObject } from '#shared/types/backend/shared/ICommonApi';

import { ValueChainCardContainer, Container, CardActions } from './styles';

export type IValueChainCardInfo = {
  id: string;
  name: string;
  pathString: string;
  path: IPathObject;
  statusColor: string;
  status: string;
};

type permissionsFields = 'createValueChain' | 'updateValueChain' | 'deleteValueChain' | 'readTasks';

type IValueChainCard = {
  valueChain: IValueChainCardInfo;
  permissions: { [key in permissionsFields]: boolean };
  setInfo: (id: string) => void;
  setUpdate: (id: string) => void;
  setDelete: (id: string, name: string) => void;
  handleNavigationTasks: (id: string) => void;
};

export function ValueChainCard({
  valueChain,
  permissions,
  setInfo,
  setUpdate,
  setDelete,
  handleNavigationTasks,
}: IValueChainCard) {
  return (
    <Container>
      <ValueChainCardContainer>
        <Tooltip title={valueChain.status}>
          <div className="status">
            <div style={{ background: valueChain.statusColor }} />
          </div>
        </Tooltip>

        <Grid container spacing={1} justifyContent="flex-start" alignItems="center">
          <Grid item xs={12} md={6}>
            <CustomTooltip title={valueChain.name} text={valueChain.name} />
          </Grid>

          <Grid item md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <CustomTooltip
              title={
                <Box>
                  {Object.values(valueChain.path)
                    .reverse()
                    .map(({ id, name, entity }) => (
                      <Box key={id} sx={{ display: 'flex' }}>
                        <Typography sx={(theme) => ({ color: theme.palette.primary.main })}>
                          {entity}:
                        </Typography>

                        <Typography sx={{ marginLeft: '0.5rem' }}>{name}</Typography>
                      </Box>
                    ))}
                </Box>
              }
              text={
                <Box width="100%">
                  <TextEllipsis
                    sx={(theme) => ({
                      color: theme.palette.primary.main,
                    })}
                  >
                    {valueChain.path.subproject?.name
                      ? `${valueChain.path.subproject?.name} | `
                      : ''}
                    {valueChain.path.project.name}
                  </TextEllipsis>

                  <TextEllipsis>
                    {valueChain.path.subproduct?.name
                      ? `${valueChain.path.subproduct?.name} | `
                      : ''}
                    {valueChain.path.product.name}
                  </TextEllipsis>
                </Box>
              }
            />
            {/* <FieldValueContainer>
              <strong>Produto:</strong>
            </FieldValueContainer> */}
          </Grid>
        </Grid>

        <CardActions>
          {permissions.readTasks && (
            <CustomIconButton
              type="custom"
              size="small"
              title="Visualizar tarefas"
              CustomIcon={<ListAlt fontSize="small" />}
              action={() => {
                handleNavigationTasks(valueChain.id);
              }}
            />
          )}

          <CustomIconButton
            type="info"
            size="small"
            title="Informações"
            action={() => setInfo(valueChain.id)}
          />

          {permissions.updateValueChain && (
            <CustomIconButton
              type="edit"
              size="small"
              title="Editar Produto"
              action={() => setUpdate(valueChain.id)}
            />
          )}

          {permissions.deleteValueChain && (
            <CustomIconButton
              type="delete"
              size="small"
              title="Deletar Produto"
              action={() => setDelete(valueChain.id, valueChain.name)}
            />
          )}
        </CardActions>
      </ValueChainCardContainer>
    </Container>
  );
}

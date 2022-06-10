import { ExpandLess, ExpandMore, ListAlt } from '@mui/icons-material';
import { Box, Collapse, Grid, Typography } from '@mui/material';
import { useState } from 'react';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { TextEllipsis } from '#shared/styledComponents/common';
import { IPathObject } from '#shared/types/ICommonApi';

import { GraphTasksModal } from '#modules/tasks/tasks/components/GraphTasks';

import { ValueChainCardContainer, CardActions } from './styles';

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
  const [showTasks, setShowTasks] = useState(false);

  return (
    <>
      <ValueChainCardContainer>
        <CustomTooltip title={valueChain.status}>
          <Box className="status">
            <Box sx={{ background: valueChain.statusColor }} />
          </Box>
        </CustomTooltip>

        <Grid container spacing={1} justifyContent="flex-start" alignItems="center">
          <Grid item xs={12} md={6}>
            <CustomTooltip title={valueChain.name}>{valueChain.name}</CustomTooltip>
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
            >
              <Box width="100%">
                <TextEllipsis
                  sx={(theme) => ({
                    color: theme.palette.primary.main,
                  })}
                >
                  {valueChain.path.subproject?.name ? `${valueChain.path.subproject?.name} | ` : ''}
                  {valueChain.path.project.name}
                </TextEllipsis>

                <TextEllipsis>
                  {valueChain.path.subproduct?.name ? `${valueChain.path.subproduct?.name} | ` : ''}
                  {valueChain.path.product.name}
                </TextEllipsis>
              </Box>
            </CustomTooltip>
          </Grid>
        </Grid>

        <CardActions>
          {permissions.readTasks && (
            <CustomIconButton
              iconType="custom"
              iconSize="small"
              title="Visualizar tarefas"
              CustomIcon={<ListAlt fontSize="small" />}
              action={() => {
                handleNavigationTasks(valueChain.id);
              }}
            />
          )}

          <CustomIconButton
            iconType="info"
            iconSize="small"
            title="Informações"
            action={() => setInfo(valueChain.id)}
          />

          {permissions.updateValueChain && (
            <CustomIconButton
              iconType="edit"
              iconSize="small"
              title="Editar Produto"
              action={() => setUpdate(valueChain.id)}
            />
          )}

          {permissions.deleteValueChain && (
            <CustomIconButton
              iconType="delete"
              iconSize="small"
              title="Deletar Produto"
              action={() => setDelete(valueChain.id, valueChain.name)}
            />
          )}
        </CardActions>

        <Box className="expand">
          <CustomIconButton
            action={() => setShowTasks((old) => !old)}
            title={showTasks ? 'Esconder Tarefas' : 'Mostrar Tarefas'}
            iconType="custom"
            CustomIcon={
              showTasks ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />
            }
          />
        </Box>
      </ValueChainCardContainer>

      <Collapse in={showTasks}>
        <Box padding="0 0.5rem">
          {showTasks && <GraphTasksModal value_chain_id={valueChain.id} />}
        </Box>
      </Collapse>
    </>
  );
}

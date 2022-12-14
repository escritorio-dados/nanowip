import { ArrowBack, Map } from '@mui/icons-material';
import { Box, useTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  ControlButton,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
} from 'react-flow-renderer';
import { useNavigate, useParams } from 'react-router-dom';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { CreateTaskTrailModal } from '#modules/trails/taskTrails/components/CreateTaskTrail';
import { DeleteTaskTrailModal } from '#modules/trails/taskTrails/components/DeleteTaskTrail';
import { InfoTaskTrailModal } from '#modules/trails/taskTrails/components/InfoTaskTrail';
import {
  ITaskTrailCardInfo,
  TaskTrailCard,
} from '#modules/trails/taskTrails/components/TaskTrailCard';
import { UpdateTaskTrailModal } from '#modules/trails/taskTrails/components/UpdateTaskTrail';
import { IGraphTaskTrails } from '#modules/trails/taskTrails/types/ITaskTrail';
import { ITrail } from '#modules/trails/trails/types/ITrail';

import { GraphContainer, PageContainer } from './styles';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const nodeTypes = { task: TaskTrailCard };

export function GraphTaskTrails() {
  const params = useParams();
  const { updateState, getState } = useKeepStates();

  const [createTask, setCreateTask] = useState(false);
  const [infoTask, setInfoTask] = useState<IUpdateModal>(null);
  const [updateTask, setUpdateTask] = useState<IUpdateModal>(null);
  const [deleteTask, setDeleteTask] = useState<IDeleteModal>(null);

  const navigate = useNavigate();
  const { getBackUrl } = useGoBackUrl();
  const { checkPermissions } = useAuth();
  const { updateTitle } = useTitle();
  const { toast } = useToast();
  const { palette } = useTheme();

  const {
    loading: trailLoading,
    data: trailData,
    error: trailError,
  } = useGet<ITrail>({
    url: `/trails/${params.trail_id}`,
  });

  const {
    loading: tasksLoading,
    data: tasksData,
    error: tasksError,
    send: getTasks,
  } = useGet<IGraphTaskTrails>({ url: `/task_trails`, lazy: true });

  useEffect(() => {
    if (params.trail_id) {
      getTasks({
        params: { trail_id: params.trail_id, node_width: 330, node_height: 130 },
      });
    }
  }, [getTasks, params.trail_id]);

  useEffect(() => {
    if (trailError) {
      toast({ message: trailError, severity: 'error' });

      return;
    }

    if (tasksError) {
      toast({ message: tasksError, severity: 'error' });
    }
  }, [trailError, tasksError, toast]);

  useEffect(() => {
    const name = trailData ? `- ${trailData.name}` : '';

    updateTitle(`Tarefas ${name}`);
  }, [updateTitle, trailData]);

  const permissions = useMemo(() => {
    return {
      createTask: checkPermissions([[PermissionsUser.create_trail, PermissionsUser.manage_trail]]),
      updateTask: checkPermissions([[PermissionsUser.update_trail, PermissionsUser.manage_trail]]),
      deleteTask: checkPermissions([[PermissionsUser.delete_trail, PermissionsUser.manage_trail]]),
    };
  }, [checkPermissions]);

  const nodes = useMemo(() => {
    if (!tasksData) {
      return [];
    }

    return tasksData.nodes.map<Node<ITaskTrailCardInfo>>((node) => ({
      ...node,
      type: 'task',
      dragHandle: '.custom-drag-handle',
      data: {
        ...node.data,
        width: node.width,
        height: node.height,
        permissions,
        setInfo: (id) => setInfoTask({ id }),
        setUpdate: (id) => setUpdateTask({ id }),
        setDelete: (id, name) => setDeleteTask({ id, name }),
      },
      position: { x: node.x, y: node.y },
    }));
  }, [permissions, tasksData]);

  const edges = useMemo(() => {
    if (!tasksData) {
      return [];
    }

    return tasksData.edges.map<Edge>((edge) => ({
      ...edge,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    }));
  }, [tasksData]);

  if (trailLoading) return <Loading loading={trailLoading} />;

  return (
    <>
      <Loading loading={tasksLoading} />

      {!!createTask && trailData && (
        <CreateTaskTrailModal
          openModal={createTask}
          closeModal={() => setCreateTask(false)}
          reloadList={() =>
            getTasks({
              params: {
                trail_id: trailData.id,
                node_width: 330,
                node_height: 130,
              },
            })
          }
          trail_id={trailData.id}
        />
      )}

      {!!updateTask && trailData && (
        <UpdateTaskTrailModal
          openModal={!!updateTask}
          closeModal={() => setUpdateTask(null)}
          reloadList={() =>
            getTasks({
              params: {
                trail_id: trailData.id,
                node_width: 330,
                node_height: 130,
              },
            })
          }
          trail_id={trailData.id}
          task_id={updateTask.id}
        />
      )}

      {!!infoTask && (
        <InfoTaskTrailModal
          openModal={!!infoTask}
          closeModal={() => setInfoTask(null)}
          task_id={infoTask.id}
        />
      )}

      {deleteTask && (
        <DeleteTaskTrailModal
          openModal={!!deleteTask}
          closeModal={() => setDeleteTask(null)}
          task={deleteTask}
          reloadList={() =>
            getTasks({
              params: {
                trail_id: params.trail_id || '',
                node_width: 330,
                node_height: 130,
              },
            })
          }
        />
      )}

      <PageContainer>
        <header>
          <Box>
            {getBackUrl('task_trails') && (
              <CustomIconButton
                action={() => navigate(getBackUrl('task_trails') || '')}
                title="Voltar"
                iconType="custom"
                CustomIcon={<ArrowBack />}
              />
            )}
          </Box>

          <Box>
            {permissions.createTask && (
              <CustomIconButton
                action={() => setCreateTask(true)}
                title="Cadastrar Tarefa"
                iconType="add"
              />
            )}
          </Box>
        </header>

        {tasksData && (
          <GraphContainer>
            <ReactFlow
              defaultNodes={nodes}
              defaultEdges={edges}
              nodeTypes={nodeTypes}
              nodesDraggable
              nodesConnectable={false}
              defaultZoom={0.8}
              defaultPosition={[50, 20]}
            >
              {!!getState({ category: 'map', key: 'map', defaultValue: true }) && (
                <MiniMap
                  nodeColor={() => palette.backgoundAlt}
                  maskColor="#ffffff50"
                  nodeStrokeColor={(node) => node.data.lateColor}
                  nodeStrokeWidth={10}
                  style={{
                    background: grey[900],
                    height: 150,
                    width: 250,
                  }}
                />
              )}

              <Controls showInteractive={false}>
                <ControlButton
                  onClick={() =>
                    updateState({
                      category: 'map',
                      key: 'map',
                      value: !getState({ category: 'map', key: 'map', defaultValue: false }),
                      localStorage: true,
                    })
                  }
                >
                  <Map />
                </ControlButton>
              </Controls>
            </ReactFlow>
          </GraphContainer>
        )}
      </PageContainer>
    </>
  );
}

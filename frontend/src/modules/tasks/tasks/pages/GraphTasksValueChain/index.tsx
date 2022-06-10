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
import { StatusDateColor } from '#shared/types/IStatusDate';
import { getStatusText } from '#shared/utils/getStatusText';

import { InfoAssignmentsTaskModal } from '#modules/assignments/components/InfoAssignmentsTask';
import { CreateTaskModal } from '#modules/tasks/tasks/components/CreateTask';
import { DeleteTaskModal } from '#modules/tasks/tasks/components/DeleteTask';
import { InfoTaskModal } from '#modules/tasks/tasks/components/InfoTask';
import { ITaskCardInfo, TaskCard } from '#modules/tasks/tasks/components/TaskCard';
import { UpdateTaskModal } from '#modules/tasks/tasks/components/UpdateTask';
import { IGraphTasks } from '#modules/tasks/tasks/types/ITask';
import { IValueChain } from '#modules/valueChains/types/IValueChain';

import { GraphContainer, PageContainer } from './styles';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const nodeTypes = { task: TaskCard };

export function GraphTasksValueChain() {
  const params = useParams();
  const { updateState, getState } = useKeepStates();

  const [createTask, setCreateTask] = useState(false);
  const [infoTask, setInfoTask] = useState<IUpdateModal>(null);
  const [infoAssignments, setInfoAssignments] = useState<IDeleteModal>(
    getState({ category: '[A]Modal', key: params?.value_chain_id || '', defaultValue: null }),
  );
  const [updateTask, setUpdateTask] = useState<IUpdateModal>(null);
  const [deleteTask, setDeleteTask] = useState<IDeleteModal>(null);

  const navigate = useNavigate();
  const { getBackUrl } = useGoBackUrl();
  const { checkPermissions } = useAuth();
  const { updateTitle } = useTitle();
  const { toast } = useToast();
  const { palette } = useTheme();

  const {
    loading: valueChainLoading,
    data: valueChainData,
    error: valueChainError,
  } = useGet<IValueChain>({
    url: `/value_chains/${params.value_chain_id}`,
    config: { params: { max_path: 'product' } },
  });

  const {
    loading: tasksLoading,
    data: tasksData,
    error: tasksError,
    send: getTasks,
  } = useGet<IGraphTasks>({ url: `/tasks`, lazy: true });

  useEffect(() => {
    if (params.value_chain_id) {
      getTasks({
        params: { value_chain_id: params.value_chain_id, node_width: 330, node_height: 130 },
      });
    }
  }, [getTasks, params.value_chain_id]);

  useEffect(() => {
    if (valueChainError) {
      toast({ message: valueChainError, severity: 'error' });

      return;
    }

    if (tasksError) {
      toast({ message: tasksError, severity: 'error' });
    }
  }, [valueChainError, tasksError, toast]);

  useEffect(() => {
    const name = valueChainData ? `- ${valueChainData.name} | ${valueChainData.pathString}` : '';

    updateTitle(`Tarefas ${name}`);
  }, [updateTitle, valueChainData]);

  const permissions = useMemo(() => {
    return {
      createTask: checkPermissions([[PermissionsUser.create_task, PermissionsUser.manage_task]]),
      updateTask: checkPermissions([[PermissionsUser.update_task, PermissionsUser.manage_task]]),
      deleteTask: checkPermissions([[PermissionsUser.delete_task, PermissionsUser.manage_task]]),
      readAssignment: checkPermissions([
        [PermissionsUser.read_assignment, PermissionsUser.manage_assignment],
      ]),
    };
  }, [checkPermissions]);

  const nodes = useMemo(() => {
    if (!tasksData) {
      return [];
    }

    return tasksData.nodes.map<Node<ITaskCardInfo>>((node) => ({
      ...node,
      type: 'task',
      dragHandle: '.custom-drag-handle',
      data: {
        ...node.data,
        status: getStatusText(node.data.statusDate),
        statusColor: StatusDateColor[node.data.statusDate.status],
        lateColor: node.data.statusDate.late ? StatusDateColor.late : undefined,
        width: node.width,
        height: node.height,
        permissions,
        setAssignments: (id, name) => setInfoAssignments({ id, name }),
        setInfo: (id) => setInfoTask({ id }),
        setUpdate: (id) => setUpdateTask({ id }),
        setDelete: (id, name) => setDeleteTask({ id, name }),
        valueChainId: params.value_chain_id || '',
      },
      position: { x: node.x, y: node.y },
    }));
  }, [params, permissions, tasksData]);

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

  if (valueChainLoading) return <Loading loading={valueChainLoading} />;

  return (
    <>
      <Loading loading={tasksLoading} />

      {!!createTask && valueChainData && (
        <CreateTaskModal
          openModal={createTask}
          closeModal={() => setCreateTask(false)}
          reloadList={() =>
            getTasks({
              params: {
                value_chain_id: params.value_chain_id || '',
                node_width: 330,
                node_height: 130,
              },
            })
          }
          valueChain={valueChainData}
        />
      )}

      {!!updateTask && valueChainData && (
        <UpdateTaskModal
          openModal={!!updateTask}
          closeModal={() => setUpdateTask(null)}
          reloadList={() =>
            getTasks({
              params: {
                value_chain_id: params.value_chain_id || '',
                node_width: 330,
                node_height: 130,
              },
            })
          }
          valueChain={valueChainData}
          task_id={updateTask.id}
        />
      )}

      {!!infoTask && (
        <InfoTaskModal
          openModal={!!infoTask}
          closeModal={() => setInfoTask(null)}
          task_id={infoTask.id}
        />
      )}

      {!!infoAssignments && (
        <InfoAssignmentsTaskModal
          openModal={!!infoAssignments}
          closeModal={(reload) => {
            setInfoAssignments(null);

            if (params.value_chain_id) {
              updateState({
                category: '[A]Modal',
                key: params!.value_chain_id,
                value: undefined,
              });
            }

            if (reload && params.value_chain_id) {
              getTasks({
                params: {
                  value_chain_id: params.value_chain_id,
                  node_width: 330,
                  node_height: 130,
                },
              });
            }
          }}
          task={infoAssignments}
        />
      )}

      {deleteTask && (
        <DeleteTaskModal
          openModal={!!deleteTask}
          closeModal={() => setDeleteTask(null)}
          task={deleteTask}
          reloadList={() =>
            getTasks({
              params: {
                value_chain_id: params.value_chain_id || '',
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
            {getBackUrl('tasks') && (
              <CustomIconButton
                action={() => navigate(getBackUrl('tasks') || '')}
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
              defaultZoom={0.7}
              defaultPosition={[50, 20]}
            >
              {!!getState({ category: 'map', key: 'map', defaultValue: true }) && (
                <MiniMap
                  nodeColor={(node) =>
                    node.data.statusColor === '#00000000'
                      ? palette.backgoundAlt
                      : node.data.statusColor
                  }
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

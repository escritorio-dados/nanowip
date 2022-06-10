import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { GraphTasksValueChain } from '../pages/GraphTasksValueChain';

export function TasksRoutes() {
  return (
    <Routes>
      <Route
        path="/graph/:value_chain_id"
        element={
          <PrivateRoute
            permissionRequired={[
              [PermissionsUser.manage_value_chain, PermissionsUser.read_value_chain],
              [PermissionsUser.manage_task, PermissionsUser.read_task],
            ]}
          >
            <GraphTasksValueChain />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

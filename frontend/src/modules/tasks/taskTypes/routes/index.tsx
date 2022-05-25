import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';

import { ListTaskType } from '../pages/ListTaskTypes';

export function TaskTypesRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[
              [PermissionsUser.manage_task_type, PermissionsUser.read_task_type],
            ]}
          >
            <ListTaskType />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

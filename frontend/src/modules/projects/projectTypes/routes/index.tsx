import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';

import { ListProjectType } from '../pages/ListProjectTypes';

export function ProjectTypesRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[
              [PermissionsUser.manage_project_type, PermissionsUser.read_project_type],
            ]}
          >
            <ListProjectType />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

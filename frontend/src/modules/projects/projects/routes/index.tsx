import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';

import { ListProjects } from '../pages/ListProjects';

export function ProjectsRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[[PermissionsUser.manage_project, PermissionsUser.read_project]]}
          >
            <ListProjects />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

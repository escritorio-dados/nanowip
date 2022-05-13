import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';

import { ListService } from '../pages/ListServices';

export function ServicesRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[[PermissionsUser.manage_service, PermissionsUser.read_service]]}
          >
            <ListService />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';

import { ListTrail } from '../pages/ListTrails';

export function TrailsRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[[PermissionsUser.manage_trail, PermissionsUser.read_trail]]}
          >
            <ListTrail />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

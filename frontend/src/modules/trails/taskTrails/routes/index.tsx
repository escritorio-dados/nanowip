import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';

import { GraphTaskTrails } from '../pages/GraphTaskTrails';

export function TaskTrailsRoutes() {
  return (
    <Routes>
      <Route
        path="/graph/:trail_id"
        element={
          <PrivateRoute
            permissionRequired={[[PermissionsUser.manage_trail, PermissionsUser.read_trail]]}
          >
            <GraphTaskTrails />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

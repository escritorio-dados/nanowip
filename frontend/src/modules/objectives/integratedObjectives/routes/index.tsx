import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ListIntegratedObjective } from '../pages/ListIntegratedObjectives';

export function IntegratedObjectivesRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[
              [
                PermissionsUser.manage_integrated_objective,
                PermissionsUser.read_integrated_objective,
              ],
            ]}
          >
            <ListIntegratedObjective />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

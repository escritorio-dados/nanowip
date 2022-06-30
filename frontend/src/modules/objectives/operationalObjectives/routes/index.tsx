import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ListOperationalObjective } from '../pages/ListOperationalObjective';

export function OperationalObjectivesRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[
              [
                PermissionsUser.manage_operational_objective,
                PermissionsUser.read_operational_objective,
              ],
            ]}
          >
            <ListOperationalObjective />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

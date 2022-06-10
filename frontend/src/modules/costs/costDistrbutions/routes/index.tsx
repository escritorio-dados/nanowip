import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ListCostDistributions } from '../pages/ListCostDistributions';

export function CostDitributionsRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[
              [PermissionsUser.manage_cost_distribution, PermissionsUser.read_cost_distribution],
              [PermissionsUser.manage_cost, PermissionsUser.read_cost],
            ]}
          >
            <ListCostDistributions />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

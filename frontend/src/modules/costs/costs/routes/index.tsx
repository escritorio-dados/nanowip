import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';

import { ListCost } from '../pages/ListCosts';

export function CostsRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[[PermissionsUser.manage_cost, PermissionsUser.read_cost]]}
          >
            <ListCost />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

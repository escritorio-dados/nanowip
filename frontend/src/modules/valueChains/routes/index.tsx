import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';

import { ListValueChains } from '../pages/ListValueChains';

export function ValueChainsRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[
              [PermissionsUser.manage_value_chain, PermissionsUser.read_value_chain],
            ]}
          >
            <ListValueChains />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

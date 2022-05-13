import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';

import { ListProductType } from '../pages/ListProductTypes';

export function ProductTypesRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[
              [PermissionsUser.manage_product_type, PermissionsUser.read_product_type],
            ]}
          >
            <ListProductType />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

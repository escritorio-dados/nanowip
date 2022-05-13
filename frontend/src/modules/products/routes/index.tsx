import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';

import { ListProducts } from '../pages/ListProducts';

export function ProductsRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[[PermissionsUser.manage_product, PermissionsUser.read_product]]}
          >
            <ListProducts />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

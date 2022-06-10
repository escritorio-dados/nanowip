import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ListCustomer } from '../pages/ListCustomers';

export function CustomersRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[[PermissionsUser.manage_customer, PermissionsUser.read_customer]]}
          >
            <ListCustomer />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

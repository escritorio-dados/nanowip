import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ListServiceProvider } from '../pages/ListServiceProviders';

export function ServiceProvidersRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[
              [PermissionsUser.manage_service_provider, PermissionsUser.read_service_provider],
            ]}
          >
            <ListServiceProvider />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

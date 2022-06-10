import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { DEFAULT_ORGANIZATION_IDS } from '#modules/organizations/types/IOrganization';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ListOrganization } from '../pages/ListOrganizations';

export function OrganizationsRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[[PermissionsUser.admin]]}
            organizations={[DEFAULT_ORGANIZATION_IDS.SYSTEM]}
          >
            <ListOrganization />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

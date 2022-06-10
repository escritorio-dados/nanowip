import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ListCollaboratorStatus } from '../pages/ListCollaboratorsStatus';

export function CollaboratorsStatusRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[
              [
                PermissionsUser.manage_collaborator_status,
                PermissionsUser.read_collaborator_status,
              ],
            ]}
          >
            <ListCollaboratorStatus />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

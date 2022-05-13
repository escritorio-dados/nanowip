import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';

import { ListCollaborator } from '../pages/ListCollaborators';

export function CollaboratorsRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[
              [PermissionsUser.manage_collaborator, PermissionsUser.read_collaborator],
            ]}
          >
            <ListCollaborator />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

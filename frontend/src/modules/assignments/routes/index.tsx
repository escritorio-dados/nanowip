import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ListAssignment } from '../pages/ListAssignments';

export function AssignmentsRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[
              [PermissionsUser.manage_assignment, PermissionsUser.read_assignment],
            ]}
          >
            <ListAssignment />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

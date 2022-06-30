import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ListSectionTrail } from '../pages/ListSectionTrails';

export function SectionTrailsRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[
              [PermissionsUser.manage_section_trail, PermissionsUser.read_section_trail],
            ]}
          >
            <ListSectionTrail />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

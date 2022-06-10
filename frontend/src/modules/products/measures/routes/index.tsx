import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ListMeasure } from '../pages/ListMeasures';

export function MeasuresRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[[PermissionsUser.manage_measure, PermissionsUser.read_measure]]}
          >
            <ListMeasure />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

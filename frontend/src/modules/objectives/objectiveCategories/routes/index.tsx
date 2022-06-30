import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ListObjectiveCategories } from '../pages/ListObjectiveCategories';

export function ObjectiveCategoriesRoutes() {
  return (
    <Routes>
      <Route
        path=":operational_objective_id"
        element={
          <PrivateRoute
            permissionRequired={[
              [PermissionsUser.manage_objective_category, PermissionsUser.read_objective_category],
            ]}
          >
            <ListObjectiveCategories />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

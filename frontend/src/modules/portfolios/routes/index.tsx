import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ListPortfolio } from '../pages/ListPortfolios';

export function PortfoliosRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[
              [PermissionsUser.manage_portfolio, PermissionsUser.read_portfolio],
            ]}
          >
            <ListPortfolio />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

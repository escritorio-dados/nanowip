import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';

import { ListLink } from '../pages/ListLinks';

export function LinksRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute>
            <ListLink />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

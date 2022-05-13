import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';

import { ListTracker } from '../pages/ListTrackers';

export function TrackersRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[[PermissionsUser.manage_tracker, PermissionsUser.read_tracker]]}
          >
            <ListTracker />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

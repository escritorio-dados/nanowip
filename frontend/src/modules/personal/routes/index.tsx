import { Route, Routes } from 'react-router-dom';

import { personalPermissions } from '#shared/components/NavigationBar/data';
import { PrivateRoute } from '#shared/routes/private';

import { AvailableAssignmentsPersonal } from '../pages/AvailableAssignmentsPersonal';
import { ListCloseAssignmentsPersonal } from '../pages/CloseAssignmentsPersonal';
import { ListTrackerPersonal } from '../pages/ListTrackersPersonal';

export function PersonalRoutes() {
  return (
    <Routes>
      <Route
        path="/assignments"
        element={
          <PrivateRoute permissionRequired={personalPermissions}>
            <AvailableAssignmentsPersonal />
          </PrivateRoute>
        }
      />

      <Route
        path="/trackers"
        element={
          <PrivateRoute permissionRequired={personalPermissions}>
            <ListTrackerPersonal />
          </PrivateRoute>
        }
      />

      <Route
        path="/assignments/close"
        element={
          <PrivateRoute permissionRequired={personalPermissions}>
            <ListCloseAssignmentsPersonal />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

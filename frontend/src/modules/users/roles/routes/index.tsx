import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ListRole } from '../pages/ListRoles';

export function RolesRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[[PermissionsUser.manage_role, PermissionsUser.read_role]]}
          >
            <ListRole />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

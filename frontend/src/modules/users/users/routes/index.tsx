import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ChangePasswordUser } from '../pages/ChangePassword';
import { ListUser } from '../pages/ListUsers';

export function UsersRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute
            permissionRequired={[[PermissionsUser.manage_user, PermissionsUser.read_user]]}
          >
            <ListUser />
          </PrivateRoute>
        }
      />

      <Route path="/changePassword" element={<ChangePasswordUser />} />
    </Routes>
  );
}

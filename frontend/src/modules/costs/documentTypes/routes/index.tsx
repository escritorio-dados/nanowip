import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '#shared/routes/private';
import { PermissionsUser } from '#shared/types/PermissionsUser';

import { ListDocumentType } from '../pages/ListDocumentTypes';

export function DocumentTypesRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute
            permissionRequired={[
              [PermissionsUser.manage_document_type, PermissionsUser.read_document_type],
            ]}
          >
            <ListDocumentType />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

import { useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '#shared/hooks/auth';
import { useToast } from '#shared/hooks/toast';

type IPrivateRoute = {
  permissionRequired?: string[][];
  organizations?: string[];
  children: JSX.Element;
};

export function PrivateRoute({ children, permissionRequired, organizations }: IPrivateRoute) {
  const { logged, checkPermissions, checkOrganizations } = useAuth();
  const { toast } = useToast();

  const hasPermissions = useMemo(() => {
    if (!permissionRequired || permissionRequired.length === 0) {
      return true;
    }

    const check = checkPermissions(permissionRequired);

    if (!check) {
      toast({
        message: 'Usuario não possui permissão para acessar essa página',
        severity: 'error',
      });
    }

    return check;
  }, [checkPermissions, permissionRequired, toast]);

  const hasOrganization = useMemo(() => {
    if (!organizations || organizations.length === 0) {
      return true;
    }

    const check = checkOrganizations(organizations);

    if (!check) {
      toast({
        message: 'Existe alguma inconsistencia na organização, faço login novamente',
        severity: 'error',
      });
    }

    return check;
  }, [checkOrganizations, organizations, toast]);

  useEffect(() => {
    if (!logged) {
      toast({
        message: 'Somente usuarios autenticados podem acessar essa página',
        severity: 'error',
      });
    }
  }, [logged, toast]);

  if (!hasPermissions) return <Navigate to="/" />;

  if (!logged || !hasOrganization) return <Navigate to="/auth" state={{ returnThisPage: true }} />;

  return children;
}

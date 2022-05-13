import { ListItem, ListItemText, ListItemProps } from '@mui/material';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '#shared/hooks/auth';

type IListItemNavProps = ListItemProps & {
  to: string;
  text: string;
  permissions?: string[][];
  nested?: boolean;
  organization?: string;
};

export function ListItemNav({ text, to, nested, permissions, organization }: IListItemNavProps) {
  const { checkPermissions, checkOrganizations } = useAuth();

  const hasPermission = useMemo(() => {
    if (!permissions || permissions.length === 0) {
      return true;
    }

    return checkPermissions(permissions);
  }, [checkPermissions, permissions]);

  const hasOrganization = useMemo(() => {
    if (!organization) {
      return true;
    }

    return checkOrganizations([organization]);
  }, [checkOrganizations, organization]);

  return (
    <>
      {hasPermission && hasOrganization && (
        <ListItem
          button
          sx={{
            paddingLeft: nested ? '2rem' : '1rem',
          }}
          component={Link}
          to={to}
        >
          <ListItemText primary={text} />
        </ListItem>
      )}
    </>
  );
}

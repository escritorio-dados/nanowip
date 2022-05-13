import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { ListItem, ListItemText, Collapse, List } from '@mui/material';
import { ReactNode, useCallback, useMemo, useState } from 'react';

import { useAuth } from '#shared/hooks/auth';
import { useKeepStates } from '#shared/hooks/keepStates';

interface IListItemNavGroupProps {
  text: string;
  permissions?: string[][];
  children: ReactNode;
  organization?: string;
}

export function ListItemNavGroup({
  text,
  permissions,
  children,
  organization,
}: IListItemNavGroupProps) {
  const { getState, updateState } = useKeepStates();

  const [open, setOpen] = useState(
    getState<boolean>({ category: 'nav_bar', key: text, defaultValue: false }),
  );

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

  const handleClick = useCallback(() => {
    updateState({ category: 'nav_bar', key: text, value: !open, localStorage: true });

    setOpen(!open);
  }, [open, text, updateState]);

  return (
    <>
      {hasPermission && hasOrganization && (
        <>
          <ListItem button onClick={handleClick}>
            <ListItemText primary={text} />

            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItem>

          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {children}
            </List>
          </Collapse>
        </>
      )}
    </>
  );
}

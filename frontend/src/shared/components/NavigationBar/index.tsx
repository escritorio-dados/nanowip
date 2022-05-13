import { Drawer, List, Typography } from '@mui/material';

import { useAuth } from '#shared/hooks/auth';
import { useNavBar } from '#shared/hooks/navBar';

import { navigationsItems } from './data';
import { ListItemNav } from './ListItemNav';
import { ListItemNavGroup } from './ListItemNavGroup';
import { NavContainer } from './styles';

export function NavigationBar() {
  const { logged, user } = useAuth();
  const { openNavBar } = useNavBar();

  return (
    <>
      {logged && (
        <Drawer
          variant="persistent"
          anchor="left"
          open={openNavBar}
          sx={{ flexShrink: 0, overflow: 'hidden' }}
        >
          <NavContainer>
            <header>
              <Typography component="h1">Nanowip</Typography>
            </header>

            <List component="nav">
              {navigationsItems.map((navItem) =>
                navItem.group ? (
                  <ListItemNavGroup
                    key={navItem.title}
                    text={navItem.title || ''}
                    permissions={navItem.permissions}
                    organization={
                      navItem.organization === '<user>'
                        ? user.organization_id
                        : navItem.organization
                    }
                  >
                    {navItem.items!.map((item) => (
                      <ListItemNav
                        key={item.title}
                        nested
                        to={item.link}
                        text={item.title}
                        permissions={item.permissions}
                        organization={
                          item.organization === '<user>' ? user.organization_id : item.organization
                        }
                      />
                    ))}
                  </ListItemNavGroup>
                ) : (
                  <ListItemNav
                    key={navItem.item!.title}
                    to={navItem.item!.link}
                    text={navItem.item!.title}
                    permissions={navItem.item!.permissions}
                    organization={
                      navItem.item!.organization === '<user>'
                        ? user.organization_id
                        : navItem.item!.organization
                    }
                  />
                ),
              )}
            </List>
          </NavContainer>
        </Drawer>
      )}
    </>
  );
}

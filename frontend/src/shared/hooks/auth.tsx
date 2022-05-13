import { isBefore, fromUnixTime } from 'date-fns';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { createContext, useCallback, useState, useContext, ReactNode, useMemo } from 'react';

import { Loading } from '#shared/components/Loading';
import { usePost } from '#shared/services/useAxios';
import { IUser } from '#shared/types/backend/IUser';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';

import { useToast } from './toast';

type IAuthProviderProps = { children: ReactNode };

type IAuthResponse = { token: string; user: IUser };

type IAuthInput = { email: string; password: string; organization_id: string };

type IAuthContextData = {
  user: IUser;
  logged: boolean;
  signIn(authInput: IAuthInput): Promise<void>;
  checkPermissions(permissionRequired: string[][]): boolean;
  checkOrganizations(organizations: string[]): boolean;
  signOut(): Promise<void>;
};

type IAuthState = { token: string; user: IUser };

type INanowipToken = JwtPayload & {
  email: string;
  organization_id: string;
};

const AuthContext = createContext<IAuthContextData>({} as IAuthContextData);

export function AuthProvider({ children }: IAuthProviderProps) {
  const [data, setData] = useState<IAuthState>(() => {
    const token = localStorage.getItem('@nanowip:token');
    const user = localStorage.getItem('@nanowip:user');

    if (token) {
      // const decodedToken = jwt.decode(token, { json: true });
      const decodedToken = jwt_decode<INanowipToken>(token);

      if (decodedToken && isBefore(fromUnixTime(Number(decodedToken.exp)), new Date())) {
        localStorage.removeItem('@nanowip:token');
        localStorage.removeItem('@nanowip:user');

        return {} as IAuthState;
      }
    }

    if (token && user) {
      return { token, user: JSON.parse(user) };
    }

    return {} as IAuthState;
  });

  const { toast } = useToast();

  const { loading, send: auth } = usePost<IAuthResponse, IAuthInput>('/auth');

  const signIn = useCallback(
    async (authInput: IAuthInput) => {
      const { data: authData, error } = await auth(authInput);

      if (error) {
        toast({ message: error, severity: 'error' });

        return;
      }

      const { token, user } = authData as IAuthResponse;

      localStorage.setItem('@nanowip:token', token);
      localStorage.setItem('@nanowip:user', JSON.stringify(user));

      setData({ token, user });
    },
    [auth, toast],
  );

  const signOut = useCallback(async () => {
    localStorage.removeItem('@nanowip:token');
    localStorage.removeItem('@nanowip:user');

    setData({} as IAuthState);
  }, []);

  const checkPermissions = useCallback(
    (permissionRequired: string[][]) => {
      const { user } = data;

      return permissionRequired.every((optionalPermissions) => {
        const onlyPersonal = optionalPermissions.some((permission) =>
          [
            PermissionsUser.personal_assignment,
            PermissionsUser.personal_tracker,
            PermissionsUser.personal_collaborator,
          ].includes(permission),
        );

        // Impede de alguem acessar o personal sem tem um colaborador associado
        if (onlyPersonal && !user.collaborator) {
          return false;
        }

        // Permite que o admin acesse qualquer rota menos as rotas personal a menos que ele tenha o personal
        if (!onlyPersonal && user.permissions.includes(PermissionsUser.admin)) {
          return true;
        }

        return optionalPermissions.some((permission) => user.permissions.includes(permission));
      });
    },
    [data],
  );

  const checkOrganizations = useCallback(
    (organizations: string[]) => {
      const { token } = data;

      const decodedToken = jwt_decode<INanowipToken>(token);

      return organizations.some(
        (organization_id) => decodedToken?.organization_id === organization_id,
      );
    },
    [data],
  );

  const authValue = useMemo<IAuthContextData>(() => {
    return {
      user: data.user,
      logged: !!data.user,
      signIn,
      signOut,
      checkPermissions,
      checkOrganizations,
    };
  }, [checkOrganizations, checkPermissions, data.user, signIn, signOut]);

  return (
    <AuthContext.Provider value={authValue}>
      <Loading loading={loading} />

      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): IAuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

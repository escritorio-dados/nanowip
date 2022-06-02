import { Ability, AbilityBuilder, AbilityClass } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { User } from '@modules/users/users/entities/User';
import { PermissionsUser } from '@modules/users/users/enums/permissionsUser.enum';

import { CaslActions } from '../enums/actions.casl.enum';
import { Subjects } from '../types/subjects.type';
import { subjectsConversor } from '../utils/subjectsConversor';

export type AppAbility = Ability<[CaslActions, Subjects]>;

@Injectable()
export class AbilityCaslFactory {
  public async createForUser(user: User): Promise<Ability<[CaslActions, Subjects]>> {
    const { can, build } = new AbilityBuilder<Ability<[CaslActions, Subjects]>>(
      Ability as AbilityClass<AppAbility>,
    );

    const pattern = new RegExp(`(${Object.values(CaslActions).join('|')})_.+`);

    // Qualquer permissão que não começe com uma das string abaixo vai ser considerado como unico
    const uniquePermissions: string[] = user.permissions.filter(
      permission => !pattern.exec(permission),
    );

    if (uniquePermissions.includes(PermissionsUser.admin)) {
      can(CaslActions.manage, 'all');
    }

    user.permissions
      .filter(permission => !uniquePermissions.includes(permission))
      .forEach(permission => {
        const [action, ...composeEntity] = permission.split('_');

        const entity = composeEntity.join('_');

        can(action as CaslActions, subjectsConversor[entity]);
      });

    return build();
  }
}

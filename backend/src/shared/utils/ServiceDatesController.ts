/* eslint-disable max-classes-per-file */
import { isEqual } from 'date-fns';

type IInitDates = { start?: Date; end?: Date; available?: Date };

type IEntityNew = {
  dates: IInitDates;
  newDates?: IInitDates;
  parent?: {
    oldParent?: string;
    newParent?: string;
    oldSecondParent?: string;
    newSecondParent?: string;
  };
  changes: {
    parent: boolean;
    secondParent?: boolean;
    available: boolean;
    start: boolean;
    end: boolean;
  };
};

type IDatesController = IInitDates & { parent_id?: string; second_parent?: string };

export class DatesController {
  private entity = {} as IEntityNew;

  constructor({ available, end, start, parent_id, second_parent }: IDatesController) {
    this.entity = {
      dates: { available, end, start },
      parent: {
        oldParent: parent_id,
        oldSecondParent: second_parent,
      },
      changes: {
        available: !!available,
        start: !!start,
        end: !!end,
        parent: false,
        secondParent: false,
      },
    };
  }

  updateDates({ available, end, start, parent_id, second_parent }: IDatesController) {
    this.entity.newDates = { available, end, start };

    this.entity.parent.newParent = parent_id;
    this.entity.parent.newSecondParent = second_parent;

    // Houve mudanças no available se não foram iguais ou null
    this.entity.changes.available =
      !this.entity.dates.available && !available
        ? false
        : !isEqual(this.entity.dates.available, available);

    // Houve mudanças no start se não foram iguais ou null
    this.entity.changes.start =
      !this.entity.dates.start && !start ? false : !isEqual(this.entity.dates.start, start);

    // Houve mudanças no start se não foram iguais ou null
    this.entity.changes.end =
      !this.entity.dates.end && !end ? false : !isEqual(this.entity.dates.end, end);

    // Se mudou o parentId
    this.entity.changes.parent = this.entity.parent.oldParent !== this.entity.parent.newParent;
  }

  needChangeDates(): boolean {
    return Object.values(this.entity.changes).some(date => date);
  }

  changed(field: 'available' | 'end' | 'start' | 'parent') {
    return this.entity.changes[field];
  }

  getParentId(field: 'old' | 'new', second?: boolean) {
    if (second) {
      if (field === 'old') {
        return this.entity.parent.oldSecondParent;
      }

      return this.entity.parent.newSecondParent;
    }

    if (field === 'old') {
      return this.entity.parent.oldParent;
    }

    return this.entity.parent.newParent;
  }

  getMode() {
    const { changes } = this.entity;

    const { available, end, start } = changes;

    if (available && !start && !end) {
      return 'available';
    }

    if (start && !available && !end) {
      return 'start';
    }

    if (end && !available && !start) {
      return 'end';
    }

    return 'full';
  }
}

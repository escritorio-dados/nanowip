import { isEqual } from 'date-fns';

import { IOldNewDatesFormat } from './DatesChangeController';

type IDates = { availableDate?: Date; endDate?: Date; startDate?: Date };

type IObjectWithDates = { [key: string]: any } & IDates;

type IEntity = {
  dates: IDates;
  newDates?: IDates;
  changes: {
    parent: boolean;
    available: boolean;
    start: boolean;
    end: boolean;
  };
};

type IParams = IOldNewDatesFormat & { deleted?: boolean };

export class ServiceDatesController {
  private entity = {} as IEntity;

  constructor({ availableDate, startDate, endDate }: IObjectWithDates) {
    this.entity = {
      dates: { availableDate, startDate, endDate },
      changes: {
        available: !!availableDate,
        start: !!startDate,
        end: !!endDate,
        parent: false,
      },
    };
  }

  updateDates({ availableDate, startDate, endDate }: IObjectWithDates, changedParent?: boolean) {
    this.entity.newDates = { availableDate, startDate, endDate };

    this.entity.changes.available =
      !this.entity.dates.availableDate && !availableDate
        ? false
        : !isEqual(this.entity.dates.availableDate, availableDate);

    this.entity.changes.start =
      !this.entity.dates.startDate && !startDate
        ? false
        : !isEqual(this.entity.dates.startDate, startDate);

    this.entity.changes.end =
      !this.entity.dates.endDate && !endDate ? false : !isEqual(this.entity.dates.endDate, endDate);

    this.entity.changes.parent = changedParent;
  }

  needChangeDates(): boolean {
    return Object.values(this.entity.changes).some(date => date);
  }

  changedDate(date: 'available' | 'end' | 'start') {
    return this.entity.changes[date];
  }

  getCreateParams() {
    const params: IParams = {};

    if (this.entity.changes.available) {
      params.available = { new: this.entity.dates.availableDate };
    }

    if (this.entity.changes.start) {
      params.start = { new: this.entity.dates.startDate };
    }

    if (this.entity.changes.end) {
      params.end = { new: this.entity.dates.endDate };
    } else {
      params.end = { new: null };
    }

    return params;
  }

  getUpdateParams() {
    const params: IParams = {};

    if (this.entity.changes.available || this.entity.changes.parent) {
      params.available = {
        old: this.entity.dates.availableDate,
        new: this.entity.newDates.availableDate,
      };
    }

    if (this.entity.changes.start || this.entity.changes.parent) {
      params.start = {
        old: this.entity.dates.startDate,
        new: this.entity.newDates.startDate,
      };
    }

    if (this.entity.changes.end || this.entity.changes.parent) {
      params.end = { new: this.entity.newDates.endDate };
    } else if (!this.entity.newDates.endDate) {
      params.end = { new: null };
    }

    return params;
  }

  getUpdateParamsDelete() {
    const params: IParams = { deleted: true };

    if (this.entity.changes.available || this.entity.changes.parent) {
      params.available = {
        old: this.entity.dates.availableDate,
      };
    }

    if (this.entity.changes.start || this.entity.changes.parent) {
      params.start = {
        old: this.entity.dates.startDate,
      };
    }

    return params;
  }

  getDeleteParams() {
    const params: IParams = { deleted: true };

    if (this.entity.changes.available) {
      params.available = { old: this.entity.dates.availableDate };
    }

    if (this.entity.changes.start) {
      params.start = { old: this.entity.dates.startDate };
    }

    return params;
  }
}

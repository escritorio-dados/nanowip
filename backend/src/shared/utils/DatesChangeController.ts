export type IObjectWithDates = {
  [key: string]: any;
  id?: string;
  availableDate?: Date;
  startDate?: Date;
  endDate?: Date;
};

type INewDates = {
  newStartDate: Date;
  newEndDate: Date;
  newAvailableDate?: Date;
};

export type IOldNewDatesFormat = {
  available?: {
    old?: Date;
    new?: Date;
  };
  start?: {
    old?: Date;
    new?: Date;
  };
  end?: {
    new?: Date;
  };
};

export class DatesChangesController {
  changeAvailable = false;

  changeStart = false;

  changeEnd = false;

  private oldAvailable: Date;

  private oldStart: Date;

  constructor({ availableDate, startDate }: IObjectWithDates) {
    this.oldAvailable = availableDate;

    this.oldStart = startDate;
  }

  needSave(): boolean {
    return this.changeAvailable || this.changeStart || this.changeEnd;
  }

  getUpdateDatesParams({
    newAvailableDate,
    newEndDate,
    newStartDate,
  }: INewDates): IOldNewDatesFormat {
    const chainParams: IOldNewDatesFormat = {};

    if (this.changeAvailable && newAvailableDate !== undefined) {
      chainParams.available = {
        old: this.oldAvailable,
        new: newAvailableDate,
      };
    }

    if (this.changeStart) {
      chainParams.start = {
        old: this.oldStart,
        new: newStartDate,
      };
    }

    if (this.changeEnd) {
      chainParams.end = {
        new: newEndDate,
      };
    }

    return chainParams;
  }
}

import { isEqual } from 'date-fns';

import { IObjectWithDates, IOldNewDatesFormat } from './DatesChangeController';

type INewDates = {
  newStart: Date;
  newEnd: Date;
  newAvailable: Date;
};

type IChangeDates = INewDates & {
  changedParent?: boolean;
};

type IGetUpdateParams = INewDates & {
  deleted?: boolean;
};

type IOldNewDatesFormatDelete = IOldNewDatesFormat & {
  deleted?: boolean;
};

type IUpdateControllerDates = IObjectWithDates & {
  availableDate?: Date;
};

export class UpdateDatesController {
  private oldEnd: Date;

  private oldAvailable: Date;

  private oldStart: Date;

  changeEnd: boolean;

  private changeStart: boolean;

  private changeAvailable: boolean;

  changedParent: boolean;

  constructor({ endDate, startDate, availableDate }: IUpdateControllerDates) {
    this.oldAvailable = availableDate;

    this.oldStart = startDate;

    this.oldEnd = endDate;
  }

  needChangeDates({ newAvailable, newEnd, newStart, changedParent }: IChangeDates): boolean {
    this.changeAvailable =
      (newAvailable || this.oldAvailable) && !isEqual(newAvailable, this.oldAvailable);

    this.changeEnd = (newEnd || this.oldEnd) && !isEqual(newEnd, this.oldEnd);

    this.changeStart = (newStart || this.oldStart) && !isEqual(newStart, this.oldStart);

    this.changedParent = changedParent;

    return this.changeAvailable || this.changeEnd || this.changeStart || this.changedParent;
  }

  getUpdateDatesParams({
    newAvailable,
    newEnd,
    newStart,
    deleted,
  }: IGetUpdateParams): IOldNewDatesFormatDelete {
    const chainParams: IOldNewDatesFormatDelete = {};

    // Mudança de parent isso vai ser executado no parent antigo
    if (deleted) {
      chainParams.available = {
        old: this.oldAvailable,
        new: null,
      };

      chainParams.start = {
        old: this.oldStart,
        new: null,
      };

      chainParams.deleted = true;

      return chainParams;
    }

    // Mudança de parent, isso vai ser executado no novo parent
    if (this.changedParent) {
      chainParams.available = {
        new: newAvailable,
      };

      chainParams.start = {
        new: newStart,
      };

      chainParams.end = {
        new: newEnd,
      };

      return chainParams;
    }

    // Isso vai executar quando não houve mudança de parent mas houve mudança das datas fixas
    if (this.changeAvailable) {
      chainParams.available = {
        old: this.oldAvailable,
        new: newAvailable,
      };
    }

    if (this.changeStart) {
      chainParams.start = {
        old: this.oldStart,
        new: newStart,
      };
    }

    if (this.changeEnd) {
      chainParams.end = {
        new: newEnd,
      };
    }

    return chainParams;
  }
}

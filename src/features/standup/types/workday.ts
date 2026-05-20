/** ISO calendar date `YYYY-MM-DD` in the user's local timezone. */
export type Workday = string;

export type WorkdayUtcBounds = {
  since: string;
  until: string;
};

export type WorkdayPickerBounds = {
  minimumWorkday: Workday;
  maximumWorkday: Workday;
  minimumDate: Date;
  maximumDate: Date;
};

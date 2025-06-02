export const getStartOfWeek = (date: Date, weekStartsOn: number = 0): Date => { // 0 for Sunday, 1 for Monday
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getEndOfWeek = (date: Date, weekStartsOn: number = 0): Date => {
  const d = getStartOfWeek(date, weekStartsOn);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getStartOfMonth = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getEndOfMonth = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  const desiredMonth = d.getMonth() + months;
  d.setMonth(desiredMonth);
  // If the day of the month changed, it means we rolled over to the next month
  // e.g. Jan 31 + 1 month = Mar 3 (if Feb has 28 days), so set to last day of Feb
  if (d.getMonth() !== (desiredMonth % 12 + 12) % 12) {
    d.setDate(0); // Sets to the last day of the previous month
  }
  return d;
};

export const addWeeks = (date: Date, weeks: number): Date => {
  return addDays(date, weeks * 7);
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  if (!date1 || !date2) return false;
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

export const isSameMonth = (date1: Date, date2: Date): boolean => {
  if (!date1 || !date2) return false;
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth();
}

export const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};

export const formatWeekRange = (startDate: Date): string => {
  const endDate = addDays(startDate, 6);
  const startMonth = startDate.toLocaleDateString(undefined, { month: 'short' });
  const endMonth = endDate.toLocaleDateString(undefined, { month: 'short' });
  
  if (startDate.getFullYear() !== endDate.getFullYear()) {
     return `${startMonth} ${startDate.getDate()}, ${startDate.getFullYear()} - ${endMonth} ${endDate.getDate()}, ${endDate.getFullYear()}`;
  }
  if (startMonth === endMonth) {
    return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}, ${startDate.getFullYear()}`;
  }
  return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${startDate.getFullYear()}`;
};

export const formatDayDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

// Generates a 2D array of Date objects representing the month grid
export const getDaysInMonthForGrid = (date: Date, weekStartsOn: number = 0): Date[][] => {
  const month = date.getMonth();
  const year = date.getFullYear();
  const firstDayOfMonth = new Date(year, month, 1);
  
  // Start from the first day of the week that contains the first day of the month
  let currentDate = getStartOfWeek(firstDayOfMonth, weekStartsOn);
  
  const weeks: Date[][] = [];
  let safety = 0; // Safety break for the loop

  // Loop for a maximum of 6 weeks (typical max for a month grid)
  for (let i = 0; i < 6 && safety < 42; i++) {
    const week: Date[] = [];
    for (let j = 0; j < 7; j++) {
      week.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
      safety++;
    }
    weeks.push(week);
    // If the next week starts in a future month, and we've already included the current month's end, break.
    if (currentDate.getMonth() !== month && currentDate > getEndOfMonth(date) && weeks.length >=4) {
        // Check if the last week actually contains any days from the current month
        const lastWeekInGrid = weeks[weeks.length-1];
        if (!lastWeekInGrid.some(d => d.getMonth() === month)) {
            weeks.pop(); // Remove if it's entirely next month and not needed
        }
        break;
    }
  }
  return weeks;
};

export const WEEK_DAY_NAMES = (weekStartsOn: number = 0, format: 'short' | 'long' = 'short'): string[] => {
    const days = [];
    const date = getStartOfWeek(new Date(), weekStartsOn); // Get a sample week start
    for (let i = 0; i < 7; i++) {
        days.push(addDays(date, i).toLocaleDateString(undefined, { weekday: format }));
    }
    return days;
};

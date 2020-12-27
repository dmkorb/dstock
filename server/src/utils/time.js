
function isValidDate(value) {
  var dateWrapper = new Date(value);
  return !isNaN(dateWrapper.getDate());
}

export const isDateWeekend = (date) => {
  // using setHours to avoid time zone issues
  const day = new Date(new Date(date).setUTCHours(12)).getDay();
  return day === 0 || day === 6;
}

export const isDateOlderThanHours = (date, hours) => {
  if (!isValidDate(date)) return false;
  return (new Date() - date) > (1000 * 60 * 60 * hours);
}

export const isOlderThanToday = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0);
  return (date < today);
}
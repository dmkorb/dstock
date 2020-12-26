
function isValidDate(value) {
  var dateWrapper = new Date(value);
  return !isNaN(dateWrapper.getDate());
}

export const isDateWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
}

export const isDateOlderThanHours = (date, hours) => {
  if (!isValidDate(date)) return false;
  console.log(new Date() - date, (1000 * 60 * 60 * hours), (new Date() - date) > (1000 * 60 * 60 * hours))
  return (new Date() - date) > (1000 * 60 * 60 * hours);
}

export const isOlderThanToday = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0);
  return (date < today);
}
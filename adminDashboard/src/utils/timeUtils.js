import moment from 'moment';

export const formatDateTime = (date) => {
    return moment(date).format('DD/MM/YYYY hh:mm A');
};

export const formatTime = (date) => {
  if (!date) return null;

  return moment(
    date,
    [
      "HH:mm",
      "DD/MM/YYYY HH:mm:ss",
      "YYYY-MM-DD HH:mm:ss",
      "YYYY-MM-DD HH:mm"
    ],
    true // strict parsing
  ).format("hh:mm A");
};

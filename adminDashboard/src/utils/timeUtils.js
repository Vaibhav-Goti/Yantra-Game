import moment from 'moment';

export const formatDateTime = (date) => {
    return moment(date).format('DD/MM/YYYY hh:mm A');
};
import cron from 'node-cron';
import Machine from '../modals/machine.modal.js';
import moment from 'moment';


export default () => {
    cron.schedule('* * * * *', async () => {
        console.log('Running machine status job');
        try {
            const now = moment().tz('Asia/Kolkata');
            console.log('now', now.toDate());
            const tenMinutesAgoIST = now.clone().subtract(10, 'minutes').toDate();
            console.log('tenMinutesAgoIST', tenMinutesAgoIST);
            const utcDate = moment.utc();
            console.log('utcDate', utcDate);
            console.log('utc ten minutes ago', utcDate.clone().subtract(10, 'minutes').toDate());

            await Machine.updateMany({ lastActive: { $lt: tenMinutesAgoIST } }, { $set: { isMachineOffline: true } });
            console.log('Machine status updated successfully');

            await Machine.updateMany({ lastActive: { $gte: tenMinutesAgoIST } }, { $set: { isMachineOffline: false } });
            console.log('Machine status updated successfully');

        } catch (error) {
            console.log(error.message);
        }
    });
};

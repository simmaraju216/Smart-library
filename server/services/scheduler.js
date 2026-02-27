import cron from 'node-cron';
import { getOverdueIssuedTransactions } from '../models/transactionModel.js';
import { sendSmsReminder } from './smsService.js';

export const startScheduler = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      const dueTomorrow = await getOverdueIssuedTransactions();
      await Promise.all(
        dueTomorrow.map((row) =>
          sendSmsReminder({
            phone: row.phone,
            message: `Reminder: Please return "${row.title}" by ${row.due_date}.`
          })
        )
      );
    } catch (error) {
      console.error('Scheduler error:', error.message);
    }
  });
};
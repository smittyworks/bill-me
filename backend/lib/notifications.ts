import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

export interface BillReminder {
  userId: string;
  pushToken: string;
  billDescription: string;
  balance: number;
  minimumDue: number;
  dueDate: string;
  daysUntilDue: number;
}

export async function sendBillReminder(reminder: BillReminder): Promise<void> {
  // Check that push token is valid
  if (!Expo.isExpoPushToken(reminder.pushToken)) {
    console.error(`Push token ${reminder.pushToken} is not a valid Expo push token`);
    return;
  }

  const message: ExpoPushMessage = {
    to: reminder.pushToken,
    sound: 'default',
    title: `Bill Due in ${reminder.daysUntilDue} Days`,
    body: `${reminder.billDescription}: $${reminder.balance.toFixed(2)} (Min: $${reminder.minimumDue.toFixed(2)})`,
    data: {
      userId: reminder.userId,
      dueDate: reminder.dueDate,
    },
  };

  try {
    const ticketChunk = await expo.sendPushNotificationsAsync([message]);
    console.log('Notification sent:', ticketChunk);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

export async function sendBillReminders(reminders: BillReminder[]): Promise<void> {
  const messages: ExpoPushMessage[] = [];

  for (const reminder of reminders) {
    if (!Expo.isExpoPushToken(reminder.pushToken)) {
      console.error(`Push token ${reminder.pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: reminder.pushToken,
      sound: 'default',
      title: `Bill Due in ${reminder.daysUntilDue} Days`,
      body: `${reminder.billDescription}: $${reminder.balance.toFixed(2)} (Min: $${reminder.minimumDue.toFixed(2)})`,
      data: {
        userId: reminder.userId,
        dueDate: reminder.dueDate,
      },
    });
  }

  // Send notifications in chunks
  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log('Notifications sent:', ticketChunk);
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  }
}

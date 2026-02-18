import { Expo, ExpoPushMessage } from 'expo-server-sdk';

// ---------------------------------------------------------------------------
// Slack notifications (web app replacement for Expo push)
// Set SLACK_WEBHOOK_URL in .env.local to enable
// ---------------------------------------------------------------------------

export async function sendSlackReminders(reminders: BillReminder[]): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('SLACK_WEBHOOK_URL not set — skipping Slack notifications');
    return;
  }

  for (const reminder of reminders) {
    const d = reminder.daysUntilDue;
    const daysText =
      d === 0 ? '*today*'
      : d > 0 ? `in *${d} day${d !== 1 ? 's' : ''}*`
      : `*${Math.abs(d)} day${Math.abs(d) !== 1 ? 's' : ''} overdue*`;
    const icon = d < 0 ? ':rotating_light:' : d === 0 ? ':warning:' : ':bell:';

    const body = {
      text: `${icon} Bill reminder: *${reminder.billDescription}* is due ${daysText}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${icon} *Bill Reminder*\n*${reminder.billDescription}* is due ${daysText}\n• Balance: *$${reminder.balance.toFixed(2)}*\n• Minimum due: *$${reminder.minimumDue.toFixed(2)}*`,
          },
        },
      ],
    };

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        console.error(`Slack webhook failed: ${res.status} ${await res.text()}`);
      } else {
        console.log(`Slack reminder sent for: ${reminder.billDescription}`);
      }
    } catch (error) {
      console.error('Error sending Slack notification:', error);
    }
  }
}

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

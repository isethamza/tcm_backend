import axios from 'axios';

export class AlertService {
  static async sendSlack(message: string) {
    if (!process.env.SLACK_WEBHOOK_URL) return;

    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: message,
      });
    } catch (err) {
      console.error('Slack alert failed', err);
    }
  }

  static async sendCritical(message: string) {
    console.error('🚨 CRITICAL:', message);

    await this.sendSlack(`🚨 ${message}`);

    // 👉 Optional: email fallback
    // await mailService.send(...)
  }
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
const axios_1 = require("axios");
class AlertService {
    static async sendSlack(message) {
        if (!process.env.SLACK_WEBHOOK_URL)
            return;
        try {
            await axios_1.default.post(process.env.SLACK_WEBHOOK_URL, {
                text: message,
            });
        }
        catch (err) {
            console.error('Slack alert failed', err);
        }
    }
    static async sendCritical(message) {
        console.error('🚨 CRITICAL:', message);
        await this.sendSlack(`🚨 ${message}`);
    }
}
exports.AlertService = AlertService;
//# sourceMappingURL=alert.service.js.map
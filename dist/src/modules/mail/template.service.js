"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTemplate = renderTemplate;
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const mjml_1 = require("mjml");
const cache = new Map();
const DEFAULT_LOCALE = 'en';
function renderTemplate(template, data, locale = DEFAULT_LOCALE) {
    const cacheKey = `${locale}:${template}`;
    if (!cache.has(cacheKey)) {
        let filePath = path.join(__dirname, '../templates', locale, `${template}.mjml`);
        if (!fs.existsSync(filePath)) {
            filePath = path.join(__dirname, '../templates', DEFAULT_LOCALE, `${template}.mjml`);
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        const compiled = Handlebars.compile(content);
        cache.set(cacheKey, compiled);
    }
    const compiled = cache.get(cacheKey);
    const mjmlContent = compiled(data);
    const { html, errors } = (0, mjml_1.default)(mjmlContent);
    if (errors?.length) {
        console.error('MJML errors:', errors);
    }
    return html;
}
//# sourceMappingURL=template.service.js.map
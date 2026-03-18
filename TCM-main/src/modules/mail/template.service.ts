import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import mjml2html from 'mjml';

const cache = new Map<string, Handlebars.TemplateDelegate>();

const DEFAULT_LOCALE = 'en';

export function renderTemplate(
  template: string,
  data: Record<string, any>,
  locale = DEFAULT_LOCALE,
) {
  const cacheKey = `${locale}:${template}`;

  if (!cache.has(cacheKey)) {
    let filePath = path.join(
      __dirname,
      '../templates',
      locale,
      `${template}.mjml`,
    );

    // 🔁 fallback to default locale
    if (!fs.existsSync(filePath)) {
      filePath = path.join(
        __dirname,
        '../templates',
        DEFAULT_LOCALE,
        `${template}.mjml`,
      );
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const compiled = Handlebars.compile(content);

    cache.set(cacheKey, compiled);
  }

  const compiled = cache.get(cacheKey)!;
  const mjmlContent = compiled(data);

  const { html, errors } = mjml2html(mjmlContent);

  if (errors?.length) {
    console.error('MJML errors:', errors);
  }

  return html;
}
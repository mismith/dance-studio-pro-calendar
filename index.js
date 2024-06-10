process.env.DEBUG = true;

import fs from 'fs/promises';
import { loadHtml, parseHtml, generateCalendar } from './functions/ical.js';

const ID = ``;

const html = process.env.DEBUG
  ? await fs.readFile('data/output.html', 'utf-8')
  : await loadHtml(ID);
if (process.env.DEBUG) {
  console.log(html);
  await fs.writeFile('data/output.html', html);
}

const data = process.env.DEBUG
  ? JSON.parse(await fs.readFile('data/output.json', 'utf-8'))
  : await parseHtml(html);
if (process.env.DEBUG) {
  const json = JSON.stringify(data, null, 2)
  console.log(json);
  await fs.writeFile('data/output.json', json);
}

const calendar = await generateCalendar(data);
console.log(calendar.toString());

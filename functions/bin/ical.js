const DEBUG = false;

import dotenv from 'dotenv';
import fs from 'fs/promises';
import { URLSearchParams } from 'url';
import { loadHtml, parseHtml, generateCalendar } from '../ical.js';

dotenv.config({ path: '../.env' });

const query = new URLSearchParams({
  id: '',
});

const html = DEBUG
  ? await fs.readFile('bin/data/output.html', 'utf-8')
  : await loadHtml(query);
if (DEBUG) {
  console.log(html);
  await fs.writeFile('bin/data/output.html', html);
}

const data = DEBUG
  ? JSON.parse(await fs.readFile('bin/data/output.json', 'utf-8'))
  : await parseHtml(html);
if (DEBUG) {
  const json = JSON.stringify(data, null, 2)
  console.log(json);
  await fs.writeFile('bin/data/output.json', json);
}

const calendar = await generateCalendar(data);
console.log(calendar.toString(), calendar.timezone());

process.env.TZ = 'UTC';

import { setGlobalOptions } from 'firebase-functions/v2';
import { onRequest, } from "firebase-functions/v2/https";

import { loadHtml, parseHtml, generateCalendar } from "./ical.js";

setGlobalOptions({ memory: '1GiB', timeoutSeconds: 240 });

export const ical = onRequest(async(request, response) => {
  const html = await loadHtml(request.query.id);
  const data = await parseHtml(html);
  const calendar = await generateCalendar(data);

  response.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  response.setHeader('Content-Disposition', 'attachment; filename="calendar.ics"');
  response.send(calendar.toString());
});

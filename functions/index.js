import { setGlobalOptions } from 'firebase-functions/v2';
import { onRequest, } from "firebase-functions/v2/https";

import { loadHtml, parseHtml, generateCalendar } from "./ical.js";

setGlobalOptions({ memory: '1GiB', timeoutSeconds: 60 });

export const classesJson = onRequest(async(request, response) => {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const html = await loadHtml(new URLSearchParams(request.query));
    const data = await parseHtml(html);

    response.send(JSON.stringify(data));
  } catch (error) {
    response.send(JSON.stringify({ error: error.message }));
  }
});

export const classesIcs = onRequest(async(request, response) => {
  response.setHeader('Content-Type', 'text/calendar; charset=utf-8');

  const html = await loadHtml(new URLSearchParams(request.query));
  const data = await parseHtml(html);
  const calendar = await generateCalendar(data);

  response.send(calendar.toString());
});

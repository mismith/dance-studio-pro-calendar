// process.env.TZ = 'America/Edmonton';

import fs from 'fs/promises';

const BASE_URL = 'https://dancestudio-pro.com'
// const URL = `${BASE_URL}/apps/api_classes.php?id=zaqlxajd29jd26406473a542ef09jasdklj21dx6406473a542f2`;

// import puppeteer from 'puppeteer';
// const browser = await puppeteer.launch();
// const page = await browser.newPage();

// await page.goto(URL);
// const html = await new Promise((resolve) => page.on('response', async(response) => {
//   const request = response.request();
//   if (request.url().includes('api_classes-ajax.php')){
//     const text = await response.text();
//     resolve(text)
//   }
// }));

// console.log(html);
// await await fs.writeFile('data/output.html', html);

// await browser.close()

/// --- ///

// const html = await fs.readFile('data/output.html', 'utf-8');
// console.log(html);

// import scrapeIt from 'scrape-it';
// const data = scrapeIt.scrapeHTML(`<div>${html}</div>`, {
//   title: 'h2',
//   classes: {
//     listItem: '#class_table > tbody > tr:not(:first-child)',
//     data: {
//       name: {
//         selector: '> td:nth-child(2) table td',
//         texteq: 0,
//       },
//       description: {
//         selector: '> td:nth-child(2) table td small ~ small',
//       },
//       date: {
//         selector: '> td:nth-child(3) small',
//         how: 'html',
//         convert: (text) => {
//           const chunks = text.split('<br>');
//           return {
//             day: chunks[0].trim(),
//             startTime: chunks[1].split(' to ')[0].trim(),
//             endTime: chunks[1].split(' to ')[1].trim(),
//           }
//         },
//       },
//       location: {
//         selector: '> td:nth-child(1)',
//         how: 'html',
//         convert: (text) => {
//           const chunks = text.split('<br>');
//           return {
//             name: chunks.length > 1 ? chunks[1] : chunks[0],
//             room: chunks.length > 1 ? chunks[0] : undefined,
//           }
//         },
//       },
//       instructor: {
//         selector: '> td:nth-child(2) table td small',
//         how: 'html',
//       },
//       link: {
//         selector: 'a[href]',
//         attr: 'href',
//         convert: (href) => `${BASE_URL}${href}`,
//       },
//     }
//   }
// });
// const json = JSON.stringify(data, null, 2)
// console.log(json);
// await fs.writeFile('data/output.json', json);

/// --- ///

const json = await fs.readFile('data/output.json', 'utf-8');
const data = JSON.parse(json);
console.log(json);

import ical from 'ical-generator';
const cal = ical({
  name: data.title || 'Dance Studio Pro Classes',
});

const now = new Date();
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function getEventDates(event) {
  const day = days.indexOf(event.date.day);
  const [startHour, startMin, startAMPM] = event.date.startTime.split(/[: ]/);
  const [endHour, endMin, endAMPM] = event.date.endTime.split(/[: ]/);
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay() + day,
    Number(startHour) + (startAMPM === 'PM' ? 12 : 0),
    Number(startMin),
    0,
    0,
  );
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay() + day,
    Number(endHour) + (endAMPM === 'PM' ? 12 : 0),
    Number(endMin),
    0,
    0,
  );
  return [start, end];
}
for (const event of data.classes) {
  const [start, end] = getEventDates(event);
  cal.createEvent({
    start,
    end,
    summary: event.name,
    description: event.description,
    location: `${event.location.name}${event.location.room ? ` - ${event.location.room}` : ''}`,
    url: event.link,
    repeating: {
      freq: 'WEEKLY',
    },
  });
}

console.log(cal.toString());
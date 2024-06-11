import 'dotenv/config';
import puppeteer from 'puppeteer';
import scrapeIt from 'scrape-it';
import ical from 'ical-generator';

const BASE_URL = 'https://dancestudio-pro.com';

export async function loadHtml(query) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`${BASE_URL}/apps/api_classes.php?${query.toString()}`);

  const element = await page.waitForSelector('body');
  const body = await element.evaluate(el => el.textContent);
  if (!body) {
    throw new Error('Not found')
  }

  const response = await page.waitForResponse((response) => response.url().includes('api_classes-ajax.php'));
  const html = await response.text();
  await browser.close()

  return html
}

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function getEventDates(event, now = new Date()) {
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
export async function parseHtml(html) {
  const data = scrapeIt.scrapeHTML(`<div>${html}</div>`, {
    title: 'h2',
    classes: {
      listItem: '#class_table > tbody > tr:not(:first-child)',
      data: {
        name: {
          selector: '> td:nth-child(2) table td',
          texteq: 0,
        },
        description: {
          selector: '> td:nth-child(2) table td small ~ small',
        },
        date: {
          selector: '> td:nth-child(3) small',
          how: 'html',
          convert: (text) => {
            const chunks = text.split('<br>');
            return {
              day: chunks[0].trim(),
              startTime: chunks[1].split(' to ')[0].trim(),
              endTime: chunks[1].split(' to ')[1].trim(),
            }
          },
        },
        location: {
          selector: '> td:nth-child(1)',
          how: 'html',
          convert: (text) => {
            const chunks = text.split('<br>');
            return {
              name: chunks.length > 1 ? chunks[1] : chunks[0],
              room: chunks.length > 1 ? chunks[0] : undefined,
            }
          },
        },
        instructor: {
          selector: '> td:nth-child(2) table td small',
          how: 'html',
        },
        link: {
          selector: 'a[href]',
          attr: 'href',
          convert: (href) => `${BASE_URL}${href}`,
        },
      }
    }
  });

  return data;
}

export async function generateCalendar(data) {
  const cal = ical({
    name: data.title || 'Dance Studio Pro Classes',
    timezone: process.env.TZ,
  });

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

  return cal;
}

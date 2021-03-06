#!/usr/bin/env node

/** Grab every tournament from GAR PR */
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.garpr.com/#/norcal/tournaments', {
    waitUntil: 'networkidle0'
  });

  const tourneyPages = await page.$$eval('.tournament_line a', links =>
    [].map.call(links, a => a.href)
  );

  for (const url of tourneyPages) {
    await page.goto(url, {waitUntil: 'networkidle0'});

    await page.waitForSelector('h3 a');
    const challonge = await page.$eval('h3 a', a => a.href);
    console.log(challonge);
  }

  await browser.close();
})();

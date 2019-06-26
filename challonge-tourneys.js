#!/usr/bin/env node
const process = require('process');
const puppeteer = require('puppeteer');

const organization = process.argv[2];
const orgUrl = `https://${organization}.challonge.com/tournaments`;
let tournamentUrls = [];

(async () => {
  let pageNum = 1;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(orgUrl);

  while (true) {
    // console.log(`Page ${pageNum}`);
    tournamentUrls = tournamentUrls.concat(
        await page.$$eval('.tournament-block a.cover', links => {
          return [].map.call(links, a => a.href);
        }));

    const [next] = await page.$x("//li[not(contains(@class, 'disabled'))]/a[.='Next']");

    if (!next) {
      for (const url of tournamentUrls) {
        console.log(url);
      }

      await browser.close();
      return;
    }

    await next.click();
    await page.waitForSelector('.tournament-block', {visible: true});
    await page.screenshot({path: 'example.png'});
    pageNum++;
  }

  await browser.close();
})();


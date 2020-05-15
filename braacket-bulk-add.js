#!/usr/bin/env node
const config = require('config');
const fs = require('fs');
const process = require('process');
const puppeteer = require('puppeteer');

async function login(page, credentials) {
  // Bring up login modal.
  const loginLinks = await page.$$('a[data-target="#login_modal"]');
  await loginLinks[1].click();
  await page.waitForSelector('#login_modal', {visible: true});

  await page.type('#username', credentials.username);
  await page.type('#password', credentials.password);

  try {
    await Promise.all([
        page.click('button[type=submit]'),
        page.waitForNavigation(),
    ]);
  } catch (e) {
    console.log('Login failed. Incorrect credentials?');
  }
}

function extractTournamentIds(url) {
  const re = /(\w+)?\.?challonge\.com\/([^/]+)/g;
  const match = re.exec(url);

  return {subdomain: match[1], id: match[2]};
}

function smashGgId(url) {
  const match = url.match('/tournament/([^/]+)/events/([^/]+)');
  return {
    'id': match[1],
    'event': match[2],
  };
}

async function addTournament(page, league, url) {
  await page.goto(`https://braacket.com/tournament/import/challonge?league=${league}`);
  // TODO: Check if challonge or smash.gg.
  const tournament = extractTournamentIds(url);

  await page.type('#tournament', tournament.id);

  if (tournament.subdomain) {
    await page.type('#subdomain', tournament.subdomain);
  }

  // Set relevant settings.
  await page.click('#exclude_dq');
  await page.click('#admin_league_inherit');

  await Promise.all([
      page.click('button[data-redirect_value="league_player_import"]'),
      page.waitForNavigation(),
  ]);

  // Import all players into the league.
  await page.click('.my-table-checkbox-check_all');

  // TODO: This method (as is) will miss some players. This *should*
  // click 'Save and next page' if it's not disabled.

  // Save changes.
  await Promise.all([
      page.click('button[data-redirect_value="default"]'),
      page.waitForNavigation(),
  ]);
}

// This is bad, but that's ok.
const tournamentUrls = fs.readFileSync(process.argv[2])
  .toString().match(/^.+$/gm);

(async () => {
  const credentials = config.get('credentials');

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://braacket.com');

  await login(page, credentials);

  for (const url of tournamentUrls) {
    console.log(`Adding: ${url}`);
    await addTournament(page, credentials.league, url);
  }

  await browser.close();
})();

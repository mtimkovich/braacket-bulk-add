const config = require('config');
const puppeteer = require('puppeteer');

// This function is only for debugging.
function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

async function login(page, credentials) {
  // Click login button.
  const loginLinks = await page.$$('a[data-target="#login_modal"]');
  await loginLinks[1].click();
  await page.waitForSelector('#login_modal', {visible: true});

  await page.type('#username', credentials.username);
  await page.type('#password', credentials.password);

  await page.click('button[type=submit]');

  // TODO: Error checking.
  await page.waitForNavigation();
}

function extractTournamentIds(url) {
  const re = /(\w+)?\.?challonge\.com\/([^/]+)/g;
  const match = re.exec(url);

  return {subdomain: match[1], id: match[2]};
}

async function addTournament(page, league, url) {
  await page.goto(`https://braacket.com/tournament/import/challonge?league=${league}`);
  const tournament = extractTournamentIds(url);

  await page.type('#tournament', tournament.id);

  if (tournament.subdomain) {
    await page.type('#subdomain', tournament.subdomain);
  }

  // Set relevant settings.
  await page.click('#exclude_dqs');
  await page.click('#admin_league_inherit');

  await page.click('button[data-redirect_value="league_player_import"]');
  await page.waitForNavigation();

  await page.click('.my-table-checkbox-check_all')
  await page.click('button[data-redirect_value="default"]');
  await page.waitForNavigation();
}

const credentials = config.get('credentials');

// TODO: Take in a list of URLs as arguments.
const url = 'https://mtvmelee.challonge.com/119_amateur';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://braacket.com');

  await login(page, credentials);

  await addTournament(page, credentials.league, url);
  await page.screenshot({path: 'example.png'});

  await browser.close();
})();

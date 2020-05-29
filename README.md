# Braacket Bulk Add

Bulk import tournaments into [Braacket](https://braacket.com). Supports both Challonge and Smash.gg brackets.

## Install

```
npm install
```

### Dependencies

* [Puppeteer](https://pptr.dev/) - Used to automate a browser.

## Usage

Fill out `config/default.json` with your Braacket credentials and league name.

```
node braacket-bulk-add.js FILE
```

Where `FILE` is a newline-separated list of tournament URLs.

### challonge-tourneys.js

The `challonge-tourneys.js` script can be used to get a list of all
tournaments created by a Challonge organization.

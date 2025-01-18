const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const puppeteer = require('puppeteer');

const inputFilePath = 'inputurls.csv';
const outputFilePath = 'output.csv';

const csvWriter = createCsvWriter({
  path: outputFilePath,
  header: [
    { id: 'OriginalURL', title: 'OriginalURL' },
    { id: 'RedirectedURL', title: 'RedirectedURL' },
    { id: 'ListofFontNames', title: 'ListofFontNames' },
    { id: 'ListOfFontUrls', title: 'ListOfFontUrls' }
  ]
});

async function getFontInfo(url) {
  console.log(`Processing URL: ${url}`);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const fontUrls = new Set();

  page.on('response', response => {
    const url = response.url();
    if (url.match(/\.(woff2?|ttf|otf|eot)$/)) {
      fontUrls.add(url);
    }
  });

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle2' });
    const redirectedURL = response.url();

    const fontNames = Array.from(fontUrls).map(fontUrl => {
      const fontNameMatch = fontUrl.match(/\/([^/]+)\.(woff2?|ttf|otf|eot)/);
      return fontNameMatch ? fontNameMatch[1] : '';
    }).join(', ');

    await browser.close();

    return {
      OriginalURL: url,
      RedirectedURL: redirectedURL,
      ListofFontNames: fontNames,
      ListOfFontUrls: Array.from(fontUrls).join(', ')
    };
  } catch (error) {
    console.error(`Error processing URL: ${url}`, error);
    await browser.close();
    return {
      OriginalURL: url,
      RedirectedURL: '',
      ListofFontNames: '',
      ListOfFontUrls: ''
    };
  }
}

async function processUrls() {
  const urls = [];
  fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on('data', (row) => {
      urls.push(row.URL);
    })
    .on('end', async () => {
      const results = [];
      for (const url of urls) {
        const result = await getFontInfo(url);
        results.push(result);
      }
      await csvWriter.writeRecords(results);
      console.log('CSV file written successfully');
    });
}

processUrls();
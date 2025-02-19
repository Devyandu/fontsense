const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const puppeteer = require('puppeteer');

const inputFilePath = 'inputurls.txt';
const outputFilePath = 'output.csv';

const csvWriter = createCsvWriter({
  path: outputFilePath,
  header: [
    { id: 'OriginalURL', title: 'OriginalURL' },
    { id: 'FontFound', title: 'FontFound' },
    { id: 'RedirectedURL', title: 'RedirectedURL' },
    { id: 'Status', title: 'Status' },
    { id: 'StatusMessage', title: 'StatusMessage' },
    { id: 'ListofFontNames', title: 'ListofFontNames' },
    { id: 'ListOfFontUrls', title: 'ListOfFontUrls' }
  ]
});

async function getFontInfo(url, index, total) {
  console.log(`Processing URL: ${url} (Processing ${index + 1} of ${total} URLs)`);
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
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 7000 }); // Set timeout to 10 seconds
    const redirectedURL = response.url();

    const fontNames = Array.from(fontUrls).map(fontUrl => {
      const fontNameMatch = fontUrl.match(/\/([^/]+)\.(woff2?|ttf|otf|eot)/);
      return fontNameMatch ? fontNameMatch[1] : '';
    }).join(', ');

    const fontFound = [];
    if (Array.from(fontUrls).some(fontUrl => fontUrl.toLowerCase().includes('gotham'))) {
      fontFound.push('Gotham');
    }
    if (Array.from(fontUrls).some(fontUrl => fontUrl.toLowerCase().includes('avenir'))) {
      fontFound.push('Avenir');
    }

    await browser.close();

    return {
      OriginalURL: url,
      FontFound: fontFound.join(', '),
      RedirectedURL: redirectedURL,
      Status: 'Success',
      StatusMessage: 'Page retrieved successfully',
      ListofFontNames: fontNames,
      ListOfFontUrls: Array.from(fontUrls).join(', ')
    };
  } catch (error) {
    console.error(`Error processing URL: ${url}`, error);
    await browser.close();
    return {
      OriginalURL: url,
      FontFound: '',
      RedirectedURL: '',
      Status: 'Error',
      StatusMessage: error.message,
      ListofFontNames: '',
      ListOfFontUrls: ''
    };
  }
}

async function processUrls() {
  const urls = fs.readFileSync(inputFilePath, 'utf-8').split('\n').filter(Boolean);
  const totalUrls = urls.length;
  const results = [];
  for (let i = 0; i < totalUrls; i++) {
    const url = urls[i];
    let validUrl = url;
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }
    const result = await getFontInfo(validUrl, i, totalUrls);
    results.push(result);
  }
  await csvWriter.writeRecords(results);
  console.log('CSV file written successfully');
}

processUrls();
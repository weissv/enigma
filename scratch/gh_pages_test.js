import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push('CONSOLE ERROR: ' + msg.text());
    }
  });
  page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.toString()));
  page.on('requestfailed', request => {
    errors.push(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
  });
  
  console.log('Navigating to https://weissv.github.io/enigma/');
  const response = await page.goto('https://weissv.github.io/enigma/', { waitUntil: 'networkidle0' });
  
  if (!response.ok()) {
    console.log(`Failed to load page. Status: ${response.status()}`);
  } else {
    console.log('Page loaded successfully with status 200.');
  }
  
  // Verify WebAssembly initialized (if applicable, the app should be mounted)
  const appHeader = await page.$('.app-header');
  if (appHeader) {
    console.log('App header found, React mounted successfully.');
  } else {
    console.log('App header NOT found. React failed to mount.');
  }
  
  // Check WASM engine if possible
  const canType = await page.$('textarea#input-text');
  if (canType) {
    await page.type('textarea#input-text', 'HELLO');
    await new Promise(r => setTimeout(r, 1000));
    const output = await page.$eval('textarea#output-text', el => el.value);
    console.log(`Typed "HELLO", output is: "${output}"`);
    if (output && output.length > 0) {
      console.log('Encryption engine (WASM) is working properly.');
    } else {
      console.log('Encryption output is empty. Engine might have failed.');
    }
  }
  
  if (errors.length > 0) {
    console.log('ERRORS DETECTED:');
    errors.forEach(e => console.log(e));
  } else {
    console.log('NO ERRORS DETECTED.');
  }
  
  await browser.close();
})();

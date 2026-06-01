import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Capture all console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.app-header');
  console.log('App loaded.');
  
  // Click SOUND ON
  const soundBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sound:') || b.textContent.includes('Звук:'));
  });
  if (soundBtn) {
    await soundBtn.click();
    console.log('Clicked SOUND ON');
  }
  
  // Type text to trigger sound
  await page.type('textarea#input-text', 'HELLO');
  
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
  console.log('Done.');
})();

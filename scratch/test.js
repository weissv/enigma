import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.app-header');
  
  console.log('App loaded.');
  
  // Switch to M4
  const m4Btn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('M4 KRIEGSMARINE'));
  });
  if (m4Btn) {
    await m4Btn.click();
    console.log('Clicked M4 Kriegsmarine');
  }
  
  await new Promise(r => setTimeout(r, 500));
  
  // Check selects
  const selectsText = await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('.select'));
    return selects.map(s => s.options[s.selectedIndex].text);
  });
  console.log('Selects text:', selectsText);
  
  // Click SOUND ON
  const soundBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sound:') || b.textContent.includes('Звук:'));
  });
  if (soundBtn) {
    await soundBtn.click();
    console.log('Clicked SOUND ON');
  }
  
  // Type text
  await page.type('textarea#input-text', 'HELLO');
  
  await new Promise(r => setTimeout(r, 500));
  
  // Verify sound context
  const audioState = await page.evaluate(() => {
    return window.__soundEngine?.ctx?.state;
  });
  console.log('Audio Context State:', audioState);
  
  await browser.close();
})();

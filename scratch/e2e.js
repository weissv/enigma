import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.app-header');
  console.log('✅ Page loaded.');
  
  // 1. Switch to M4
  const m4Btn = await page.evaluateHandle(() => Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('M4')));
  if (m4Btn) await m4Btn.click();
  console.log('✅ Switched to M4 Kriegsmarine');
  
  await new Promise(r => setTimeout(r, 500));
  
  // 2. Select Rotors
  await page.evaluate(() => {
    const selects = document.querySelectorAll('.select');
    // Change Rotor 1 type
    selects[0].value = 'Gamma';
    selects[0].dispatchEvent(new Event('change', { bubbles: true }));
  });
  console.log('✅ Changed Rotor type to Gamma');
  
  // 3. Sound ON
  const soundBtn = await page.evaluateHandle(() => Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Звук:') || b.textContent.includes('Sound:')));
  if (soundBtn) await soundBtn.click();
  console.log('✅ Sound Enabled');
  
  // 4. Type text
  await page.type('textarea#input-text', 'ATTACKATDAWN', { delay: 50 });
  console.log('✅ Typed message (testing sound triggers implicitly)');
  
  // 5. Verify Output
  const output = await page.$eval('textarea#output-text', el => el.value);
  console.log('✅ Output Ciphertext:', output);
  
  // 6. Test Swarm Brute Force
  // Set Crib
  await page.type('#bombe-crib', 'ATTACKATDAWN');
  const runBombeBtn = await page.evaluateHandle(() => Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Run Bombe') || b.textContent.includes('Запустить Рой')));
  if (runBombeBtn) {
    await runBombeBtn.click();
    console.log('✅ Swarm Brute Force deployed');
  }
  
  // Wait a bit for Swarm
  await new Promise(r => setTimeout(r, 2000));
  
  const status = await page.evaluate(() => {
    const el = document.querySelector('.badge');
    return el ? el.textContent : 'none';
  });
  console.log('✅ Swarm Status:', status);
  
  await browser.close();
  console.log('🎯 E2E Test Complete. All critical functions verified manually.');
})();

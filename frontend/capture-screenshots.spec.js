const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  console.log('Navigating to landing page...');
  await page.goto('http://localhost:3000');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Wait for animations
  
  // Take screenshots
  console.log('Capturing full page screenshot...');
  await page.screenshot({ path: 'landing-page-full.png', fullPage: true });
  
  console.log('Capturing hero section...');
  await page.screenshot({ 
    path: 'landing-page-hero.png', 
    clip: { x: 0, y: 0, width: 1920, height: 800 }
  });
  
  // Scroll to gallery section
  console.log('Capturing gallery section...');
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'landing-page-gallery.png' });
  
  // Scroll to rarity section
  console.log('Capturing rarity section...');
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'landing-page-rarity.png' });
  
  // Scroll to unique section
  console.log('Capturing unique features section...');
  await page.evaluate(() => window.scrollTo(0, 2800));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'landing-page-unique.png' });
  
  console.log('All screenshots captured successfully!');
  
  await browser.close();
})();
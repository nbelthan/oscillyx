const { test, expect } = require('@playwright/test');

test.describe('Revolutionary Blockchain Physics Landing Page', () => {
  test('should show updated blockchain physics content', async ({ page }) => {
    // Navigate to the live Vercel deployment
    await page.goto('https://oscillyx.art', { waitUntil: 'networkidle' });
    
    console.log('🚀 Testing Revolutionary Blockchain Physics Landing Page');
    
    // Test 1: Check main hero title is updated
    console.log('📋 Test 1: Checking hero title...');
    await expect(page.locator('h1')).toContainText('OSCILLYX');
    
    // Test 2: Check for blockchain physics messaging
    console.log('📋 Test 2: Checking blockchain physics messaging...');
    await expect(page.locator('text=BLOCKCHAIN PHYSICS')).toBeVisible();
    await expect(page.locator('text=MATHEMATICAL RARITY')).toBeVisible();
    
    // Test 3: Check for "WORLD'S FIRST" messaging
    console.log('📋 Test 3: Checking world\'s first positioning...');
    await expect(page.locator('text=WORLD\'S FIRST')).toBeVisible();
    
    // Test 4: Check for blockchain characteristics messaging
    console.log('📋 Test 4: Checking blockchain characteristics...');
    await expect(page.locator('text=hash entropy')).toBeVisible();
    await expect(page.locator('text=temporal significance')).toBeVisible();
    await expect(page.locator('text=position uniqueness')).toBeVisible();
    
    // Test 5: Check rarity tier section exists
    console.log('📋 Test 5: Checking rarity tiers section...');
    await expect(page.locator('text=BLOCKCHAIN PHYSICS RARITY TIERS')).toBeVisible();
    
    // Test 6: Check for specific rarity tier names
    console.log('📋 Test 6: Checking rarity tier names...');
    await expect(page.locator('text=Network Pulse')).toBeVisible();
    await expect(page.locator('text=Block Echo')).toBeVisible();
    await expect(page.locator('text=Digital Moment')).toBeVisible();
    await expect(page.locator('text=Chain Resonance')).toBeVisible();
    await expect(page.locator('text=Genesis Hash')).toBeVisible();
    await expect(page.locator('text=Network Apex')).toBeVisible();
    
    // Test 7: Check for mathematical rarity formula
    console.log('📋 Test 7: Checking mathematical formula...');
    await expect(page.locator('text=MATHEMATICAL RARITY')).toBeVisible();
    await expect(page.locator('text=Hash Entropy × 40%')).toBeVisible();
    
    // Test 8: Check that old content is NOT present
    console.log('📋 Test 8: Verifying old content removed...');
    await expect(page.locator('text=Electric Blue')).not.toBeVisible();
    await expect(page.locator('text=Plasma Purple')).not.toBeVisible();
    await expect(page.locator('text=ONE STYLE • INFINITE COLORS')).not.toBeVisible();
    await expect(page.locator('text=20 distinct color palettes')).not.toBeVisible();
    
    // Test 9: Check revolutionary messaging in CTA
    console.log('📋 Test 9: Checking CTA section...');
    await expect(page.locator('text=BLOCKCHAIN PHYSICS REVOLUTION')).toBeVisible();
    
    // Test 10: Check for on-chain generation messaging
    console.log('📋 Test 10: Checking on-chain messaging...');
    await expect(page.locator('text=100% on-chain SVG generation')).toBeVisible();
    await expect(page.locator('text=cryptographically verifiable')).toBeVisible();
    
    console.log('✅ All tests passed! Revolutionary blockchain physics content confirmed!');
  });
  
  test('should show working contract address', async ({ page }) => {
    await page.goto('https://oscillyx.art', { waitUntil: 'networkidle' });
    
    console.log('🔗 Testing contract address...');
    
    // Check for our working contract address
    const contractLink = page.locator('a[href*="0x38717Ec3843AF99EA2789AfDff9e4c129d0A2F95"]');
    await expect(contractLink).toBeVisible();
    
    console.log('✅ Working contract address confirmed!');
  });
  
  test('should have proper visual elements for rarity tiers', async ({ page }) => {
    await page.goto('https://oscillyx.art', { waitUntil: 'networkidle' });
    
    console.log('🎨 Testing visual elements...');
    
    // Check for rarity tier visual previews (circles)
    const rarityCards = page.locator('[class*="border"]').filter({
      has: page.locator('text=Network Pulse, text=Block Echo, text=Digital Moment')
    });
    
    // Should have multiple rarity tier cards
    await expect(rarityCards.first()).toBeVisible();
    
    // Check for physics explanations
    await expect(page.locator('text=Physics:')).toBeVisible();
    await expect(page.locator('text=Visual:')).toBeVisible();
    
    console.log('✅ Visual elements confirmed!');
  });
});
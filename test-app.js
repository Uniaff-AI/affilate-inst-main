#!/usr/bin/env node

/**
 * Test Script for Instagram Affiliate App
 * Tests registration, user creation, and video functionality
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

class AppTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async init() {
    console.log('🚀 Initializing app tester...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Set up error handling
    this.page.on('error', err => {
      console.error('❌ Page error:', err);
    });
    
    this.page.on('pageerror', err => {
      console.error('❌ Page error:', err);
    });
  }

  async testRegistration() {
    console.log('\n📝 Testing User Registration...');
    
    try {
      await this.page.goto('http://localhost:3000/login', {
        waitUntil: 'networkidle0',
        timeout: 10000
      });

      // Switch to register tab
      const registerTab = await this.page.$('button:has-text("Register")');
      if (registerTab) {
        await registerTab.click();
        await this.page.waitForTimeout(1000);
      }

      // Fill registration form
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      const testName = 'Test User';

      await this.page.type('input[placeholder*="email" i], input[type="email"]', testEmail);
      await this.page.type('input[type="password"]', testPassword);
      await this.page.type('input[placeholder*="name" i]', testName);

      // Submit form
      const submitBtn = await this.page.$('button:has-text("Create account")');
      if (submitBtn) {
        await submitBtn.click();
        await this.page.waitForTimeout(3000);
      }

      // Check if redirected to dashboard
      const currentUrl = this.page.url();
      const isOnDashboard = currentUrl.includes('/dashboard') || currentUrl.includes('/onboarding');
      
      this.testResults.push({
        test: 'User Registration',
        passed: isOnDashboard,
        details: `Registered with email: ${testEmail}, redirected to: ${currentUrl}`
      });

      console.log(`✅ Registration test: ${isOnDashboard ? 'PASSED' : 'FAILED'}`);
      
      return { email: testEmail, password: testPassword, name: testName };
      
    } catch (error) {
      console.error('❌ Registration test failed:', error.message);
      this.testResults.push({
        test: 'User Registration',
        passed: false,
        error: error.message
      });
      return null;
    }
  }

  async testDashboard(userInfo) {
    if (!userInfo) return;
    
    console.log('\n🏠 Testing Dashboard...');
    
    try {
      await this.page.goto('http://localhost:3000/dashboard', {
        waitUntil: 'networkidle0',
        timeout: 10000
      });

      // Check if dashboard loads
      const dashboardContent = await this.page.$('main, .card, .bg-white');
      const hasContent = !!dashboardContent;
      
      // Check for partner information
      const partnerInfo = await this.page.$('text=My Instagram Account, text=My Referral Links');
      const hasPartnerInfo = !!partnerInfo;
      
      this.testResults.push({
        test: 'Dashboard Loading',
        passed: hasContent,
        details: `Dashboard content loaded: ${hasContent}`
      });

      this.testResults.push({
        test: 'Partner Information',
        passed: hasPartnerInfo,
        details: `Partner info displayed: ${hasPartnerInfo}`
      });

      console.log(`✅ Dashboard test: ${hasContent ? 'PASSED' : 'FAILED'}`);
      console.log(`✅ Partner info test: ${hasPartnerInfo ? 'PASSED' : 'FAILED'}`);
      
    } catch (error) {
      console.error('❌ Dashboard test failed:', error.message);
      this.testResults.push({
        test: 'Dashboard Loading',
        passed: false,
        error: error.message
      });
    }
  }

  async testMaterials() {
    console.log('\n📁 Testing Materials Page...');
    
    try {
      await this.page.goto('http://localhost:3000/materials', {
        waitUntil: 'networkidle0',
        timeout: 10000
      });

      // Check if materials page loads
      const materialsContent = await this.page.$('main, .card, .bg-white');
      const hasContent = !!materialsContent;
      
      // Check for video previews
      const videoPreviews = await this.page.$$('.aspect-\\[9\\/16\\], .bg-gradient-to-b');
      const hasVideoPreviews = videoPreviews.length > 0;
      
      this.testResults.push({
        test: 'Materials Page Loading',
        passed: hasContent,
        details: `Materials page loaded: ${hasContent}`
      });

      this.testResults.push({
        test: 'Video Previews',
        passed: hasVideoPreviews,
        details: `Video previews found: ${videoPreviews.length}`
      });

      console.log(`✅ Materials page test: ${hasContent ? 'PASSED' : 'FAILED'}`);
      console.log(`✅ Video previews test: ${hasVideoPreviews ? 'PASSED' : 'FAILED'}`);
      
    } catch (error) {
      console.error('❌ Materials test failed:', error.message);
      this.testResults.push({
        test: 'Materials Page Loading',
        passed: false,
        error: error.message
      });
    }
  }

  async testMobileResponsiveness() {
    console.log('\n📱 Testing Mobile Responsiveness...');
    
    const devices = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'Galaxy S20', width: 360, height: 800 },
      { name: 'iPad', width: 768, height: 1024 }
    ];

    for (const device of devices) {
      try {
        await this.page.setViewport({
          width: device.width,
          height: device.height,
          deviceScaleFactor: 1,
          isMobile: device.width < 768,
          hasTouch: device.width < 768
        });

        await this.page.goto('http://localhost:3000/dashboard', {
          waitUntil: 'networkidle0',
          timeout: 10000
        });

        // Take screenshot
        const screenshotPath = `./test-screenshots/${device.name.replace(/\s+/g, '_')}_dashboard.png`;
        await this.page.screenshot({ path: screenshotPath, fullPage: true });

        // Check responsive behavior
        const isMobile = device.width < 768;
        const hasMobileLayout = await this.page.evaluate(() => {
          const cards = document.querySelectorAll('.card, .bg-white');
          if (cards.length === 0) return false;
          
          // Check if cards are stacked (mobile) or side by side (desktop)
          const firstCard = cards[0];
          const rect = firstCard.getBoundingClientRect();
          const isStacked = rect.width >= window.innerWidth * 0.9; // Card takes most of screen width
          
          return isMobile ? isStacked : !isStacked;
        });

        this.testResults.push({
          test: `Mobile Responsiveness - ${device.name}`,
          passed: hasMobileLayout,
          details: `${device.name} (${device.width}x${device.height}): Layout ${hasMobileLayout ? 'correct' : 'incorrect'}`
        });

        console.log(`✅ ${device.name} test: ${hasMobileLayout ? 'PASSED' : 'FAILED'}`);
        
      } catch (error) {
        console.error(`❌ ${device.name} test failed:`, error.message);
        this.testResults.push({
          test: `Mobile Responsiveness - ${device.name}`,
          passed: false,
          error: error.message
        });
      }
    }
  }

  async generateReport() {
    console.log('\n📊 Generating test report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.testResults.length,
        passedTests: this.testResults.filter(t => t.passed).length,
        failedTests: this.testResults.filter(t => !t.passed).length
      },
      results: this.testResults
    };
    
    // Create screenshots directory
    if (!fs.existsSync('./test-screenshots')) {
      fs.mkdirSync('./test-screenshots');
    }
    
    // Save report
    const reportPath = './test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`📸 Screenshots saved to: ./test-screenshots/`);
    
    // Print summary
    console.log('\n📋 Test Summary:');
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passedTests}`);
    console.log(`Failed: ${report.summary.failedTests}`);
    
    // Print failed tests
    const failedTests = this.testResults.filter(t => !t.passed);
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`- ${test.test}: ${test.error || test.details}`);
      });
    }
    
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function main() {
  const tester = new AppTester();
  
  try {
    await tester.init();
    
    console.log('🔧 Starting app testing...');
    console.log('Make sure the app is running on http://localhost:3000');
    
    // Test registration
    const userInfo = await tester.testRegistration();
    
    // Test dashboard
    await tester.testDashboard(userInfo);
    
    // Test materials page
    await tester.testMaterials();
    
    // Test mobile responsiveness
    await tester.testMobileResponsiveness();
    
    // Generate report
    await tester.generateReport();
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
  } finally {
    await tester.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = AppTester; 
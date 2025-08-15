#!/usr/bin/env node

/**
 * Mobile Testing Script for Instagram Affiliate App
 * This script helps automate mobile testing by providing various device presets
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Device presets for testing
const DEVICES = {
  'iPhone SE': {
    width: 375,
    height: 667,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  },
  'iPhone 12 Pro': {
    width: 390,
    height: 844,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  },
  'iPhone 12 Pro Max': {
    width: 428,
    height: 926,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  },
  'Galaxy S20': {
    width: 360,
    height: 800,
    userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36'
  },
  'iPad': {
    width: 768,
    height: 1024,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  },
  'iPad Pro': {
    width: 1024,
    height: 1366,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  }
};

// Test scenarios
const TEST_SCENARIOS = [
  {
    name: 'Dashboard Page',
    path: '/dashboard',
    checks: [
      'Header is visible and properly sized',
      'Tab navigation is accessible',
      'Cards are properly stacked on mobile',
      'Statistics grid is responsive',
      'Settings section is readable'
    ]
  },
  {
    name: 'Statistics Page',
    path: '/subscribers',
    checks: [
      'KPI cards are properly sized',
      'Tables are scrollable if needed',
      'Action buttons are touch-friendly',
      'Charts are mobile-optimized'
    ]
  },
  {
    name: 'Materials Page',
    path: '/materials',
    checks: [
      'Reel cards are properly sized',
      'Download buttons are accessible',
      'Grid layout is responsive',
      'Preview images are visible'
    ]
  },
  {
    name: 'Login Page',
    path: '/login',
    checks: [
      'Form inputs are properly sized',
      'Buttons are touch-friendly',
      'Error messages are visible',
      'Layout doesn\'t break on small screens'
    ]
  }
];

class MobileTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
  }

  async init() {
    console.log('🚀 Initializing mobile tester...');
    
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

  async testDevice(deviceName, deviceConfig) {
    console.log(`\n📱 Testing on ${deviceName} (${deviceConfig.width}x${deviceConfig.height})`);
    
    await this.page.setViewport({
      width: deviceConfig.width,
      height: deviceConfig.height,
      deviceScaleFactor: 1,
      isMobile: deviceConfig.width < 768,
      hasTouch: deviceConfig.width < 768
    });
    
    await this.page.setUserAgent(deviceConfig.userAgent);
    
    const deviceResults = {
      device: deviceName,
      config: deviceConfig,
      scenarios: []
    };
    
    for (const scenario of TEST_SCENARIOS) {
      console.log(`  🔍 Testing: ${scenario.name}`);
      
      try {
        await this.page.goto(`http://localhost:3000${scenario.path}`, {
          waitUntil: 'networkidle0',
          timeout: 10000
        });
        
        // Wait for content to load
        await this.page.waitForTimeout(2000);
        
        // Take screenshot
        const screenshotPath = `./screenshots/${deviceName.replace(/\s+/g, '_')}_${scenario.name.replace(/\s+/g, '_')}.png`;
        await this.page.screenshot({ 
          path: screenshotPath, 
          fullPage: true 
        });
        
        // Basic checks
        const checks = await this.performChecks(scenario);
        
        deviceResults.scenarios.push({
          name: scenario.name,
          path: scenario.path,
          screenshot: screenshotPath,
          checks,
          passed: checks.every(check => check.passed)
        });
        
        console.log(`    ✅ ${scenario.name} - Screenshot saved`);
        
      } catch (error) {
        console.error(`    ❌ ${scenario.name} - Error:`, error.message);
        
        deviceResults.scenarios.push({
          name: scenario.name,
          path: scenario.path,
          error: error.message,
          passed: false
        });
      }
    }
    
    this.results.push(deviceResults);
  }

  async performChecks(scenario) {
    const checks = [];
    
    try {
      // Check if page loaded
      const title = await this.page.title();
      checks.push({
        name: 'Page Title',
        passed: title.includes('Instagram Affiliate'),
        value: title
      });
      
      // Check if content is visible
      const content = await this.page.$('main, .card, .bg-white');
      checks.push({
        name: 'Content Visible',
        passed: !!content,
        value: !!content
      });
      
      // Check responsive behavior
      const viewport = await this.page.viewport();
      const isMobile = viewport.width < 768;
      
      if (isMobile) {
        // Check for mobile-specific elements
        const mobileElements = await this.page.$$('.sm\\:hidden, .md\\:hidden, .lg\\:hidden');
        checks.push({
          name: 'Mobile Elements',
          passed: mobileElements.length > 0,
          value: `${mobileElements.length} mobile elements found`
        });
      }
      
      // Check for touch-friendly buttons
      const buttons = await this.page.$$('button, .btn-primary, a[role="button"]');
      const touchFriendlyButtons = [];
      
      for (const button of buttons) {
        const box = await button.boundingBox();
        if (box && box.height >= 44 && box.width >= 44) {
          touchFriendlyButtons.push(button);
        }
      }
      
      checks.push({
        name: 'Touch-Friendly Buttons',
        passed: touchFriendlyButtons.length > 0,
        value: `${touchFriendlyButtons.length} touch-friendly buttons found`
      });
      
    } catch (error) {
      checks.push({
        name: 'Check Performance',
        passed: false,
        error: error.message
      });
    }
    
    return checks;
  }

  async generateReport() {
    console.log('\n📊 Generating test report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDevices: this.results.length,
        totalScenarios: this.results.reduce((acc, device) => acc + device.scenarios.length, 0),
        passedScenarios: this.results.reduce((acc, device) => 
          acc + device.scenarios.filter(s => s.passed).length, 0
        )
      },
      results: this.results
    };
    
    // Create screenshots directory if it doesn't exist
    if (!fs.existsSync('./screenshots')) {
      fs.mkdirSync('./screenshots');
    }
    
    // Save report
    const reportPath = './mobile-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`📸 Screenshots saved to: ./screenshots/`);
    
    // Print summary
    console.log('\n📋 Test Summary:');
    console.log(`Total Devices: ${report.summary.totalDevices}`);
    console.log(`Total Scenarios: ${report.summary.totalScenarios}`);
    console.log(`Passed: ${report.summary.passedScenarios}`);
    console.log(`Failed: ${report.summary.totalScenarios - report.summary.passedScenarios}`);
    
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function main() {
  const tester = new MobileTester();
  
  try {
    await tester.init();
    
    console.log('🔧 Starting mobile testing...');
    console.log('Make sure the app is running on http://localhost:3000');
    
    // Test each device
    for (const [deviceName, deviceConfig] of Object.entries(DEVICES)) {
      await tester.testDevice(deviceName, deviceConfig);
    }
    
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

module.exports = MobileTester; 
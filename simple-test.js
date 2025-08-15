#!/usr/bin/env node

/**
 * Simple Test Script for Instagram Affiliate App
 * Tests basic functionality without external dependencies
 */

const fs = require('fs');
const path = require('path');

class SimpleTester {
  constructor() {
    this.testResults = [];
  }

  async testFileStructure() {
    console.log('\n📁 Testing File Structure...');
    
    const requiredFiles = [
      'apps/web/app/dashboard/page.tsx',
      'apps/web/app/subscribers/page.tsx',
      'apps/web/app/materials/page.tsx',
      'apps/web/app/(auth)/login/page.tsx',
      'apps/web/app/globals.css',
      'apps/web/tailwind.config.ts'
    ];

    for (const file of requiredFiles) {
      const exists = fs.existsSync(file);
      this.testResults.push({
        test: `File exists: ${file}`,
        passed: exists,
        details: exists ? 'File found' : 'File missing'
      });
      
      console.log(`${exists ? '✅' : '❌'} ${file}`);
    }
  }

  async testMobileOptimization() {
    console.log('\n📱 Testing Mobile Optimization...');
    
    const files = [
      'apps/web/app/globals.css',
      'apps/web/app/mobile.css',
      'apps/web/app/dashboard/page.tsx'
    ];

    for (const file of files) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for mobile-specific CSS
        const hasMobileCSS = content.includes('@media') || content.includes('sm:') || content.includes('md:');
        this.testResults.push({
          test: `Mobile CSS in ${path.basename(file)}`,
          passed: hasMobileCSS,
          details: hasMobileCSS ? 'Mobile CSS found' : 'No mobile CSS'
        });
        
        console.log(`${hasMobileCSS ? '✅' : '❌'} Mobile CSS in ${path.basename(file)}`);
      }
    }
  }

  async testResponsiveDesign() {
    console.log('\n🎨 Testing Responsive Design...');
    
    const dashboardFile = 'apps/web/app/dashboard/page.tsx';
    if (fs.existsSync(dashboardFile)) {
      const content = fs.readFileSync(dashboardFile, 'utf8');
      
      // Check for responsive classes
      const hasResponsiveClasses = content.includes('sm:') || content.includes('md:') || content.includes('lg:');
      const hasMobileFirst = content.includes('px-2 sm:px-3') || content.includes('text-sm sm:text-base');
      
      this.testResults.push({
        test: 'Responsive Tailwind Classes',
        passed: hasResponsiveClasses,
        details: hasResponsiveClasses ? 'Responsive classes found' : 'No responsive classes'
      });
      
      this.testResults.push({
        test: 'Mobile-First Approach',
        passed: hasMobileFirst,
        details: hasMobileFirst ? 'Mobile-first classes found' : 'No mobile-first approach'
      });
      
      console.log(`${hasResponsiveClasses ? '✅' : '❌'} Responsive classes`);
      console.log(`${hasMobileFirst ? '✅' : '❌'} Mobile-first approach`);
    }
  }

  async testVideoFeatures() {
    console.log('\n🎬 Testing Video Features...');
    
    const materialsFile = 'apps/web/app/materials/page.tsx';
    if (fs.existsSync(materialsFile)) {
      const content = fs.readFileSync(materialsFile, 'utf8');
      
      // Check for video preview features
      const hasVideoPreview = content.includes('selectedReel') || content.includes('onReelClick');
      const hasThumbnails = content.includes('thumbnailPath') || content.includes('previewPath');
      const hasModal = content.includes('fixed inset-0') || content.includes('z-50');
      
      this.testResults.push({
        test: 'Video Preview Modal',
        passed: hasVideoPreview,
        details: hasVideoPreview ? 'Video preview modal found' : 'No video preview modal'
      });
      
      this.testResults.push({
        test: 'Video Thumbnails',
        passed: hasThumbnails,
        details: hasThumbnails ? 'Thumbnail support found' : 'No thumbnail support'
      });
      
      this.testResults.push({
        test: 'Modal Implementation',
        passed: hasModal,
        details: hasModal ? 'Modal implementation found' : 'No modal implementation'
      });
      
      console.log(`${hasVideoPreview ? '✅' : '❌'} Video preview modal`);
      console.log(`${hasThumbnails ? '✅' : '❌'} Video thumbnails`);
      console.log(`${hasModal ? '✅' : '❌'} Modal implementation`);
    }
  }

  async testDatabaseSchema() {
    console.log('\n🗄️ Testing Database Schema...');
    
    const schemaFile = 'packages/prisma/schema.prisma';
    if (fs.existsSync(schemaFile)) {
      const content = fs.readFileSync(schemaFile, 'utf8');
      
      // Check for required models
      const hasUserModel = content.includes('model User');
      const hasPartnerModel = content.includes('model Partner');
      const hasReelModel = content.includes('model Reel');
      const hasLinkModel = content.includes('model Link');
      
      this.testResults.push({
        test: 'User Model',
        passed: hasUserModel,
        details: hasUserModel ? 'User model found' : 'User model missing'
      });
      
      this.testResults.push({
        test: 'Partner Model',
        passed: hasPartnerModel,
        details: hasPartnerModel ? 'Partner model found' : 'Partner model missing'
      });
      
      this.testResults.push({
        test: 'Reel Model',
        passed: hasReelModel,
        details: hasReelModel ? 'Reel model found' : 'Reel model missing'
      });
      
      this.testResults.push({
        test: 'Link Model',
        passed: hasLinkModel,
        details: hasLinkModel ? 'Link model found' : 'Link model missing'
      });
      
      console.log(`${hasUserModel ? '✅' : '❌'} User model`);
      console.log(`${hasPartnerModel ? '✅' : '❌'} Partner model`);
      console.log(`${hasReelModel ? '✅' : '❌'} Reel model`);
      console.log(`${hasLinkModel ? '✅' : '❌'} Link model`);
    }
  }

  async testPWAFeatures() {
    console.log('\n📱 Testing PWA Features...');
    
    const manifestFile = 'apps/web/public/manifest.json';
    const layoutFile = 'apps/web/app/layout.tsx';
    
    if (fs.existsSync(manifestFile)) {
      const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
      
      const hasName = !!manifest.name;
      const hasShortName = !!manifest.short_name;
      const hasStartUrl = !!manifest.start_url;
      const hasDisplay = !!manifest.display;
      
      this.testResults.push({
        test: 'PWA Manifest - Name',
        passed: hasName,
        details: hasName ? 'App name defined' : 'App name missing'
      });
      
      this.testResults.push({
        test: 'PWA Manifest - Short Name',
        passed: hasShortName,
        details: hasShortName ? 'Short name defined' : 'Short name missing'
      });
      
      this.testResults.push({
        test: 'PWA Manifest - Start URL',
        passed: hasStartUrl,
        details: hasStartUrl ? 'Start URL defined' : 'Start URL missing'
      });
      
      this.testResults.push({
        test: 'PWA Manifest - Display',
        passed: hasDisplay,
        details: hasDisplay ? 'Display mode defined' : 'Display mode missing'
      });
      
      console.log(`${hasName ? '✅' : '❌'} App name`);
      console.log(`${hasShortName ? '✅' : '❌'} Short name`);
      console.log(`${hasStartUrl ? '✅' : '❌'} Start URL`);
      console.log(`${hasDisplay ? '✅' : '❌'} Display mode`);
    }
    
    if (fs.existsSync(layoutFile)) {
      const content = fs.readFileSync(layoutFile, 'utf8');
      const hasViewport = content.includes('viewport');
      const hasThemeColor = content.includes('themeColor');
      
      this.testResults.push({
        test: 'PWA Meta - Viewport',
        passed: hasViewport,
        details: hasViewport ? 'Viewport meta found' : 'Viewport meta missing'
      });
      
      this.testResults.push({
        test: 'PWA Meta - Theme Color',
        passed: hasThemeColor,
        details: hasThemeColor ? 'Theme color found' : 'Theme color missing'
      });
      
      console.log(`${hasViewport ? '✅' : '❌'} Viewport meta`);
      console.log(`${hasThemeColor ? '✅' : '❌'} Theme color`);
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
    
    // Save report
    const reportPath = './simple-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Report saved to: ${reportPath}`);
    
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
}

async function main() {
  const tester = new SimpleTester();
  
  try {
    console.log('🔧 Starting simple app testing...');
    
    // Run all tests
    await tester.testFileStructure();
    await tester.testMobileOptimization();
    await tester.testResponsiveDesign();
    await tester.testVideoFeatures();
    await tester.testDatabaseSchema();
    await tester.testPWAFeatures();
    
    // Generate report
    await tester.generateReport();
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = SimpleTester; 
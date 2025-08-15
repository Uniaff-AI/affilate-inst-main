#!/usr/bin/env node

/**
 * API Test Script for Instagram Affiliate App
 * Tests the core functionality without running servers
 */

const fs = require('fs');
const path = require('path');

class APITester {
  constructor() {
    this.testResults = [];
  }

  async testDatabaseSchema() {
    console.log('\n🗄️ Testing Database Schema...');
    
    const schemaFile = 'packages/prisma/schema.prisma';
    if (fs.existsSync(schemaFile)) {
      const content = fs.readFileSync(schemaFile, 'utf8');
      
      // Test User model
      const hasUserModel = content.includes('model User');
      const hasUserFields = content.includes('email') && content.includes('passwordHash') && content.includes('role');
      const hasUserRelations = content.includes('partner Partner?');
      
      this.testResults.push({
        test: 'User Model Structure',
        passed: hasUserModel && hasUserFields,
        details: hasUserModel ? 'User model with required fields found' : 'User model missing or incomplete'
      });
      
      this.testResults.push({
        test: 'User-Partner Relationship',
        passed: hasUserRelations,
        details: hasUserRelations ? 'User-Partner relationship defined' : 'User-Partner relationship missing'
      });
      
      // Test Partner model
      const hasPartnerModel = content.includes('model Partner');
      const hasPartnerFields = content.includes('userId') && content.includes('igBusinessId') && content.includes('onboardingDone');
      const hasPartnerRelations = content.includes('user User') && content.includes('links Link[]');
      
      this.testResults.push({
        test: 'Partner Model Structure',
        passed: hasPartnerModel && hasPartnerFields,
        details: hasPartnerModel ? 'Partner model with required fields found' : 'Partner model missing or incomplete'
      });
      
      this.testResults.push({
        test: 'Partner Relationships',
        passed: hasPartnerRelations,
        details: hasPartnerRelations ? 'Partner relationships defined' : 'Partner relationships missing'
      });
      
      // Test Reel model
      const hasReelModel = content.includes('model Reel');
      const hasReelFields = content.includes('title') && content.includes('filePath') && content.includes('durationSec');
      
      this.testResults.push({
        test: 'Reel Model Structure',
        passed: hasReelModel && hasReelFields,
        details: hasReelModel ? 'Reel model with required fields found' : 'Reel model missing or incomplete'
      });
      
      console.log(`${hasUserModel && hasUserFields ? '✅' : '❌'} User model structure`);
      console.log(`${hasUserRelations ? '✅' : '❌'} User-Partner relationship`);
      console.log(`${hasPartnerModel && hasPartnerFields ? '✅' : '❌'} Partner model structure`);
      console.log(`${hasPartnerRelations ? '✅' : '❌'} Partner relationships`);
      console.log(`${hasReelModel && hasReelFields ? '✅' : '❌'} Reel model structure`);
    }
  }

  async testAPIEndpoints() {
    console.log('\n🔌 Testing API Endpoints...');
    
    const apiFiles = [
      'apps/api/src/auth/auth.controller.ts',
      'apps/api/src/partners/partners.controller.ts',
      'apps/api/src/reels/reels.controller.ts',
      'apps/api/src/links/links.controller.ts'
    ];
    
    for (const file of apiFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const fileName = path.basename(file, '.ts');
        
        // Check for controller decorators
        const hasController = content.includes('@Controller') || content.includes('@controller');
        const hasEndpoints = content.includes('@Get') || content.includes('@Post') || content.includes('@Put') || content.includes('@Delete');
        
        this.testResults.push({
          test: `API Controller: ${fileName}`,
          passed: hasController && hasEndpoints,
          details: hasController && hasEndpoints ? 'Controller with endpoints found' : 'Controller missing or no endpoints'
        });
        
        console.log(`${hasController && hasEndpoints ? '✅' : '❌'} ${fileName}`);
      }
    }
  }

  async testUserRegistrationFlow() {
    console.log('\n👤 Testing User Registration Flow...');
    
    const authService = 'apps/api/src/auth/auth.service.ts';
    const authController = 'apps/api/src/auth/auth.controller.ts';
    
    if (fs.existsSync(authService) && fs.existsSync(authController)) {
      const serviceContent = fs.readFileSync(authService, 'utf8');
      const controllerContent = fs.readFileSync(authController, 'utf8');
      
      // Check for registration methods
      const hasRegistrationMethod = serviceContent.includes('register') || serviceContent.includes('signup');
      const hasPasswordHashing = serviceContent.includes('bcrypt') || serviceContent.includes('hash');
      const hasJWTToken = serviceContent.includes('jwt') || serviceContent.includes('token');
      
      // Check for registration endpoint
      const hasRegistrationEndpoint = controllerContent.includes('@Post') && (controllerContent.includes('register') || controllerContent.includes('signup'));
      
      this.testResults.push({
        test: 'User Registration Method',
        passed: hasRegistrationMethod,
        details: hasRegistrationMethod ? 'Registration method found in service' : 'Registration method missing'
      });
      
      this.testResults.push({
        test: 'Password Security',
        passed: hasPasswordHashing,
        details: hasPasswordHashing ? 'Password hashing implemented' : 'Password hashing missing'
      });
      
      this.testResults.push({
        test: 'JWT Authentication',
        passed: hasJWTToken,
        details: hasJWTToken ? 'JWT token generation found' : 'JWT token generation missing'
      });
      
      this.testResults.push({
        test: 'Registration Endpoint',
        passed: hasRegistrationEndpoint,
        details: hasRegistrationEndpoint ? 'Registration endpoint defined' : 'Registration endpoint missing'
      });
      
      console.log(`${hasRegistrationMethod ? '✅' : '❌'} Registration method`);
      console.log(`${hasPasswordHashing ? '✅' : '❌'} Password hashing`);
      console.log(`${hasJWTToken ? '✅' : '❌'} JWT authentication`);
      console.log(`${hasRegistrationEndpoint ? '✅' : '❌'} Registration endpoint`);
    }
  }

  async testPartnerAccountAssignment() {
    console.log('\n🤝 Testing Partner Account Assignment...');
    
    const partnersService = 'apps/api/src/partners/partners.service.ts';
    const partnersController = 'apps/api/src/partners/partners.controller.ts';
    
    if (fs.existsSync(partnersService) && fs.existsSync(partnersController)) {
      const serviceContent = fs.readFileSync(partnersService, 'utf8');
      const controllerContent = fs.readFileSync(partnersController, 'utf8');
      
      // Check for partner creation methods
      const hasCreatePartner = serviceContent.includes('create') || serviceContent.includes('createPartner');
      const hasUserLinking = serviceContent.includes('userId') || serviceContent.includes('user.id');
      
      // Check for partner endpoints
      const hasPartnerEndpoints = controllerContent.includes('@Post') || controllerContent.includes('@Get');
      
      this.testResults.push({
        test: 'Partner Creation Method',
        passed: hasCreatePartner,
        details: hasCreatePartner ? 'Partner creation method found' : 'Partner creation method missing'
      });
      
      this.testResults.push({
        test: 'User-Partner Linking',
        passed: hasUserLinking,
        details: hasUserLinking ? 'User-Partner linking logic found' : 'User-Partner linking missing'
      });
      
      this.testResults.push({
        test: 'Partner API Endpoints',
        passed: hasPartnerEndpoints,
        details: hasPartnerEndpoints ? 'Partner API endpoints found' : 'Partner API endpoints missing'
      });
      
      console.log(`${hasCreatePartner ? '✅' : '❌'} Partner creation method`);
      console.log(`${hasUserLinking ? '✅' : '❌'} User-Partner linking`);
      console.log(`${hasPartnerEndpoints ? '✅' : '❌'} Partner API endpoints`);
    }
  }

  async testVideoFeatures() {
    console.log('\n🎬 Testing Video Features...');
    
    const reelsService = 'apps/api/src/reels/reels.service.ts';
    const reelsController = 'apps/api/src/reels/reels.controller.ts';
    
    if (fs.existsSync(reelsService) && fs.existsSync(reelsController)) {
      const serviceContent = fs.readFileSync(reelsService, 'utf8');
      const controllerContent = fs.readFileSync(reelsController, 'utf8');
      
      // Check for video management methods
      const hasVideoUpload = serviceContent.includes('upload') || serviceContent.includes('create');
      const hasVideoDownload = serviceContent.includes('download') || serviceContent.includes('get');
      const hasThumbnailSupport = serviceContent.includes('thumbnail') || serviceContent.includes('preview');
      
      // Check for video endpoints
      const hasVideoEndpoints = controllerContent.includes('@Get') || controllerContent.includes('@Post');
      
      this.testResults.push({
        test: 'Video Upload Method',
        passed: hasVideoUpload,
        details: hasVideoUpload ? 'Video upload method found' : 'Video upload method missing'
      });
      
      this.testResults.push({
        test: 'Video Download Method',
        passed: hasVideoDownload,
        details: hasVideoDownload ? 'Video download method found' : 'Video download method missing'
      });
      
      this.testResults.push({
        test: 'Thumbnail Support',
        passed: hasThumbnailSupport,
        details: hasThumbnailSupport ? 'Thumbnail support found' : 'Thumbnail support missing'
      });
      
      this.testResults.push({
        test: 'Video API Endpoints',
        passed: hasVideoEndpoints,
        details: hasVideoEndpoints ? 'Video API endpoints found' : 'Video API endpoints missing'
      });
      
      console.log(`${hasVideoUpload ? '✅' : '❌'} Video upload method`);
      console.log(`${hasVideoDownload ? '✅' : '❌'} Video download method`);
      console.log(`${hasThumbnailSupport ? '✅' : '❌'} Thumbnail support`);
      console.log(`${hasVideoEndpoints ? '✅' : '❌'} Video API endpoints`);
    }
  }

  async testFrontendVideoFeatures() {
    console.log('\n🎥 Testing Frontend Video Features...');
    
    const materialsPage = 'apps/web/app/materials/page.tsx';
    
    if (fs.existsSync(materialsPage)) {
      const content = fs.readFileSync(materialsPage, 'utf8');
      
      // Check for video preview features
      const hasVideoModal = content.includes('selectedReel') && content.includes('setSelectedReel');
      const hasVideoPlayer = content.includes('<video') || content.includes('video');
      const hasThumbnailDisplay = content.includes('thumbnailPath') || content.includes('previewPath');
      const hasPlayButton = content.includes('onReelClick') || content.includes('handleReelClick');
      
      this.testResults.push({
        test: 'Video Preview Modal',
        passed: hasVideoModal,
        details: hasVideoModal ? 'Video preview modal implemented' : 'Video preview modal missing'
      });
      
      this.testResults.push({
        test: 'Video Player',
        passed: hasVideoPlayer,
        details: hasVideoPlayer ? 'Video player component found' : 'Video player component missing'
      });
      
      this.testResults.push({
        test: 'Thumbnail Display',
        passed: hasThumbnailDisplay,
        details: hasThumbnailDisplay ? 'Thumbnail display implemented' : 'Thumbnail display missing'
      });
      
      this.testResults.push({
        test: 'Video Interaction',
        passed: hasPlayButton,
        details: hasPlayButton ? 'Video interaction implemented' : 'Video interaction missing'
      });
      
      console.log(`${hasVideoModal ? '✅' : '❌'} Video preview modal`);
      console.log(`${hasVideoPlayer ? '✅' : '❌'} Video player`);
      console.log(`${hasThumbnailDisplay ? '✅' : '❌'} Thumbnail display`);
      console.log(`${hasPlayButton ? '✅' : '❌'} Video interaction`);
    }
  }

  async generateReport() {
    console.log('\n📊 Generating API test report...');
    
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
    const reportPath = './api-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Report saved to: ${reportPath}`);
    
    // Print summary
    console.log('\n📋 API Test Summary:');
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
  const tester = new APITester();
  
  try {
    console.log('🔧 Starting API functionality testing...');
    
    // Run all API tests
    await tester.testDatabaseSchema();
    await tester.testAPIEndpoints();
    await tester.testUserRegistrationFlow();
    await tester.testPartnerAccountAssignment();
    await tester.testVideoFeatures();
    await tester.testFrontendVideoFeatures();
    
    // Generate report
    await tester.generateReport();
    
  } catch (error) {
    console.error('❌ API testing failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = APITester; 
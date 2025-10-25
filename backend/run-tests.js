#!/usr/bin/env node

/**
 * GameTradeX Test Runner
 * Comprehensive test suite for API endpoints, ownership checks, and user permissions
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 GameTradeX Test Suite');
console.log('========================\n');

// Test categories
const testCategories = [
  {
    name: 'Listing Creation Tests',
    description: 'Tests listing creation, role updates, and ownership checks',
    file: 'tests/comprehensive.test.js',
    focus: 'Listing Creation Tests'
  },
  {
    name: 'Purchase Flow Tests', 
    description: 'Tests purchase creation, payment confirmation, and user stats updates',
    file: 'tests/comprehensive.test.js',
    focus: 'Purchase Flow Tests'
  },
  {
    name: 'Delivery & Receipt Tests',
    description: 'Tests delivery confirmation, receipt confirmation, and ownership verification',
    file: 'tests/comprehensive.test.js',
    focus: 'Delivery and Receipt Confirmation Tests'
  },
  {
    name: 'Role Update Tests',
    description: 'Tests admin role updates, user management, and access control',
    file: 'tests/comprehensive.test.js',
    focus: 'Role Update Tests'
  },
  {
    name: 'Notification Tests',
    description: 'Tests notification marking, user-specific access, and read status',
    file: 'tests/comprehensive.test.js',
    focus: 'Notification Tests'
  },
  {
    name: 'Support Ticket Tests',
    description: 'Tests support ticket creation, authentication, and user access',
    file: 'tests/comprehensive.test.js',
    focus: 'Support Ticket Tests'
  },
  {
    name: 'Ownership Verification Tests',
    description: 'Tests ownership checks, access control, and resource protection',
    file: 'tests/comprehensive.test.js',
    focus: 'Ownership Verification Tests'
  },
  {
    name: 'Integration Tests',
    description: 'Tests complete workflows, end-to-end scenarios, and system integration',
    file: 'tests/comprehensive.test.js',
    focus: 'Integration Tests'
  }
];

// Run all tests
async function runAllTests() {
  console.log('Running all test categories...\n');
  
  const jestArgs = [
    '--config', 'jest.config.js',
    '--verbose',
    '--detectOpenHandles',
    '--forceExit',
    'tests/comprehensive.test.js'
  ];

  return new Promise((resolve, reject) => {
    const jest = spawn('npx', ['jest', ...jestArgs], {
      stdio: 'inherit',
      cwd: __dirname
    });

    jest.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ All tests passed!');
        resolve();
      } else {
        console.log('\n❌ Some tests failed!');
        reject(new Error(`Tests failed with code ${code}`));
      }
    });

    jest.on('error', (error) => {
      console.error('Failed to start Jest:', error);
      reject(error);
    });
  });
}

// Run specific test category
async function runCategory(categoryName) {
  const category = testCategories.find(cat => 
    cat.name.toLowerCase().includes(categoryName.toLowerCase())
  );

  if (!category) {
    console.error(`❌ Category "${categoryName}" not found.`);
    console.log('Available categories:');
    testCategories.forEach(cat => {
      console.log(`  - ${cat.name}`);
    });
    return;
  }

  console.log(`Running ${category.name}...`);
  console.log(`Description: ${category.description}\n`);

  const jestArgs = [
    '--config', 'jest.config.js',
    '--verbose',
    '--detectOpenHandles',
    '--forceExit',
    '--testNamePattern', category.focus,
    'tests/comprehensive.test.js'
  ];

  return new Promise((resolve, reject) => {
    const jest = spawn('npx', ['jest', ...jestArgs], {
      stdio: 'inherit',
      cwd: __dirname
    });

    jest.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${category.name} passed!`);
        resolve();
      } else {
        console.log(`\n❌ ${category.name} failed!`);
        reject(new Error(`Tests failed with code ${code}`));
      }
    });

    jest.on('error', (error) => {
      console.error('Failed to start Jest:', error);
      reject(error);
    });
  });
}

// Run tests with coverage
async function runWithCoverage() {
  console.log('Running tests with coverage analysis...\n');

  const jestArgs = [
    '--config', 'jest.config.js',
    '--coverage',
    '--verbose',
    '--detectOpenHandles',
    '--forceExit',
    'tests/comprehensive.test.js'
  ];

  return new Promise((resolve, reject) => {
    const jest = spawn('npx', ['jest', ...jestArgs], {
      stdio: 'inherit',
      cwd: __dirname
    });

    jest.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Coverage analysis completed!');
        console.log('📊 Check the coverage/ directory for detailed reports.');
        resolve();
      } else {
        console.log('\n❌ Coverage analysis failed!');
        reject(new Error(`Coverage failed with code ${code}`));
      }
    });

    jest.on('error', (error) => {
      console.error('Failed to start Jest:', error);
      reject(error);
    });
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'all':
        await runAllTests();
        break;
      
      case 'category':
        const categoryName = args[1];
        if (!categoryName) {
          console.error('❌ Please specify a category name.');
          console.log('Usage: node run-tests.js category <category-name>');
          console.log('Available categories:');
          testCategories.forEach(cat => {
            console.log(`  - ${cat.name}`);
          });
          process.exit(1);
        }
        await runCategory(categoryName);
        break;
      
      case 'coverage':
        await runWithCoverage();
        break;
      
      case 'list':
        console.log('Available test categories:');
        testCategories.forEach((cat, index) => {
          console.log(`${index + 1}. ${cat.name}`);
          console.log(`   ${cat.description}\n`);
        });
        break;
      
      default:
        console.log('GameTradeX Test Runner');
        console.log('======================\n');
        console.log('Usage:');
        console.log('  node run-tests.js all                    - Run all tests');
        console.log('  node run-tests.js category <name>     - Run specific category');
        console.log('  node run-tests.js coverage            - Run with coverage');
        console.log('  node run-tests.js list                - List all categories\n');
        console.log('Examples:');
        console.log('  node run-tests.js category "Listing Creation"');
        console.log('  node run-tests.js category "Purchase Flow"');
        console.log('  node run-tests.js coverage');
        break;
    }
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test execution interrupted.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test execution terminated.');
  process.exit(0);
});

// Run the main function
main();

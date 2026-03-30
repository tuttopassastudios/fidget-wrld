/**
 * Set up CJ Dropshipping webhooks
 * Registers webhook URLs for order status and tracking updates
 */

require('dotenv').config({ path: '.env.local' });
const CJDropshipping = require('cj-dropshipping-sdk');

const CJ_API_KEY = process.env.CJ_API_KEY || 'CJ3556407@api@12136edd24d14f27b10469e0f56fa300';
const WEBHOOK_URL = 'https://fidgetwrld.com/api/webhooks/cj';

async function setupWebhooks() {
  console.log('Setting up CJ Dropshipping webhooks...\n');

  const cj = new CJDropshipping({ apiKey: CJ_API_KEY });

  try {
    // Set webhook for order status changes
    console.log('1. Registering ORDER_STATUS webhook...');
    const orderResult = await cj.webhook.setOrderStatusWebhook(WEBHOOK_URL);
    console.log('   Result:', JSON.stringify(orderResult, null, 2));

    // Set webhook for tracking updates
    console.log('\n2. Registering TRACKING webhook...');
    const trackingResult = await cj.webhook.setTrackingWebhook(WEBHOOK_URL);
    console.log('   Result:', JSON.stringify(trackingResult, null, 2));

    console.log('\n✓ Webhooks configured successfully!');
    console.log(`  URL: ${WEBHOOK_URL}`);

  } catch (error) {
    console.error('\n✗ Error setting up webhooks:', error.message);
    if (error.response) {
      console.error('  Response:', error.response.data || error.response);
    }
    process.exit(1);
  }
}

setupWebhooks();

import * as Midtrans from 'midtrans-client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function test() {
  console.log('Testing Midtrans connection...');
  console.log('Server Key:', process.env.MIDTRANS_SERVER_KEY ? 'Present' : 'Missing');
  
  const snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });

  try {
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: 'TEST-' + Date.now(),
        gross_amount: 10000,
      }
    });
    console.log('Success! Token:', transaction.token);
  } catch (err) {
    console.error('Failed to create transaction:', err);
  }
}

test();

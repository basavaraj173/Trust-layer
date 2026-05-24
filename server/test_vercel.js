const assert = require('assert');

async function runTests() {
  const baseUrl = 'https://trustlayer-rust.vercel.app/api';
  console.log('🧪 Starting Live Vercel Deployment Integration Tests...\n');

  try {
    // 1. Submit a text complaint
    console.log('1️⃣  Submitting a text complaint to Vercel production...');
    const submitPayload = {
      type: 'text',
      originalText: 'Live production test: The water pipe in Sector 4 is leaking, causing a massive pool of water.',
      description: 'Live production test: The water pipe in Sector 4 is leaking, causing a massive pool of water.',
      location: 'Sector 4, Bangalore',
      isProxy: false,
      language: 'en'
    };

    const submitRes = await fetch(`${baseUrl}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitPayload)
    });

    assert.strictEqual(submitRes.status, 201, `Expected status 201, got ${submitRes.status}`);
    const submitData = await submitRes.json();
    
    assert.ok(submitData.success, 'Expected success to be true');
    assert.ok(submitData.grievanceId, 'Expected a grievanceId in response');
    assert.ok(submitData.pin, 'Expected a pin in response');
    assert.ok(submitData.aiSummary, 'Expected AI Summary in response');

    console.log('✅ Live complaint submitted successfully!');
    console.log(`   Grievance ID: ${submitData.grievanceId}`);
    console.log(`   PIN: ${submitData.pin}`);
    console.log(`   AI Summary:`, submitData.aiSummary);

    // 2. Track the complaint using ID and PIN
    console.log('\n2️⃣  Tracking the live complaint...');
    const trackRes = await fetch(`${baseUrl}/complaints/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grievanceId: submitData.grievanceId,
        pin: submitData.pin
      })
    });

    assert.strictEqual(trackRes.status, 200, `Expected status 200, got ${trackRes.status}`);
    const trackData = await trackRes.json();

    assert.ok(trackData.success, 'Expected track success to be true');
    assert.strictEqual(trackData.complaint.grievanceId, submitData.grievanceId, 'Grievance ID mismatch');
    assert.strictEqual(trackData.complaint.status, 'submitted', 'Initial status should be "submitted"');
    console.log('✅ Tracking response validated successfully on production!');
    console.log(`   Current status: ${trackData.complaint.status}`);

    // 3. Retrieve public view of the complaint
    console.log('\n3️⃣  Fetching public details of the live complaint...');
    const publicRes = await fetch(`${baseUrl}/complaints/public/${submitData.grievanceId}`);
    assert.strictEqual(publicRes.status, 200, `Expected status 200, got ${publicRes.status}`);
    const publicData = await publicRes.json();

    assert.ok(publicData.success, 'Expected public view success to be true');
    assert.strictEqual(publicData.complaint.grievanceId, submitData.grievanceId);
    assert.strictEqual(publicData.complaint.pin, undefined, 'PIN must NOT be exposed in public view');
    console.log('✅ Public view on production is secured and verified!');

    console.log('\n🎉 ALL LIVE DEPLOYMENT TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('\n❌ Live test failed:', error);
    process.exit(1);
  }
}

runTests();

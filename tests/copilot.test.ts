import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

function makeRequest(path: string, method: string, headers: Record<string, string>, body?: any): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ status: res.statusCode || 200, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode || 200, data: rawData });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

test('Copilot Scenario 1: Basic Greeting', async () => {
  const res = await makeRequest('/api/copilot', 'POST', { 'x-user-role': 'REVIEWING_OFFICER' }, { query: 'Hello' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.data.answer.toLowerCase().includes('hello') || res.data.data.answer.toLowerCase().includes('copilot'));
});

test('Copilot Scenario 2: General Knowledge Question (What is AICTE?)', async () => {
  const res = await makeRequest('/api/copilot', 'POST', { 'x-user-role': 'REVIEWING_OFFICER' }, { query: 'What is AICTE?' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.data.answer.includes('All India Council for Technical Education') || res.data.data.answer.includes('AICTE'));
});

test('Copilot Scenario 3: FDR-related Question (What is a fixed deposit receipt?)', async () => {
  const res = await makeRequest('/api/copilot', 'POST', { 'x-user-role': 'REVIEWING_OFFICER' }, { query: 'What is a fixed deposit receipt?' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.data.answer.toLowerCase().includes('fixed deposit') || res.data.data.answer.toLowerCase().includes('fdr'));
});

test('Copilot Scenario 4: Application Features (Regulatory Norms Table 2.1)', async () => {
  const res = await makeRequest('/api/copilot', 'POST', { 'x-user-role': 'REVIEWING_OFFICER' }, { query: 'What are the deposit amount requirements under Table 2.1?' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.data.answer.includes('35.00 Lakhs') || res.data.data.answer.includes('Table 2.1'));
});

test('Copilot Scenario 5: Follow-up Question with Conversation History', async () => {
  const res = await makeRequest(
    '/api/copilot',
    'POST',
    { 'x-user-role': 'REVIEWING_OFFICER' },
    {
      query: 'Why was it flagged?',
      conversationHistory: [
        { sender: 'user', text: 'Tell me about PNB-CHD-2022-44109' },
        { sender: 'assistant', text: 'Case PNB-CHD-2022-44109 belongs to Modern Polytechnic Society.' }
      ]
    }
  );
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.data.answer.includes('Modern Polytechnic') || res.data.data.answer.includes('PNB-CHD-2022-44109'));
});

test('Copilot Scenario 6: Hinglish Inquiry', async () => {
  const res = await makeRequest('/api/copilot', 'POST', { 'x-user-role': 'REVIEWING_OFFICER' }, { query: 'college ke liye fdr amount kitna hona chahiye?' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.data.answer.length > 50);
});

test('Copilot Scenario 7: Spelling Mistakes & Jargon', async () => {
  const res = await makeRequest('/api/copilot', 'POST', { 'x-user-role': 'REVIEWING_OFFICER' }, { query: 'dshbrd smmry btao' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.data.answer.length > 50);
});

test('Copilot Scenario 8: Dashboard Summary with Live Database Statistics', async () => {
  const res = await makeRequest('/api/copilot', 'POST', { 'x-user-role': 'REVIEWING_OFFICER' }, { query: 'Summarize the current portfolio dashboard' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.data.answer.includes('Fixed Deposit Receipts') || res.data.data.answer.includes('Dashboard'));
});

test('Copilot Scenario 9: Existing Document / Approaching Maturity', async () => {
  const res = await makeRequest('/api/copilot', 'POST', { 'x-user-role': 'REVIEWING_OFFICER' }, { query: 'Which FDRs are approaching maturity?' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.data.answer.includes('Maturity') || res.data.data.answer.includes('Expired'));
});

test('Copilot Scenario 10: Why was a document flagged? (Exact Discrepancy)', async () => {
  const res = await makeRequest('/api/copilot', 'POST', { 'x-user-role': 'REVIEWING_OFFICER' }, { query: 'Why was PNB-CHD-2022-44109 flagged?' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.data.answer.includes('Modern Polytechnic') && (res.data.data.answer.includes('Deposit Sufficiency') || res.data.data.answer.includes('Lien')));
});

test('Copilot Scenario 11: Empty query validation rejection', async () => {
  const res = await makeRequest('/api/copilot', 'POST', { 'x-user-role': 'REVIEWING_OFFICER' }, { query: '   ' });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.data.success, false);
});

test('Copilot Scenario 12: Excessively long query rejection (>5000 chars)', async () => {
  const longPrompt = 'A'.repeat(5001);
  const res = await makeRequest('/api/copilot', 'POST', { 'x-user-role': 'REVIEWING_OFFICER' }, { query: longPrompt });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.data.success, false);
});

test('Copilot Scenario 13: RBAC Isolation - Institution cannot access external case', async () => {
  const res = await makeRequest(
    '/api/copilot',
    'POST',
    { 'x-user-role': 'INSTITUTION_USER', 'x-institution-id': 'inst_01' },
    { query: 'Why was this flagged?', contextCaseId: 'app_002' }
  );
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.data.answer.includes('Access Restricted'));
});

test('Copilot Scenario 14: Release Procedure under Clause 6.46', async () => {
  const res = await makeRequest('/api/copilot', 'POST', { 'x-user-role': 'REVIEWING_OFFICER' }, { query: 'What is the release procedure under Clause 6.46?' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.data.answer.includes('Clause 6.46') && res.data.data.answer.includes('Affidavit Form 6'));
});

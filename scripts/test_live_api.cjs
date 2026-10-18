const http = require('http');

async function request(options, body = null) {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json || data
        });
      });
    });
    req.on('error', (err) => {
      resolve({ status: 'ERR', data: err.message });
    });
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('================================================================');
  console.log('   ISP PAY BD — SAFE LIVE READ-ONLY ENDPOINT VERIFICATION       ');
  console.log('   (Strictly Read-Only Queries: No MikroTik modifications)     ');
  console.log('================================================================\n');

  // 1. Authenticate to get live JWT
  const loginRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'demo@isppaybd.com',
    password: 'password'
  });

  const token = loginRes.data?.data?.access_token || loginRes.data?.access_token || loginRes.data?.data?.token;
  console.log(`[AUTH] Login endpoint -> HTTP ${loginRes.status} | Token acquired: ${!!token}\n`);

  if (!token) {
    console.error('Failed to authenticate with backend.');
    return;
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Test /me first to get actual reseller admin id
  const meRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/auth/me',
    method: 'GET',
    headers: authHeaders
  });
  console.log('Logged in user info:', meRes.data?.data || meRes.data);
  const finalId = meRes.data?.data?.admin_id || meRes.data?.data?.user_id || meRes.data?.data?.id || 1;

  const testEndpoints = [
    { label: 'Admin Dashboard Stats', path: `/api/v1/reseller/dashboard/${finalId}` },
    { label: 'Customers Registry', path: `/api/v1/reseller/customers/${finalId}` },
    { label: 'Service Areas & Zones', path: `/api/v1/reseller/areas/${finalId}` },
    { label: 'Packages & Tariffs', path: `/api/v1/reseller/packages/${finalId}` },
    { label: 'Routers Metadata (Read)', path: `/api/v1/reseller/routers/${finalId}` },
    { label: 'IP Pools Subnets', path: `/api/v1/reseller/ip-pools/${finalId}` },
    { label: 'Customer Payments List', path: `/api/v1/reseller/customer-payments/${finalId}` },
    { label: 'Employee Staff List', path: `/api/v1/reseller/employees/${finalId}` },
    { label: 'Support Tickets Desk', path: `/api/v1/reseller/support-tickets/${finalId}` },
    { label: 'SMS History Logs', path: `/api/v1/reseller/sms/${finalId}` },
    { label: 'Common News & Notices', path: '/api/common/news' }
  ];

  let passed = 0;
  for (const ep of testEndpoints) {
    const res = await request({
      hostname: 'localhost',
      port: 8080,
      path: ep.path,
      method: 'GET',
      headers: authHeaders
    });

    const isOk = res.status === 200;
    if (isOk) passed++;
    const snippet = res.data?.status || (Array.isArray(res.data) ? `Array(${res.data.length})` : typeof res.data);
    const mark = isOk ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} | HTTP ${res.status} | ${ep.label.padEnd(28)} | ${ep.path}`);
  }

  console.log(`\nResults: ${passed}/${testEndpoints.length} safe live read endpoints verified with HTTP 200 OK.`);
}

run();

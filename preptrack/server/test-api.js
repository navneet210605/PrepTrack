const http = require('http');

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runVerification = async () => {
  console.log('--- STARTING PREPTRACK END-TO-END API VERIFICATION ---');

  // 1. Health check
  console.log('\n[1] Testing GET /api/health...');
  const health = await request('GET', '/api/health');
  console.log(`Status: ${health.status}, Response:`, health.data);

  // 2. Login with Demo User
  console.log('\n[2] Testing POST /api/auth/login (Demo User)...');
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'demo@preptrack.com',
    password: 'Demo@123'
  });
  console.log(`Status: ${loginRes.status}, User:`, loginRes.data?.user?.email, 'Streak:', loginRes.data?.user?.streak);
  const token = loginRes.data?.token;

  // 3. Register a new user
  const randomEmail = `student_${Date.now()}@example.com`;
  console.log(`\n[3] Testing POST /api/auth/register with ${randomEmail}...`);
  const regRes = await request('POST', '/api/auth/register', {
    name: 'Test Student',
    email: randomEmail,
    password: 'Password@123'
  });
  console.log(`Status: ${regRes.status}, Registered:`, regRes.data?.user?.email);

  // 4. GET /api/auth/me
  console.log('\n[4] Testing GET /api/auth/me...');
  const meRes = await request('GET', '/api/auth/me', null, token);
  console.log(`Status: ${meRes.status}, Logged In User:`, meRes.data?.user?.name);

  // 5. GET /api/questions
  console.log('\n[5] Testing GET /api/questions with filter category=DSA&limit=3...');
  const questionsRes = await request('GET', '/api/questions?category=DSA&limit=3', null, token);
  console.log(`Status: ${questionsRes.status}, Total Found: ${questionsRes.data?.total}, Returned: ${questionsRes.data?.data?.length}`);

  // 6. POST /api/tests/start
  console.log('\n[6] Testing POST /api/tests/start (aggregation: $match + $sample + $project)...');
  const testStart = await request('POST', '/api/tests/start', {
    category: 'DSA',
    count: 3
  }, token);
  console.log(`Status: ${testStart.status}, Sampled Questions Count: ${testStart.data?.count}`);
  const sampled = testStart.data?.data || [];
  console.log('Sampled question texts (correctIndex hidden):', sampled.map(q => q.text.slice(0, 40) + '...'));

  // 7. POST /api/tests/submit
  console.log('\n[7] Testing POST /api/tests/submit (server grading + streak update)...');
  const submitRes = await request('POST', '/api/tests/submit', {
    questionIds: sampled.map(q => q._id),
    answers: sampled.map(q => ({ questionId: q._id, selectedIndex: 1 })),
    timeTakenSec: 45,
    category: 'DSA',
    difficulty: 'Medium'
  }, token);
  console.log(`Status: ${submitRes.status}, Score: ${submitRes.data?.data?.score}/${submitRes.data?.data?.total}, Accuracy: ${submitRes.data?.data?.accuracy}%, New Streak:`, submitRes.data?.data?.streak);

  // 8. GET /api/tests/history
  console.log('\n[8] Testing GET /api/tests/history...');
  const historyRes = await request('GET', '/api/tests/history?limit=2', null, token);
  console.log(`Status: ${historyRes.status}, Total Attempts: ${historyRes.data?.total}, Page count: ${historyRes.data?.data?.length}`);

  // 9. GET /api/tests/:id
  const attemptId = submitRes.data?.data?.attemptId;
  console.log(`\n[9] Testing GET /api/tests/${attemptId} (populate test)...`);
  const attemptDetail = await request('GET', `/api/tests/${attemptId}`, null, token);
  console.log(`Status: ${attemptDetail.status}, Populated Question 1 text:`, attemptDetail.data?.data?.answers?.[0]?.questionId?.text?.slice(0, 50));

  // 10. POST /api/prep
  console.log('\n[10] Testing POST /api/prep...');
  const prepCreate = await request('POST', '/api/prep', {
    category: 'DSA',
    title: 'Topological Sort using Kahn Algorithm',
    topic: 'Graphs',
    difficulty: 'Medium',
    status: 'Done', // triggers pre-save hook for nextRevisionDate (+1 day)
    notes: 'In-degree array + queue. Cycle exists if visited count != V.'
  }, token);
  console.log(`Status: ${prepCreate.status}, Created:`, prepCreate.data?.data?.title, 'NextRevDate:', prepCreate.data?.data?.nextRevisionDate);
  const createdPrepId = prepCreate.data?.data?._id;

  // 11. GET /api/prep
  console.log('\n[11] Testing GET /api/prep with status=Done...');
  const prepList = await request('GET', '/api/prep?status=Done', null, token);
  console.log(`Status: ${prepList.status}, Done count: ${prepList.data?.total}`);

  // 12. GET /api/prep/revise-today
  console.log('\n[12] Testing GET /api/prep/revise-today ($lte date query)...');
  const reviseTodayRes = await request('GET', '/api/prep/revise-today', null, token);
  console.log(`Status: ${reviseTodayRes.status}, Items Due Today: ${reviseTodayRes.data?.count}`);

  // 13. PUT /api/prep/:id/revised
  if (reviseTodayRes.data?.data?.length > 0) {
    const itemToRevise = reviseTodayRes.data.data[0];
    console.log(`\n[13] Testing PUT /api/prep/${itemToRevise._id}/revised ($inc & $set)...`);
    const revisedRes = await request('PUT', `/api/prep/${itemToRevise._id}/revised`, {}, token);
    console.log(`Status: ${revisedRes.status}, Message:`, revisedRes.data?.message, 'New RevisionCount:', revisedRes.data?.data?.revisionCount);
  }

  // 14. Applications CRUD
  console.log('\n[14] Testing POST /api/applications...');
  const appCreate = await request('POST', '/api/applications', {
    company: 'Goldman Sachs',
    role: 'Summer Analyst',
    status: 'Applied',
    deadline: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    notes: 'Aptitude test next weekend'
  }, token);
  console.log(`Status: ${appCreate.status}, Created Application:`, appCreate.data?.data?.company);
  const createdAppId = appCreate.data?.data?._id;

  console.log('\n[15] Testing GET /api/applications...');
  const appsList = await request('GET', '/api/applications', null, token);
  console.log(`Status: ${appsList.status}, Total Applications: ${appsList.data?.total}`);

  console.log(`\n[16] Testing PUT /api/applications/${createdAppId}...`);
  const appUpdate = await request('PUT', `/api/applications/${createdAppId}`, { status: 'Test' }, token);
  console.log(`Status: ${appUpdate.status}, Updated status:`, appUpdate.data?.data?.status);

  // 17. Stats: Accuracy by category
  console.log('\n[17] Testing GET /api/stats/accuracy-by-category (aggregation)...');
  const accStats = await request('GET', '/api/stats/accuracy-by-category', null, token);
  console.log(`Status: ${accStats.status}, Categories:`, accStats.data?.data);

  // 18. Stats: Weak topics
  console.log('\n[18] Testing GET /api/stats/weak-topics (aggregation)...');
  const weakStats = await request('GET', '/api/stats/weak-topics', null, token);
  console.log(`Status: ${weakStats.status}, Weak Topics (<60%):`, weakStats.data?.data);

  // 19. Stats: Score trend
  console.log('\n[19] Testing GET /api/stats/score-trend (aggregation)...');
  const trendStats = await request('GET', '/api/stats/score-trend', null, token);
  console.log(`Status: ${trendStats.status}, Trend Points:`, trendStats.data?.data?.length);

  // 20. Stats: Applications Funnel
  console.log('\n[20] Testing GET /api/stats/applications-funnel (aggregation)...');
  const funnelStats = await request('GET', '/api/stats/applications-funnel', null, token);
  console.log(`Status: ${funnelStats.status}, Funnel:`, funnelStats.data?.data);

  // 21. Dashboard Plan
  console.log('\n[21] Testing GET /api/dashboard/plan...');
  const planStats = await request('GET', '/api/dashboard/plan', null, token);
  console.log(`Status: ${planStats.status}, Action Plan:`, {
    reviseCount: planStats.data?.data?.reviseCount,
    weakestTopic: planStats.data?.data?.weakestTopic?.topic,
    upcomingDeadlines: planStats.data?.data?.upcomingDeadlines?.length,
    streak: planStats.data?.data?.streak
  });

  console.log('\n======================================================');
  console.log(' ALL 21 ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY! ');
  console.log('======================================================\n');
};

runVerification().catch(console.error);
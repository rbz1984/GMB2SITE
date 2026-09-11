import fetch from 'node-fetch';

async function testEndpoints() {
  console.log('Testing GET http://localhost:3000/ ...');
  const homeRes = await fetch('http://localhost:3000/');
  console.log('GET / status:', homeRes.status);
  if (homeRes.status !== 200) throw new Error('GET / returned ' + homeRes.status);

  console.log('Testing GET http://localhost:3000/api/status ...');
  const statusRes = await fetch('http://localhost:3000/api/status');
  const statusData = await statusRes.json();
  console.log('GET /api/status data:', statusData);
  if (typeof statusData.serpapi !== 'boolean') throw new Error('Invalid /api/status response');

  console.log('Testing GET http://localhost:3000/api/sites ...');
  const sitesRes = await fetch('http://localhost:3000/api/sites');
  const sitesData = await sitesRes.json();
  console.log('GET /api/sites data:', sitesData);
  if (!Array.isArray(sitesData.sites)) throw new Error('Invalid /api/sites response');

  console.log('Testing POST http://localhost:3000/api/generate with invalid input ...');
  const genRes = await fetch('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: 'not_a_valid_place_or_url' })
  });
  console.log('POST /api/generate status:', genRes.status);
  const genData = await genRes.json();
  console.log('POST /api/generate response:', genData);
  if (genRes.status !== 400 || genData.code !== 'INVALID_INPUT') {
    throw new Error('Expected 400 INVALID_INPUT but got: ' + JSON.stringify(genData));
  }

  console.log('Testing GET http://localhost:3000/sites/non-existent-site ...');
  const notFoundRes = await fetch('http://localhost:3000/sites/non-existent-site');
  console.log('GET /sites/non-existent status:', notFoundRes.status);
  if (notFoundRes.status !== 404) throw new Error('Expected 404 for missing site');

  console.log('All API endpoint tests passed successfully!');
}

testEndpoints().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

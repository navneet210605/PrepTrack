const request = require('supertest');
const app = require('../app');

describe('Express app', () => {
  test('GET /api/health reports the API status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        uptime: expect.any(Number),
        timestamp: expect.any(String),
        db: expect.any(String)
      })
    );
  });

  test('GET unknown route returns a 404 JSON response', async () => {
    const response = await request(app).get('/api/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "API endpoint '/api/does-not-exist' not found"
    });
  });
});

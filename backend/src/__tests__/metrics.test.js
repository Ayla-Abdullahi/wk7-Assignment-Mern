// Enable metrics before importing app
process.env.ENABLE_METRICS = 'true';
import request from 'supertest';
const app = (await import('../app.js')).default; // dynamic import after env set

describe('Metrics endpoint', () => {
  it('serves Prometheus metrics when enabled', async () => {
    const res = await request(app).get('/api/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/http_request_duration_seconds/);
  });
});

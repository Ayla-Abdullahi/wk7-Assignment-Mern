import request from 'supertest';
import app from '../app.js';

describe('Not Found handler', () => {
  it('returns 404 for unknown route', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Not Found/);
  });
});

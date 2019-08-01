const request = require('supertest');
const app = require('../../setup/app');

describe('Core router', () => {
  describe('404 route', () => {
    it('should return 404', async () => {
      await request(app)
        .get('/api/surelynotfound')
        .expect(404, 'Resource not found');
    });
  });
});

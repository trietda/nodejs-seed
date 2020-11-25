const request = require('supertest');
const { JSDOM } = require('jsdom');
require('@testing-library/jest-dom');
const core = require('../../src/core');

describe('Core router', () => {
  describe('GET /docs', () => {
    describe('When not in production environment', () => {
      beforeAll(() => {
        process.env.NODE_ENV = 'development';
      });

      it('should return document page', async () => {
        const app = core.createApp();

        const res = await request(app).get('/docs').redirects(5);

        expect(res.status).toBe(200);
        const dom = new JSDOM(res.text);
        const headTitle = dom.window.document.head.getElementsByTagName('title')[0];
        expect(headTitle).toContainHTML('Swagger UI');
      });
    });

    describe('When in production environment', () => {
      beforeAll(() => {
        process.env.NODE_ENV = 'production';
      });

      it('should return 404', async () => {
        const app = core.createApp();

        const res = await request(app).get('/docs');

        expect(res.status).toBe(404);
      });
    });
  });

  describe('Not found route', () => {
    it('should return 404', async () => {
      const app = core.createApp();

      const res = await request(app).get('/surelynotfound');

      expect(res.status).toBe(404);
      expect(res.text).toBe('Not Found');
    });
  });
});

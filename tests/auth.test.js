const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
require('./setup.js');

const request = require('supertest');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

const api = request(app);

const validUser = {
  email: 'test@example.com',
  password: 'SecurePass1',
  fullName: 'Test User',
};

describe('Auth API', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  after(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user and return user + token (no password in response)', async () => {
      const res = await api
        .post('/api/auth/signup')
        .send(validUser)
        .expect(201)
        .expect('Content-Type', /json/);

      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.token);
      assert.ok(res.body.data.user);
      assert.strictEqual(res.body.data.user.email, validUser.email);
      assert.strictEqual(res.body.data.user.fullName, validUser.fullName);
      assert.ok(res.body.data.user.id);
      assert.strictEqual(res.body.data.user.password, undefined);
      assert.strictEqual(res.body.data.user.passwordHash, undefined);
    });

    it('should reject duplicate email with 409', async () => {
      const res = await api
        .post('/api/auth/signup')
        .send(validUser)
        .expect(409);

      assert.strictEqual(res.body.success, false);
      assert.ok(
        res.body.message.toLowerCase().includes('already exists') ||
          res.body.message.toLowerCase().includes('email')
      );
    });

    it('should reject invalid email with 400', async () => {
      const res = await api
        .post('/api/auth/signup')
        .send({
          email: 'not-an-email',
          password: 'SecurePass1',
          fullName: 'Test',
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.ok(Array.isArray(res.body.errors));
    });

    it('should reject weak password with 400', async () => {
      const res = await api
        .post('/api/auth/signup')
        .send({
          email: 'other@example.com',
          password: 'short',
          fullName: 'Test User',
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
      assert.ok(Array.isArray(res.body.errors));
    });

    it('should reject missing required fields with 400', async () => {
      await api.post('/api/auth/signup').send({}).expect(400);
      await api
        .post('/api/auth/signup')
        .send({ email: 'a@b.com', fullName: 'A' })
        .expect(400);
    });
  });

  describe('POST /api/auth/signin', () => {
    it('should sign in with valid credentials and return token', async () => {
      const res = await api
        .post('/api/auth/signin')
        .send({ email: validUser.email, password: validUser.password })
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.token);
      assert.strictEqual(res.body.data.user.email, validUser.email);
      assert.strictEqual(res.body.data.user.password, undefined);
      assert.strictEqual(res.body.data.user.passwordHash, undefined);
    });

    it('should reject wrong password with 401', async () => {
      const res = await api
        .post('/api/auth/signin')
        .send({ email: validUser.email, password: 'WrongPass1' })
        .expect(401);

      assert.strictEqual(res.body.success, false);
      assert.ok(
        res.body.message.toLowerCase().includes('invalid') ||
          res.body.message.toLowerCase().includes('password')
      );
    });

    it('should reject unknown email with 401', async () => {
      const res = await api
        .post('/api/auth/signin')
        .send({ email: 'nobody@example.com', password: 'SecurePass1' })
        .expect(401);

      assert.strictEqual(res.body.success, false);
    });

    it('should reject missing email or password with 400', async () => {
      await api.post('/api/auth/signin').send({}).expect(400);
      await api
        .post('/api/auth/signin')
        .send({ email: 'a@b.com' })
        .expect(400);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    before(async () => {
      const res = await api
        .post('/api/auth/signin')
        .send({ email: validUser.email, password: validUser.password });
      token = res.body.data.token;
    });

    it('should return current user when valid token is provided', async () => {
      const res = await api
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.user.email, validUser.email);
      assert.strictEqual(res.body.data.user.password, undefined);
      assert.strictEqual(res.body.data.user.passwordHash, undefined);
    });

    it('should reject request without token with 401', async () => {
      await api.get('/api/auth/me').expect(401);
    });

    it('should reject invalid token with 401', async () => {
      await api
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});

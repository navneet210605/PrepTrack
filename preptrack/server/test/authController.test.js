jest.mock('../models/User');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'signed-token')
}));

const User = require('../models/User');
const { register, login } = require('../controllers/authController');

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis()
});

describe('authController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register rejects missing fields before database access', async () => {
    const req = { body: { name: 'Ada', email: '' } };
    const res = createResponse();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Please provide name, email, and password'
    });
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test('register creates a user and returns a token', async () => {
    const user = {
      _id: 'user-1',
      name: 'Ada',
      email: 'ada@example.com',
      streak: { current: 0, lastActiveDate: null },
      createdAt: '2026-01-01'
    };
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(user);
    process.env.JWT_SECRET = 'test-secret';

    const req = {
      body: { name: 'Ada', email: 'ada@example.com', password: 'password123' }
    };
    const res = createResponse();
    const next = jest.fn();

    await register(req, res, next);

    expect(User.create).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'password123',
      streak: { current: 0, lastActiveDate: null }
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, token: 'signed-token' })
    );
  });

  test('login rejects invalid credentials', async () => {
    const select = jest.fn().mockResolvedValue(null);
    User.findOne.mockReturnValue({ select });

    const req = {
      body: { email: 'missing@example.com', password: 'password123' }
    };
    const res = createResponse();
    const next = jest.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid email or password'
    });
  });
});

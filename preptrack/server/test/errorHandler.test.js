const errorHandler = require('../middleware/errorHandler');

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis()
});

describe('errorHandler', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns 400 for Mongoose cast errors', () => {
    const error = { name: 'CastError', value: 'bad-id', message: 'Cast failed' };
    const res = createResponse();

    errorHandler(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Resource not found with id of 'bad-id'"
    });
  });

  test('returns 409 for duplicate key errors', () => {
    const error = { code: 11000, keyValue: { email: 'ada@example.com' }, message: 'Duplicate' };
    const res = createResponse();

    errorHandler(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'A record with this email already exists. Please use another value.'
    });
  });
});

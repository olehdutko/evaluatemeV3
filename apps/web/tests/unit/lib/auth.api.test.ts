import { login, register } from '../../../src/lib/auth.api';

describe('auth.api', () => {
  it('sends login request', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          expiresInSeconds: 900,
        },
      }),
    } as unknown as Response);

    const response = await login({ email: 'a@b.com', password: 'Password123' });
    expect(response.data.expiresInSeconds).toBe(900);
  });

  it('sends register request', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'a@b.com',
          username: 'johndoe',
          role: 'user',
          activationStatus: 'pending',
          credits: 10,
          companyName: null,
          firstName: 'John',
          lastName: 'Doe',
          middleName: null,
          birthDate: '1990-01-01',
          country: 'UA',
          city: null,
          phone: null,
          createdAt: new Date().toISOString(),
        },
      }),
    } as unknown as Response);

    const response = await register({
      email: 'a@b.com',
      password: 'Password123',
      role: 'user',
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      birthDate: '1990-01-01',
      country: 'UA',
    });
    expect(response.data.email).toBe('a@b.com');
  });
});

import { jest } from '@jest/globals';
import request from 'supertest';

const mockLockForPrinting = jest.fn();
const mockGetAttendeeByQr = jest.fn();

jest.unstable_mockModule('../src/services/attendeeService.js', () => ({
  attendeeService: {
    lockForPrinting: mockLockForPrinting,
    getAttendeeByQr: mockGetAttendeeByQr
  }
}));

const { app, server } = await import('../src/app.js');

describe('Phase 4: Strict Idempotency / Duplicate-Scan Protection Guardrails', () => {
  afterAll(async () => {
    await server.close();
  });

  test('Should reject duplicate scan inputs if attendee profile is already printing', async () => {
    mockLockForPrinting.mockResolvedValue(null);
    mockGetAttendeeByQr.mockResolvedValue({
      id: 'mock-uuid-222',
      qr_code: 'QR_ATTENDEE_2',
      name: 'Bob Smith',
      check_in_status: 'PRINT_PENDING'
    });

    const response = await request(app)
      .post('/api/checkin/scan')
      .set('Authorization', 'Bearer solstice_kiosk_secret_2026')
      .send({ qrCode: 'QR_ATTENDEE_2' });

    expect(response.statusCode).toBe(409);
    expect(response.body.error).toBe('Duplicate scan blocked.');
    expect(response.body.currentStatus).toBe('PRINT_PENDING');
  });
});

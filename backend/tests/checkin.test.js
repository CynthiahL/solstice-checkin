import { jest } from '@jest/globals';
import request from 'supertest';
import { Inngest } from 'inngest'; // Import the real class structure to build true mock objects

// 1. Setup mock functions for your attendee service layer
const mockLockForPrinting = jest.fn();
const mockGetAttendeeByQr = jest.fn();

jest.unstable_mockModule('../src/services/attendeeService.js', () => ({
  attendeeService: {
    lockForPrinting: mockLockForPrinting,
    getAttendeeByQr: mockGetAttendeeByQr
  }
}));

// 2. Build a valid Inngest instance to preserve mandatory background utility methods
const baseInngest = new Inngest({ id: 'solstice-events-kiosk' });
const mockInngestSend = jest.fn().mockResolvedValue({ ids: ['mock-event-id'] });

jest.unstable_mockModule('../src/inngest/client.js', () => {
  return {
    inngest: {
      id: baseInngest.id,
      // Provide the authentic compilation factory hook so serve() can read metadata safely
      createFunction: baseInngest.createFunction.bind(baseInngest),
      // Intercept and track out-of-thread queue triggers with our mock tracker function
      send: mockInngestSend
    }
  };
});

// 3. Dynamically load the running app engine after all engine mocks are bound
const { app, server } = await import('../src/app.js');

describe('Phase 4: Standard Async Checkin Execution Loop', () => {
  afterAll(async () => {
    await server.close();
  });

  test('Should accept valid checkin and hand execution off to background channels', async () => {
    mockLockForPrinting.mockResolvedValue({
      id: 'mock-uuid-111',
      qr_code: 'QR_ATTENDEE_1',
      name: 'Alice Johnson',
      check_in_status: 'PRINT_PENDING'
    });

    const response = await request(app)
      .post('/api/checkin/scan')
      .set('Authorization', 'Bearer solstice_kiosk_secret_2026')
      .send({ qrCode: 'QR_ATTENDEE_1' });

    expect(response.statusCode).toBe(202);
    expect(response.body.status).toBe('PRINT_PENDING');
    expect(response.body.attendeeId).toBe('mock-uuid-111');
    expect(mockInngestSend).toHaveBeenCalled();
  });
});

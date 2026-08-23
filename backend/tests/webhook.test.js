import { jest } from '@jest/globals';
import request from 'supertest';
import crypto from 'crypto';

const mockMarkAsPrinted = jest.fn();

jest.unstable_mockModule('../src/services/printService.js', () => ({
  printService: {
    markAsPrinted: mockMarkAsPrinted
  }
}));

const { app, server } = await import('../src/app.js');

describe('Phase 4: Async Webhook Execution Callbacks', () => {
  afterAll(async () => {
    await server.close();
  });

  test('Should process valid print confirmation and update database states', async () => {
    mockMarkAsPrinted.mockResolvedValue({
      id: 'mock-uuid-333',
      check_in_status: 'CHECKED_IN'
    });

    const payload = { event_type: 'print.success', attendeeId: 'mock-uuid-333' };
    
    const signature = crypto
      .createHmac('sha256', 'vendor_webhook_secret_2026')
      .update(JSON.stringify(payload))
      .digest('hex');

    const response = await request(app)
      .post('/api/webhooks/printer')
      .set('x-solstice-signature', signature)
      .send(payload);

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Webhook resolved successfully');
  });
});

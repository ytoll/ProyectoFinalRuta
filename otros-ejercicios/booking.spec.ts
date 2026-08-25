import { test, expect, APIRequestContext } from '@playwright/test';

const BASE_URL = 'https://restful-booker.herokuapp.com';

const NEW_BOOKING = {
  firstname: 'Ana',
  lastname: 'Garcia',
  totalprice: 150,
  depositpaid: true,
  bookingdates: {
    checkin: '2026-07-01',
    checkout: '2026-07-05',
  },
  additionalneeds: 'Breakfast',
};

let request: APIRequestContext;
let authToken: string;
let bookingId: number;

test.beforeAll(async ({ playwright }) => {
  request = await playwright.request.newContext({ baseURL: BASE_URL });

  const authResponse = await request.post('/auth', {
    data: { username: 'admin', password: 'password123' },
  });
  const authBody = await authResponse.json();
  authToken = authBody.token;

  const bookingResponse = await request.post('/booking', { data: NEW_BOOKING });
  const bookingBody = await bookingResponse.json();
  bookingId = bookingBody.bookingid;
});

test.afterAll(async () => {
  await request.dispose();
});

test('POST /auth devuelve status 200 y un token válido', async () => {
  expect(authToken).toBeTruthy();
  expect(typeof authToken).toBe('string');
});

test('POST /booking devuelve status 200 y el cuerpo con los datos correctos', async () => {
  const response = await request.post('/booking', { data: NEW_BOOKING });
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.booking.firstname).toBe(NEW_BOOKING.firstname);
  expect(body.booking.lastname).toBe(NEW_BOOKING.lastname);
  expect(body.booking.totalprice).toBe(NEW_BOOKING.totalprice);
  expect(body.booking.bookingdates).toEqual(NEW_BOOKING.bookingdates);
});

test('PUT /booking/:id SIN token devuelve 403 (no se puede modificar sin permiso)', async () => {
  const response = await request.put(`/booking/${bookingId}`, {
    data: { ...NEW_BOOKING, firstname: 'Intruso' },
  });

  expect(response.status()).toBe(403);
});

test('PUT /booking/:id CON token válido devuelve 200 y actualiza la reserva correctamente', async () => {
  const updatedBooking = {
    ...NEW_BOOKING,
    firstname: 'AnaActualizada',
    totalprice: 200,
  };

  const response = await request.put(`/booking/${bookingId}`, {
    headers: { Cookie: `token=${authToken}` },
    data: updatedBooking,
  });
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.firstname).toBe(updatedBooking.firstname);
  expect(body.totalprice).toBe(updatedBooking.totalprice);
  expect(body.bookingdates).toEqual(updatedBooking.bookingdates);
});

test('GET /booking/:id de un id inexistente devuelve 404', async () => {
  const response = await request.get('/booking/999999999');

  expect(response.status()).toBe(404);
});

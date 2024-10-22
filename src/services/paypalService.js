const config = require('config');
const { v4: uuidv4 } = require('uuid');

const base64UrlEncode = (str) => {
  return Buffer.from(str).toString('base64url');
};

const createUnsignedJWT = (issuer, payerId) => {
  const header = {
    alg: 'none',
    typ: 'JWT'
  };

  const payload = {
    iss: issuer,
    payer_id: payerId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 // optional: set expiration to 1 hour
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  // construct unsigned JWT
  return `${encodedHeader}.${encodedPayload}.`;
};

async function createPayPalPayment(totalAmount, payeeEmail, brandName, logoImage, payerId) {
  const clientId = config.get('paypal').clientId;
  const clientSecret = config.get('paypal').secretKey;
  const base64Credentials = base64UrlEncode(`${clientId}:${clientSecret}`);

  // get an access token
  const tokenResponse = await fetch(`${config.get('paypal').apiBaseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${base64Credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!tokenResponse.ok) {
    throw new Error(`Error fetching access token: ${tokenResponse.statusText}`);
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  const unsignedToken = createUnsignedJWT('badminton-app', payerId);

  // use the access token to create a payment
  const paymentResponse = await fetch(`${config.get('paypal').apiBaseUrl}/v1/payments/payment`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': uuidv4()
      // 'PayPal-Auth-Assertion': unsignedToken
    },
    body: JSON.stringify({
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      transactions: [
        {
          amount: {
            total: totalAmount,
            currency: 'PHP'
          },
          payee: {
            email: payeeEmail
          },
          description: 'Payment for court reservation',
          note_to_payer: 'Contact us for any questions on your order.'
        }
      ],
      redirect_urls: {
        return_url: `${config.get('frontendUrl')}/user/court-reservation`,
        cancel_url: `${config.get('frontendUrl')}/user/court-reservation`
      },
      application_context: {
        // brand_name: brandName || 'badminton-app',
        brand_name: brandName,
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING'
        // user_action: 'PAY_NOW'
        // logo_image: 'https://r2-api.mayor.workers.dev/logo.png'
        // logo_image: `${config.get('frontendUrl')}${logoImage}`
      }
    })
  });

  const paymentData = await paymentResponse.json();
  return paymentData;
}

module.exports = { createPayPalPayment };

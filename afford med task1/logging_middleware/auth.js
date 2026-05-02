const axios = require('axios');

let accessToken = null;
let tokenExpiry = 0;

async function getToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      'http://20.207.122.201/evaluation-service/auth',
      {
        email: process.env.EMAIL,
        name: process.env.NAME,
        rollNo: process.env.ROLL_NO,
        accessCode: process.env.ACCESS_CODE,
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    accessToken = response.data.access_token;
    console.log('[AUTH] Token obtained');
    tokenExpiry = Date.now() + (response.data.expires_in || 3600) * 1000;
    return accessToken;
  } catch (error) {
    console.error('[AUTH] Failed:', error.message);
    if (error.response) {
      console.error('[AUTH] Status:', error.response.status);
      console.error('[AUTH] Data:', JSON.stringify(error.response.data));
    }
    return null;
  }
}

module.exports = { getToken };

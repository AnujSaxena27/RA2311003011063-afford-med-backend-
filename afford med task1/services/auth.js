const axios = require('axios');

let accessToken = null;
let tokenExpiry = null;

const AUTH_URL = 'http://20.207.122.201/evaluation-service/auth';

async function getToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      AUTH_URL,
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

    tokenExpiry = Date.now() + 60 * 60 * 1000;

    console.log("TOKEN:", accessToken); 

    return accessToken;

  } catch (error) {
    console.log("AUTH ERROR:", error.response?.data || error.message);
    return null;
  }
}

module.exports = { getToken };
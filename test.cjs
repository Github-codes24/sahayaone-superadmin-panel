const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('https://api.advitacredit.com/api/v1/super-admin/auth/roles', {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    console.log(res.data);
  } catch (err) {
    console.error("ERROR:", err.response ? err.response.data : err.message);
  }
}

test();

const fs = require('fs');
const envVars = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => { const match = line.match(/^([^=]+)=(.*)$/); if (match) acc[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, ''); return acc; }, {});
const cookie = envVars.NAVER_ADMIN_COOKIE;
const url = 'https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberProfile?cafeId=31034331&memberId=ehddk2013';
fetch(url, {
  headers: {
    'Cookie': cookie,
    'User-Agent': 'Mozilla/5.0 (iPhone)',
    'Accept': 'application/json',
    'Referer': 'https://m.cafe.naver.com/'
  }
})
.then(r => r.json())
.then(json => console.log('Result:', JSON.stringify(json, null, 2).substring(0, 1500)))
.catch(console.error);

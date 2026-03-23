const fs = require('fs');
const envVars = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => { const match = line.match(/^([^=]+)=(.*)$/); if (match) acc[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, ''); return acc; }, {});
const cookie = envVars.NAVER_ADMIN_COOKIE;
const url = 'https://cafe.naver.com/ManageMemberAjax.nhn';
fetch(url, {
  method: 'POST',
  headers: {
    'Cookie': cookie,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': 'https://cafe.naver.com/ManageMember.nhn?clubid=31034331'
  },
  body: 'm=searchMemberInfo&clubid=31034331&searchKeyword=ehddk2013'
})
.then(r => r.text())
.then(txt => console.log('Response:', txt.substring(0, 1500)))
.catch(console.error);

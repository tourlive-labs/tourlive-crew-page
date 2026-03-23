const fs = require('fs');
const envVars = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => { 
    const match = line.match(/^([^=]+)=(.*)$/); 
    if (match) acc[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, ''); 
    return acc; 
}, {});
const cookie = envVars.NAVER_ADMIN_COOKIE;
const url = 'https://cafe.naver.com/ManageMemberAjax.nhn?m=searchMemberInfo&clubid=31034331&searchKeyword=ehddk2013';
fetch(url, { headers: { 'Cookie': cookie, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } })
.then(r => r.text())
.then(txt => console.log(txt.substring(0, 500)))
.catch(console.error);

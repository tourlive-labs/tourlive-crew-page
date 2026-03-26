const fs = require('fs');
const envVars = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => { 
    const match = line.match(/^([^=]+)=(.*)$/); 
    if (match) acc[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, ''); 
    return acc; 
}, {});
const cookie = envVars.NAVER_ADMIN_COOKIE;
const url = 'https://cafe.naver.com/CafeMemberNetworkView.nhn?m=view&clubid=31034331&memberid=ehddk2013';
fetch(url, { headers: { 'Cookie': cookie, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } })
.then(r => r.text())
.then(txt => {
    fs.writeFileSync('pc-member.html', txt);
    console.log("HTML written to pc-member.html", txt.substring(0, 100));
})
.catch(console.error);

const fs = require('fs');
const envVars = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => { 
    const match = line.match(/^([^=]+)=(.*)$/); 
    if (match) acc[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, ''); 
    return acc; 
}, {});

const cookie = envVars.NAVER_ADMIN_COOKIE;

if (!cookie) {
    console.error("NAVER_ADMIN_COOKIE not found in .env.local!");
    process.exit(1);
}

const url = 'https://m.cafe.naver.com/CafeMemberNetworkView.nhn?m=view&clubid=31034331&memberid=ehddk2013';

fetch(url, { 
    headers: { 
        'Cookie': cookie, 
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html'
    } 
})
.then(r => r.text())
.then(html => {
    fs.writeFileSync('naver-profile-debug.html', html);
    console.log("HTML saved to naver-profile-debug.html");
})
.catch(console.error);

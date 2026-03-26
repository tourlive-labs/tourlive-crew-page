const fs = require('fs');
const envVars = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => { const match = line.match(/^([^=]+)=(.*)$/); if (match) acc[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, ''); return acc; }, {});
const cookie = envVars.NAVER_ADMIN_COOKIE;
const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
const urlPosts = 'https://m.cafe.naver.com/ArticleSearchList.nhn?search.clubid=31034331&search.writer=ehddk2013';
fetch(urlPosts, { headers: { 'Cookie': cookie, 'User-Agent': USER_AGENT, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' } }).then(r=>r.text()).then(html => fs.writeFileSync('debug-posts.html', html)).catch(console.error);

const fs = require('fs');
const envVars = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => { const match = line.match(/^([^=]+)=(.*)$/); if (match) acc[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, ''); return acc; }, {});
const cookie = envVars.NAVER_ADMIN_COOKIE;
const url = 'https://m.cafe.naver.com/ArticleSearchList.nhn?search.clubid=31034331&search.searchBy=1&search.writer=ehddk2013';
fetch(url, {
  headers: {
    'Cookie': cookie,
    'User-Agent': 'Mozilla/5.0 (iPhone)'
  }
})
.then(r => r.text())
.then(txt => fs.writeFileSync('search-comments.html', txt))
.catch(console.error);

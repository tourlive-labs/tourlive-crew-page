const fs = require('fs');
const envVars = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => { const match = line.match(/^([^=]+)=(.*)$/); if (match) acc[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, ''); return acc; }, {});
const cookie = envVars.NAVER_ADMIN_COOKIE;
const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
const urlPosts = 'https://m.cafe.naver.com/ArticleSearchList.nhn?search.clubid=31034331&search.writer=ehddk2013';
const urlComments = 'https://m.cafe.naver.com/ArticleSearchList.nhn?search.clubid=31034331&search.searchBy=1&search.writer=ehddk2013';

async function test() {
  const p = await fetch(urlPosts, { headers: { 'Cookie': cookie, 'User-Agent': USER_AGENT } }).then(r=>r.text());
  console.log('Posts HTML includes list_area?', p.includes('list_area'));
  const c = await fetch(urlComments, { headers: { 'Cookie': cookie, 'User-Agent': USER_AGENT } }).then(r=>r.text());
  console.log('Comments HTML includes list_area?', c.includes('list_area'));
}
test();

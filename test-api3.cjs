const fs = require('fs');
const envVars = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => { const match = line.match(/^([^=]+)=(.*)$/); if (match) acc[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, ''); return acc; }, {});
const cookie = envVars.NAVER_ADMIN_COOKIE;
const urlPosts = 'https://apis.naver.com/cafe-web/cafe-mobile/CafeMobileWebArticleSearchList?cafeId=31034331&searchBy=3&query=ehddk2013';
const urlComments = 'https://apis.naver.com/cafe-web/cafe-mobile/CafeMobileWebArticleSearchList?cafeId=31034331&searchBy=4&query=ehddk2013';

async function test() {
  const p = await fetch(urlPosts, { headers: { 'Cookie': cookie, 'User-Agent': 'Mozilla/5.0' } }).then(r=>r.text());
  console.log('Posts:', p.substring(0, 500));
  const c = await fetch(urlComments, { headers: { 'Cookie': cookie, 'User-Agent': 'Mozilla/5.0' } }).then(r=>r.text());
  console.log('Comments:', c.substring(0, 500));
}
test();

const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function run() {
    const parser = new PDFParse();

    const buf1 = fs.readFileSync('archive/블로그-파리_미술관_여행_포스팅_챌린지.pdf');
    const buf2 = fs.readFileSync('archive/카페_챌린지.pdf');

    const blog = await parser.parse(buf1);
    const cafe  = await parser.parse(buf2);

    console.log('=== BLOG CHALLENGE PDF ===');
    console.log(blog.text);
    console.log('\n\n=== CAFE CHALLENGE PDF ===');
    console.log(cafe.text);
}

run().catch(e => console.error('Error:', e.message));

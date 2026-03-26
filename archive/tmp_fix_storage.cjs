const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8')
  .split('\n')
  .reduce((acc, line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      acc[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
    return acc;
  }, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function checkAndCreateBucket() {
  const listUrl = `${supabaseUrl}/storage/v1/bucket`;
  
  try {
    console.log('Listing buckets...');
    const listResponse = await fetch(listUrl, {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });

    if (!listResponse.ok) {
      console.error('Error listing buckets:', listResponse.status, await listResponse.text());
    } else {
      const buckets = await listResponse.json();
      console.log('Existing buckets:', buckets);
      
      const hasBanners = buckets.some(b => b.id === 'banners');
      if (!hasBanners) {
        console.log('Creating "banners" bucket...');
        const createResponse = await fetch(listUrl, {
          method: 'POST',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: 'banners',
            name: 'banners',
            public: true
          })
        });
        
        if (!createResponse.ok) {
          console.error('Error creating bucket:', createResponse.status, await createResponse.text());
        } else {
          console.log('Successfully created "banners" bucket.');
        }
      } else {
        console.log('"banners" bucket already exists.');
      }
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

checkAndCreateBucket();

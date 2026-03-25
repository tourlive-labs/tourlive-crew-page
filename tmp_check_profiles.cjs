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

async function checkProfiles() {
  const url = `${supabaseUrl}/rest/v1/profiles?select=tourlive_email,nickname,role,created_at&order=created_at.desc&limit=5`;
  console.log('Fetching recent profiles...');
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });

    if (!response.ok) {
      console.error('Error fetching profiles:', response.status, await response.text());
    } else {
      const data = await response.json();
      console.log('Recent Profiles:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

checkProfiles();

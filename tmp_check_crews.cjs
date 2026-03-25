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

async function checkCrewsSchema() {
  const url = `${supabaseUrl}/rest/v1/crews?select=*&limit=1`;
  console.log('Checking crews table...');
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'return=representation'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching crews:', response.status, errorText);
    } else {
      const data = await response.json();
      console.log('Crews Data:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

checkCrewsSchema();

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

async function checkFullSchema() {
  const url = `${supabaseUrl}/rest/v1/`;
  console.log('Fetching full schema...');
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });

    if (!response.ok) {
      console.error('Error fetching schema:', response.status);
    } else {
      const data = await response.json();
      fs.writeFileSync('new_schema.json', JSON.stringify(data, null, 2));
      console.log('Schema saved to new_schema.json');
      
      console.log('Crews definition:', JSON.stringify(data.definitions.crews, null, 2));
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

checkFullSchema();

const fs = require('fs');

// Read .env.local manually
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

async function addBatchMinimal() {
  const url = `${supabaseUrl}/rest/v1/batches`;
  
  // Try inserting with minimal columns
  const record = {
    term: 14,
    start_date: '2026-03-01T00:00:00Z'
  };

  console.log('Inserting batch 14 (minimal) into new project...');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(record)
    });

    if (!response.ok) {
      console.error('Error inserting batch:', response.status, await response.text());
    } else {
      const data = await response.json();
      console.log('Successfully inserted batch (minimal):', data);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

addBatchMinimal();

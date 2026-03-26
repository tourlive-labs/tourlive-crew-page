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

async function addBatch() {
  const url = `${supabaseUrl}/rest/v1/batches`;
  
  // Try inserting with all columns including 'year'
  const record = {
    year: 2026,
    term: 14,
    start_date: '2026-03-01T00:00:00Z',
    is_active: true
  };

  console.log('Inserting batch 14 into new project...');
  
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
      const errorData = await response.json();
      console.error('Error inserting batch:', response.status, errorData);
      
      // If 'year' column is missing, retry without it
      if (errorData.message && errorData.message.includes('year')) {
        console.log('Retrying without "year" column...');
        delete record.year;
        const retryResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(record)
        });
        
        if (!retryResponse.ok) {
          console.error('Retry error:', retryResponse.status, await retryResponse.text());
        } else {
          console.log('Successfully inserted batch (without "year"):', await retryResponse.json());
        }
      }
    } else {
      const data = await response.json();
      console.log('Successfully inserted batch:', data);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

addBatch();

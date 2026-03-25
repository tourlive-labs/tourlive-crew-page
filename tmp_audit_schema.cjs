const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('new_schema.json', 'utf-8'));

const requiredSchema = {
  batches: ['id', 'term', 'start_date', 'year', 'is_active'],
  crews: ['id', 'user_id', 'batch_id', 'name', 'created_at', 'updated_at'],
  profiles: ['id', 'crew_id', 'full_name', 'phone_number', 'tourlive_email', 'contact_email', 'selected_activity', 'nickname', 'travel_country', 'travel_city', 'banner_image_url', 'hashtag_1', 'hashtag_2', 'hashtag_3', 'role']
};

console.log('--- Schema Audit ---');
for (const [table, columns] of Object.entries(requiredSchema)) {
  const definition = schema.definitions[table];
  if (!definition) {
    console.error(`[CRITICAL] Table "${table}" is MISSING!`);
    continue;
  }
  
  const existingColumns = Object.keys(definition.properties);
  console.log(`Table "${table}":`);
  columns.forEach(col => {
    if (existingColumns.includes(col)) {
      console.log(`  [OK] ${col}`);
    } else {
      console.error(`  [MISSING] ${col}`);
    }
  });
  
  const extraColumns = existingColumns.filter(c => !columns.includes(c));
  if (extraColumns.length > 0) {
    console.log(`  [EXTRA] ${extraColumns.join(', ')}`);
  }
}

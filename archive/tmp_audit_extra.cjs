const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('new_schema.json', 'utf-8'));

const requiredSchema = {
  missions: ['id', 'profile_id', 'mission_month', 'post_url', 'status', 'points_granted', 'created_at', 'updated_at'],
  submissions: ['id', 'crew_id', 'activity_id', 'file_url', 'content_text', 'created_at', 'updated_at'],
  activity_schedules: ['id', 'batch_id', 'type', 'title', 'scheduled_at', 'is_essential']
};

console.log('--- Mission & Submission Audit ---');
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
}

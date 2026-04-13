import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Manual dotenv loading for standard Node
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        process.env[match[1]] = value;
      }
    });
  }
}

loadEnv();

async function testConnection(name, url) {
  console.log(`\n--- Testing ${name} ---`);
  if (!url) {
    console.log(`[✗] Skipping: ${name} is not defined in .env.local`);
    return false;
  }
  
  const sql = postgres(url, { connect_timeout: 5 });
  try {
    const result = await sql`SELECT version()`;
    console.log(`[✓] Connection Success: ${result[0].version.substring(0, 50)}...`);
    
    const tables = await sql`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('public', 'plot_news_app')
    `;
    
    if (tables.length > 0) {
      console.log('Tables found:');
      tables.forEach((t) => {
        console.log(` - [${t.table_schema}] ${t.table_name}`);
      });
    } else {
      console.log('No user tables found.');
    }
    
    return true;
  } catch (err) {
    console.log(`[✗] Connection Failed: ${err.message}`);
    return false;
  } finally {
    await sql.end();
  }
}

async function main() {
  const dbOk = await testConnection('DATABASE_URL (Pooler)', process.env.DATABASE_URL);
  const directOk = await testConnection('DIRECT_URL (Direct)', process.env.DIRECT_URL);
  
  console.log("\n--- Final Status ---");
  if (dbOk && directOk) {
    console.log("All systems go. Your DB is healthy.");
  } else {
    console.log("Check your credentials in .env.local.");
    process.exit(1);
  }
}

main().catch(console.error);

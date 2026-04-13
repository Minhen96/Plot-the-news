import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env.local' });

async function testConnection(name: string, url: string) {
  console.log(`\n--- Testing ${name} ---`);
  // Use a short timeout for the check
  const sql = postgres(url, { connect_timeout: 10 });
  try {
    const result = await sql`SELECT version()`;
    console.log(`[✓] Connection Success: ${result[0].version.substring(0, 50)}...`);
    
    // Detailed verification of schemas and tables
    const schemas = await sql`SELECT schema_name FROM information_schema.schemata`;
    console.log('Available schemas:', schemas.map((s: any) => s.schema_name).join(', '));
    
    const tables = await sql`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('public', 'plot_news_app')
    `;
    
    if (tables.length > 0) {
      console.log('Tables found in application schemas:');
      tables.forEach((t: any) => {
        console.log(` - [${t.table_schema}] ${t.table_name}`);
      });
    } else {
      console.log('No user tables found in public or plot_news_app schemas.');
    }
    
    return true;
  } catch (err: any) {
    console.log(`[✗] Connection Failed: ${err.message}`);
    return false;
  } finally {
    await sql.end();
  }
}

async function main() {
  if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
    console.error("Error: DATABASE_URL or DIRECT_URL is missing in .env.local");
    process.exit(1);
  }

  const dbOk = await testConnection('DATABASE_URL (Pooler)', process.env.DATABASE_URL!);
  const directOk = await testConnection('DIRECT_URL (Direct)', process.env.DIRECT_URL!);
  
  console.log("\n--- Final Status ---");
  if (dbOk && directOk) {
    console.log("All systems go. Your database connections are healthy and schemas are accessible.");
  } else {
    console.log("One or more connections failed. Please check your Supabase dashboard and .env.local.");
    process.exit(1);
  }
}

main().catch(console.error);

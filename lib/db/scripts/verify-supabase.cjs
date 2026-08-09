const { Client } = require("pg");

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query(
    "select table_name from information_schema.tables where table_schema = 'public' order by table_name",
  );

  console.log(rows.map((row) => row.table_name).join("\n"));
  await client.end();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

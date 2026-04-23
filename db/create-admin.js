import pg from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

await db.connect();

const username = "admin";
const password = "Datga@852963"; // ← Change this to your new password, then run: node db/create-admin.js
const hash = await bcrypt.hash(password, 10);

await db.query(
    "INSERT INTO admins (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET password_hash = $2",
    [username, hash]
);

console.log(`✅ Admin created: ${username} / ${password}`);
console.log("⚠️  IMPORTANT: Change this password after your first login!");
await db.end();

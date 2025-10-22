import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { v7 as uuidv7 } from "uuid";
import { authProviders } from "../src/infrastructure/repositories/persistence/mariadb/schema/auth";
import { AuthProvider } from "../src/core/domain/constants/auth-providers";

async function seedProviders() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_AUTH_SCHEMA_NAME || "svc-auth",
    password: process.env.DB_AUTH_SCHEMA_PASSWORD || "auth",
    database: process.env.DB_NAME || "minpass",
  });

  const db = drizzle(connection, {
    schema: { authProviders },
    mode: "default",
  });

  try {
    console.log("🗑️  Deleting existing providers...");
    await db.delete(authProviders);

    console.log("🌱 Seeding auth_providers with UUIDv7...");
    const providers = [
      { id: uuidv7(), provider: AuthProvider.GOOGLE, imgUrl: null },
      { id: uuidv7(), provider: AuthProvider.GITHUB, imgUrl: null },
      { id: uuidv7(), provider: AuthProvider.KAKAO, imgUrl: null },
    ];

    await db.insert(authProviders).values(providers);

    console.log("✅ Providers seeded successfully:");
    providers.forEach((p) => {
      console.log(`   - ${p.provider}: ${p.id}`);
    });

    const result = await db.select().from(authProviders);
    console.log(`\n📊 Total providers in DB: ${result.length}`);
  } catch (error) {
    console.error("❌ Error seeding providers:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedProviders();

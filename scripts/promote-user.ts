import "dotenv/config";
import { DataSource } from "typeorm";
import { User } from "../src/modules/users/entities/user.entity";

async function main() {
  const email = process.env.EMAIL || process.argv[2];
  const role = process.env.ROLE || process.argv[3] || "admin";

  if (!email) {
    console.error(
      "Falta el parámetro EMAIL. Usar EMAIL=foo@example.com npm run promote:user"
    );
    process.exit(1);
  }

  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USERNAME || "PostgreSQL",
    password: process.env.DB_PASSWORD || "2101087019",
    database: process.env.DB_DATABASE || "Movil__app",
    entities: [__dirname + "/../src/modules/**/**/*.entity{.ts,.js}"],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    const repo = dataSource.getRepository(User);

    const user = await repo.findOne({ where: { email } });
    if (!user) {
      console.error(`Usuario con email "${email}" no encontrado.`);
      process.exit(1);
    }

    user.role = role as "admin" | "user";
    await repo.save(user);
    console.log(
      `Usuario ${email} actualizado a rol '${role}' (id: ${user.id})`
    );
    await dataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error("Error promoviendo usuario:", err);
    try {
      await dataSource.destroy();
    } catch (_) {
      // ignore
    }
    process.exit(1);
  }
}

void main();

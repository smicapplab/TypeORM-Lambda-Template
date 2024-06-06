import { DataSource } from "typeorm";

let dataSource: typeof AppDataSource | null = null;

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.mysqlHost,
    username: process.env.mysqlUser,
    password: process.env.mysqlPassword,
    database: process.env.dbName,
    port: 3306,
    entities: [

    ],
    logging: process.env.environment === "dev",
    synchronize: true,
});
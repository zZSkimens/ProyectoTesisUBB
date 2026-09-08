import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

export const pool = new Pool({
user: process.env.DB_USER,
host: process.env.DB_HOST,
database: process.env.DB_NAME,
password: process.env.DB_PASSWORD,
port: process.env.DB_PORT,
});


export const connectDB = async () => {
try {
    const client = await pool.connect();
    console.log("=> Conexión a PostgreSQL establecida con éxito");
    client.release();
} catch (error) {
    console.error("=> Error crítico: No se pudo conectar a PostgreSQL");
    throw error;
}
};
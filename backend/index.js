import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { connectDB } from "./config/configDb.js";
import indexRoutes from "./routes/index.routes.js";

const app = express();

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
res.send("¡Bienvenido a la API!");
});

connectDB()
.then(() => {
    app.use("/api", indexRoutes);
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
    console.log(`=> Servidor iniciado en http://localhost:${PORT}`);
    });
})
.catch((error) => {
    console.log("Error al levantar el servidor:", error);
    process.exit(1);
});
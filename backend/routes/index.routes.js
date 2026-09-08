import { Router } from "express";
import progresoRoutes from "./progreso.routes.js";

const router = Router();

router.use("/telemetria", progresoRoutes);

export default router;
import { Router } from "express";
import { validarDatos } from "../validations/progreso.validation.js";
import { registrar, obtenerLista } from "../controllers/progreso.controller.js";

const router = Router();

router.post("/", validarDatos, registrar);
router.get("/", obtenerLista);

export default router;
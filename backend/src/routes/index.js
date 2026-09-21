import { Router } from 'express';
import authRoutes from './auth.routes.js';
import tutoresRoutes from './tutores.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);

apiRouter.use('/tutores', tutoresRoutes);

export default apiRouter;

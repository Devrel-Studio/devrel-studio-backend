import { Router } from "express";
import swaggerUI from "swagger-ui-express";

import { authenticateWithToken } from "../middlewares/auth.js";
import { handle404, handleError } from "../middlewares/errors.js";
import authRouter from "./auth.js";
import measurementRouter from "./measurement.js";
import organisationRouter from "./organisation.js";
import projectRouter from "./project.js";
import sourceRouter from "./source.js";
import eventRouter from "./event.js";
import urls from "../urls.js";
import spec from "../openapi.js";

const router = Router();

// Swagger API docs
const swaggerSpecPath = `${urls.swagger.path}/${urls.swagger.spec}`;
const swaggerUIOptions = {
  swaggerOptions: {
    url: swaggerSpecPath,
  },
};
router.get(swaggerSpecPath, (req, res) => res.json(spec));
router.use(
  urls.swagger.path,
  swaggerUI.serve,
  swaggerUI.setup(null, swaggerUIOptions)
);

// Authentication
router.use(authenticateWithToken);
router.use(urls.apiPrefix + urls.auth.path, authRouter);

// CRUD API
router.use(urls.apiPrefix + urls.measurement.path, measurementRouter);
router.use(urls.apiPrefix + urls.organisation.path, organisationRouter);
router.use(urls.apiPrefix + urls.project.path, projectRouter);
router.use(urls.apiPrefix + urls.source.path, sourceRouter);
router.use(urls.apiPrefix + urls.event.path, eventRouter);

// Redirect browsers from index to API docs
router.get("/", (req, res, next) => {
  if (req.accepts("text/html")) {
    res.redirect(urls.swagger.path);
  } else {
    next();
  }
});

// Error handlers
router.use(handle404);
router.use(handleError);

export default router;

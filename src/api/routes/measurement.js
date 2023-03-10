import { Router } from "express";

import MeasurementService from "../../services/measurement.js";
import { requireUser } from "../middlewares/auth.js";
import { requireSchema, requireValidId } from "../middlewares/validate.js";
import schema from "../schemas/measurement.js";

const router = Router();

router.use(requireUser);

/** @swagger
 *
 * tags:
 *   name: Measurement
 *   description: API for managing Measurement objects
 *
 * /measurement:
 *   get:
 *     tags: [Measurement]
 *     summary: Get all the Measurement objects
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of Measurement objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Measurement'
 */
router.get("", async (req, res, next) => {
  try {
    const results = await MeasurementService.list();
    res.json(results);
  } catch (error) {
    if (error.isClientError()) {
      res.status(400).json({ error });
    } else {
      next(error);
    }
  }
});

/** @swagger
 *
 * /measurement:
 *   post:
 *     tags: [Measurement]
 *     summary: Create a new Measurement
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Measurement'
 *     responses:
 *       201:
 *         description: The created Measurement object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Measurement'
 */
router.post("", requireSchema(schema), async (req, res, next) => {
  try {
    const obj = await MeasurementService.create(req.validatedBody);
    res.status(201).json(obj);
  } catch (error) {
    if (error.isClientError()) {
      res.status(400).json({ error });
    } else {
      next(error);
    }
  }
});

/** @swagger
 *
 * /measurement/{id}:
 *   get:
 *     tags: [Measurement]
 *     summary: Get a Measurement by id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Measurement object with the specified id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Measurement'
 */
router.get("/:id", requireValidId, async (req, res, next) => {
  try {
    const obj = await MeasurementService.get(req.params.id);
    if (obj) {
      res.json(obj);
    } else {
      res.status(404).json({ error: "Resource not found" });
    }
  } catch (error) {
    if (error.isClientError()) {
      res.status(400).json({ error });
    } else {
      next(error);
    }
  }
});

/** @swagger
 *
 * /measurement/project/{id}:
 *   get:
 *     tags: [Measurement]
 *     summary: Get a Measurement by project id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Measurement objects for project with specified id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Measurement'
 */

router.get("/project/:id", requireValidId, async (req, res, next) => {
  try {

    const obj = await MeasurementService.for(req.params.id);
    if (obj) {
      res.json({ github: obj} );
    } else {
      res.status(404).json({ error: "Resource not found" });
    }
  } catch (error) {
    if (error.isClientError()) {
      res.status(400).json({ error });
    } else {
      next(error);
    }
  }
});


/** @swagger
 *
 * /measurement/{id}:
 *   put:
 *     tags: [Measurement]
 *     summary: Update Measurement with the specified id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Measurement'
 *     responses:
 *       200:
 *         description: The updated Measurement object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Measurement'
 */
router.put(
  "/:id",
  requireValidId,
  requireSchema(schema),
  async (req, res, next) => {
    try {
      const obj = await MeasurementService.update(
        req.params.id,
        req.validatedBody
      );
      if (obj) {
        res.status(200).json(obj);
      } else {
        res.status(404).json({ error: "Resource not found" });
      }
    } catch (error) {
      if (error.isClientError()) {
        res.status(400).json({ error });
      } else {
        next(error);
      }
    }
  }
);

/** @swagger
 *
 * /measurement/{id}:
 *   delete:
 *     tags: [Measurement]
 *     summary: Delete Measurement with the specified id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *        description: OK, object deleted
 */
router.delete("/:id", requireValidId, async (req, res, next) => {
  try {
    const success = await MeasurementService.delete(req.params.id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Not found, nothing deleted" });
    }
  } catch (error) {
    if (error.isClientError()) {
      res.status(400).json({ error });
    } else {
      next(error);
    }
  }
});

export default router;

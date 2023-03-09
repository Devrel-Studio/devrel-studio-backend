import { Router } from "express";

import OrganisationService from "../../services/organisation.js";
import { requireUser } from "../middlewares/auth.js";
import { requireSchema, requireValidId } from "../middlewares/validate.js";
import schema from "../schemas/organisation.js";

const router = Router();

router.use(requireUser);

/** @swagger
 *
 * tags:
 *   name: Organisation
 *   description: API for managing Organisation objects
 *
 * /organisation:
 *   get:
 *     tags: [Organisation]
 *     summary: Get all the Organisation objects
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of Organisation objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Organisation'
 */
router.get("", async (req, res, next) => {
  try {
    const results = await OrganisationService.list();
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
 * /organisation:
 *   post:
 *     tags: [Organisation]
 *     summary: Create a new Organisation
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Organisation'
 *     responses:
 *       201:
 *         description: The created Organisation object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organisation'
 */
router.post("", requireSchema(schema), async (req, res, next) => {
  try {
    const obj = await OrganisationService.create(req.validatedBody);
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
 * /organisation/{id}:
 *   get:
 *     tags: [Organisation]
 *     summary: Get a Organisation by id
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
 *         description: Organisation object with the specified id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organisation'
 */
router.get("/:id", requireValidId, async (req, res, next) => {
  try {
    const obj = await OrganisationService.get(req.params.id);
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
 * /organisation/{id}:
 *   put:
 *     tags: [Organisation]
 *     summary: Update Organisation with the specified id
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
 *             $ref: '#/components/schemas/Organisation'
 *     responses:
 *       200:
 *         description: The updated Organisation object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organisation'
 */
router.put(
  "/:id",
  requireValidId,
  requireSchema(schema),
  async (req, res, next) => {
    try {
      const obj = await OrganisationService.update(
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
 * /organisation/{id}:
 *   delete:
 *     tags: [Organisation]
 *     summary: Delete Organisation with the specified id
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
    const success = await OrganisationService.delete(req.params.id);
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

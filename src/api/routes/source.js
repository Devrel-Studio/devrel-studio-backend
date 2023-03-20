import { Router } from "express";

import SourceService from "../../services/source.js";
import { requireUser } from "../middlewares/auth.js";
import { requireSchema, requireValidId } from "../middlewares/validate.js";
import schema from "../schemas/source.js";
import Github from "../../services/github.js";
import MeasurementService from "../../services/measurement.js";

const router = Router();

router.use(requireUser);

/** @swagger
 *
 * tags:
 *   name: Source
 *   description: API for managing Source objects
 *
 * /source:
 *   get:
 *     tags: [Source]
 *     summary: Get all the Source objects
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of Source objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Source'
 */
router.get("/project/:projectId", async (req, res, next) => {
  try {
    const results = await SourceService.list(req.params.projectId);
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
 * /source:
 *   post:
 *     tags: [Source]
 *     summary: Create a new Source
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Source'
 *     responses:
 *       201:
 *         description: The created Source object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Source'
 */
router.post("", requireSchema(schema), async (req, res, next) => {
  try {
    const body = req.validatedBody;
    const obj = await SourceService.create(body);

    if (body.type === "Github") {
      let [history, issues] = await Promise.all([
      await Github.collectHistoryFor(body.value),
      await Github.collectIssuesFor(body.value)
    ]);
      await Promise.all([
      await MeasurementService.saveGithubStarHistory(history, body.project, obj.id),
      await MeasurementService.saveTotalIssues(issues, body.project, obj.id)])
    }

    res.status(201).json(obj);
  } catch (error) {
      next(error);
  }
});

/** @swagger
 *
 * /source/{id}:
 *   get:
 *     tags: [Source]
 *     summary: Get a Source by id
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
 *         description: Source object with the specified id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Source'
 */
router.get("/:id", requireValidId, async (req, res, next) => {
  try {
    const obj = await SourceService.get(req.params.id);
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
 * /source/{id}:
 *   put:
 *     tags: [Source]
 *     summary: Update Source with the specified id
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
 *             $ref: '#/components/schemas/Source'
 *     responses:
 *       200:
 *         description: The updated Source object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Source'
 */
router.put(
  "/:id",
  requireValidId,
  requireSchema(schema),
  async (req, res, next) => {
    try {
      const obj = await SourceService.update(req.params.id, req.validatedBody);
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
 * /source/{id}:
 *   delete:
 *     tags: [Source]
 *     summary: Delete Source with the specified id
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
    const success = await SourceService.delete(req.params.id);
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

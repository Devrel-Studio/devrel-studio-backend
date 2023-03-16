import { Router } from "express";

import ProjectService from "../../services/project.js";
import { requireUser } from "../middlewares/auth.js";
import { requireSchema, requireValidId } from "../middlewares/validate.js";
import schema from "../schemas/project.js";

const router = Router();

router.use(requireUser);

/** @swagger
 *
 * tags:
 *   name: Project
 *   description: API for managing Project objects
 *
 * /project:
 *   get:
 *     tags: [Project]
 *     summary: Get all the Project objects
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of Project objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get("", async (req, res, next) => {
  try {
    let user = req.user.id
    const results = await ProjectService.list(user);
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
 * /project:
 *   post:
 *     tags: [Project]
 *     summary: Create a new Project
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: The created Project object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 */
router.post("", requireSchema(schema), async (req, res, next) => {
  try {
    let bod = req.validatedBody
    console.log("Got request with")
    let id = req.user.id
    console.log(bod)
    const obj = await ProjectService.create({ ...bod, user: id}).catch((err) => {
      console.log("Error creating project")
      console.log(err)
    });

    res.status(201).json(obj);
  } catch (error) {
    console.log(error)
      res.status(400).json({ error });
      next(error);
  }
});

/** @swagger
 *
 * /project/{id}:
 *   get:
 *     tags: [Project]
 *     summary: Get a Project by id
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
 *         description: Project object with the specified id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 */
router.get("/:id", requireValidId, async (req, res, next) => {
  try {
    const obj = await ProjectService.get(req.params.id);
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
 * /project/{id}:
 *   put:
 *     tags: [Project]
 *     summary: Update Project with the specified id
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
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: The updated Project object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 */
router.put(
  "/:id",
  requireValidId,
  requireSchema(schema),
  async (req, res, next) => {
    try {
      const obj = await ProjectService.update(req.params.id, req.validatedBody);
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
 * /project/{id}:
 *   delete:
 *     tags: [Project]
 *     summary: Delete Project with the specified id
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
    const success = await ProjectService.delete(req.params.id);
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

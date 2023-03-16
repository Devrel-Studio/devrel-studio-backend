import { Router } from "express";

import MeasurementService from "../../services/measurement.js";
import { requireUser } from "../middlewares/auth.js";
import { requireSchema, requireValidId } from "../middlewares/validate.js";
import schema from "../schemas/measurement.js";
import SourceService from "../../services/source.js";

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

router.get("/github/:id", requireValidId, async (req, res, next) => {
  try {
    console.log("Got request")
    const project_id = parseInt(req.params.id);
    const from = req.query.from;
    const to = req.query.to;
    let measurements = null;
      let github = await SourceService.sourceFor(project_id, "Github");
      console.log("Github is", github)
      github = github[0];
      console.log(github)
    if(from !== undefined && to !== undefined) {
      measurements = await MeasurementService.listFromTo(project_id, github.id, undefined, from, to);
    } else {
      console.log("Calling all")
      measurements = await MeasurementService.for(project_id, github.id);
    }
    measurements = measurements.sort((a, b) => new Date(a.time) - new Date(b.time))

    let stars = growthFromMeasurements(measurements.filter((m) => m.type === "stars"));
    let issues = measurements.filter((m) => m.type === "issues_total");
    //combine issues opened and closed into a single list by subtracting closed from opened on the same day
    issues = growthFromMeasurements(issues)

    if (measurements) {
      res.json({ stars: stars, issues: issues} );
    } else {
      res.status(404).json({ error: "Resource not found" });
    }
  } catch (error) {
    console.log(error)
    if (error.isClientError()) {
      res.status(400).json({ error });
    } else {
      next(error);
    }
  }
});


router.get("/project/:id/:source", requireValidId, async (req, res, next) => {
  try {
    const project_id = parseInt(req.params.id);
    const source_id = parseInt(req.params.source);
    const from = req.query.from;
    const to = req.query.to;
    const type = req.query.type;
    let measurements = [];
    if(from !== undefined && to !== undefined) {
      measurements = await MeasurementService.listFromTo(project_id, source_id, type, from, to);
    } else {
      console.log("Calling all")
      measurements = await MeasurementService.for(project_id, source_id);
    }
    measurements = measurements.sort((a, b) => new Date(a.time) - new Date(b.time))
    console.log("project,source,from,to",project_id,source_id,from,to)
    if (measurements) {

      let datedMeasurements = measurements.map(it=> { return {amount: it.totalValue, time: new Date(Date.parse(it.time)) } })

      const avgDailyGrowth =
        calculateAverageDailyGrowth(datedMeasurements)

    const avgGrowth = calculateGrowth(datedMeasurements);
      res.json({ daily_average: avgDailyGrowth, total_growth: avgGrowth, github: measurements} );
    } else {
      res.status(404).json({ error: "Resource not found" });
    }
  } catch (error) {
    console.log(error)
      next(error);
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

function calculateGrowth(measurements) {
  if (measurements.length < 2) {
    return 0; // return 0 if there are fewer than two measurements
  }

  const firstMeasurement = measurements[0];
  const lastMeasurement = measurements[measurements.length - 1];

  const percentageChange = (lastMeasurement.amount - firstMeasurement.amount) / firstMeasurement.amount * 100;

  return percentageChange;
}


function calculateAverageDailyGrowth(measurements) {
  if (measurements.length < 2) {
    return 0; // return 0 if there are fewer than two measurements
  }

  let totalPercentageChange = 0;

  for (let i = 1; i < measurements.length; i++) {
    const currentMeasurement = measurements[i];
    const previousMeasurement = measurements[i - 1];

    const percentageChange = (currentMeasurement.amount - previousMeasurement.amount) / previousMeasurement.amount * 100;

    const dailyPercentageChange = Math.pow(1 + percentageChange / 100, 1 / 1) - 1;

    totalPercentageChange += dailyPercentageChange;
  }

  const averageDailyPercentageChange = totalPercentageChange / (measurements.length - 1);

  return averageDailyPercentageChange * 100; // multiply by 100 to convert to percentage
}


function growthFromMeasurements(measurements) {
  let datedMeasurements = measurements.map(it=> { return {amount: it.totalValue, time: new Date(Date.parse(it.time)) } })

  const avgDailyGrowth =
    calculateAverageDailyGrowth(datedMeasurements)

  const avgGrowth = calculateGrowth(datedMeasurements);

  return { daily_average: avgDailyGrowth, total_growth: avgGrowth, data: measurements}
}

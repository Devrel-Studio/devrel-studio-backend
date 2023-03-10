import { Measurement } from "../models/init.js";
import DatabaseError from "../models/error.js";

function prepareData(data) {
  return {
    ...data,
    project:
      data.project !== undefined
        ? {
            connect: { id: data.project },
          }
        : undefined,
  };
}

class MeasurementService {

  //save github star history into measurement table
  static async saveGithubStarHistory(data, project, source) {
    console.log(source)
    try {
      //map data into measurement schema
      data = data.map((item) => {
        return {
          type: "github",
          time: item.day+"T00:00:00.000Z",
          measuredValue: item.stars,
          projectId: project,
        };
      });
      return await Measurement.createMany({ data: data.map((data)=>prepareData(data)) });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }
  static async list() {
    try {
      return Measurement.findMany();
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async for(project) {
    try {
      return await Measurement.findMany({ where: { projectId: project } });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }


  static async get(id) {
    try {
      return await Measurement.findUnique({ where: { id } });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async create(data) {
    try {
      return await Measurement.create({ data: prepareData(data) });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async update(id, data) {
    try {
      return await Measurement.update({
        where: { id },
        data: prepareData(data),
      });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async delete(id) {
    try {
      await Measurement.delete({ where: { id } });
      return true;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }
}

export default MeasurementService;

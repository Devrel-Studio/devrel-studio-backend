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
    source:
      data.source !== undefined
        ? {
          connect: { id: data.source },
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
      let total = 0;
      data = data.map((item) => {
        total+=item.stars;
        return {
          type: "stars",
          time: item.day+"T00:00:00.000Z",
          measuredValue: item.stars,
          totalValue: total,
          projectId: project,
          sourceId: source,
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

  static async listFromTo(project, source, type, from,to) {
    console.log(from,to)
    try {
      if(type === undefined){
        return Measurement.findMany({
          where: {
            projectId: project,
            sourceId: source,
            time: {
              gte: from,
              lte: to,
            }
          }
        });
      }else
      return Measurement.findMany({
        where: {
          projectId: project,
          sourceId: source,
          time: {
            gte: from,
            lte: to,
          },
          type: type
        }
      });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }


  static async for(project, source) {
    try {
      return await Measurement.findMany({ where: { projectId: project, sourceId: source } });
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

  static async saveTotalIssues(open, project, source) {
    try {
      //map data into measurement schema
      let total = 0;
      let data = open.map((item) => {
        total += item.issues;
        return {
          type: "issues_total",
          time: item.day+"T00:00:00.000Z",
          measuredValue: item.issues,
          totalValue: total,
          projectId: project,
          sourceId: source,
        };
      });
      return await Measurement.createMany({ data: data.map((data)=>prepareData(data)) });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }


  static async saveOpenIssues(open, project, source) {
    console.log(source)
    try {
      //map data into measurement schema
      let total = 0;
      let data = open.map((item) => {
        total+=item.issues;
        return {
          type: "issue_open",
          time: item.day+"T00:00:00.000Z",
          measuredValue: item.issues,
          totalValue: total,
          projectId: project,
          sourceId: source,
        };
      });
      return await Measurement.createMany({ data: data.map((data)=>prepareData(data)) });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async saveClosedIssues(open, project, source) {
    console.log(source)
    try {
      //map data into measurement schema
      let total = 0;
      let data = open.map((item) => {
        total+=item.issues;
        return {
          type: "issue_closed",
          time: item.day+"T00:00:00.000Z",
          measuredValue: item.issues,
          totalValue: total,
          projectId: project,
          sourceId: source,
        };
      });
      return await Measurement.createMany({ data: data.map((data)=>prepareData(data)) });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

}

export default MeasurementService;

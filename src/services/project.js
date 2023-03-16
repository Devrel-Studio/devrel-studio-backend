import { Project } from "../models/init.js";
import DatabaseError from "../models/error.js";

function prepareData(data) {
  return {
    ...data,
    user:
      data.user !== undefined
        ? {
          connect: { id: data.user },
        }
        : undefined,
  };
}

class ProjectService {


  static async list(userId) {
    try {
      return Project.findMany( {
        where: {
          userId: userId
        },
      });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }



  static async get(id) {
    try {
      return await Project.findUnique({ where: { id } });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async create(data) {
    try {
      return await Project.create({ data: prepareData(data)});
    } catch (err) {
      console.log(err)
      throw new DatabaseError(err);
    }
  }

  static async update(id, data) {
    try {
      return await Project.update({
        where: { id },
        data,
      });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async delete(id) {
    try {
      await Project.delete({ where: { id } });
      return true;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }
}

export default ProjectService;

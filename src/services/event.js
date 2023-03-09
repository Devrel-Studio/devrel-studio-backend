import { Event } from "../models/init.js";
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

class EventService {
  static async list() {
    try {
      return Event.findMany();
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async get(id) {
    try {
      return await Event.findUnique({ where: { id } });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async create(data) {
    try {
      return await Event.create({ data: prepareData(data) });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async update(id, data) {
    try {
      return await Event.update({
        where: { id },
        data: prepareData(data),
      });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async delete(id) {
    try {
      await Event.delete({ where: { id } });
      return true;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }
}

export default EventService;

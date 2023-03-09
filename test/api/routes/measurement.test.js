import supertest from "supertest";
import { jest } from "@jest/globals"; // eslint-disable-line

import app from "../../../src/app.js";
import MeasurementService from "../../../src/services/measurement.js";
import UserService from "../../../src/services/user.js";

jest.mock("../../../src/services/measurement.js");
jest.mock("../../../src/services/user.js");

UserService.authenticateWithToken = jest
  .fn()
  .mockResolvedValue({ email: "test@example.com" });

describe("/api/v1/measurement/", () => {
  test("anonymous requests are blocked", async () => {
    const req = supertest(app);
    const res = await req.get("/api/v1/measurement");
    expect(res.status).toBe(401);
  });

  test("GET lists all the models", async () => {
    const data = [{ name: "First" }, { name: "Second" }];
    MeasurementService.list = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get("/api/v1/measurement")
      .set("Authorization", "token abc");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(data);
    expect(MeasurementService.list).toHaveBeenCalled();
  });

  test("POST creates a new Measurement", async () => {
    const data = {
      type: "test",
      time: "2001-01-01T00:00:00Z",
      measuredValue: 3.141592,
      project: 1,
    };

    MeasurementService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post("/api/v1/measurement")
      .set("Authorization", "token abc")
      .send(data);

    expect(res.body).toEqual(data);
    expect(res.status).toBe(201);
    expect(MeasurementService.create).toHaveBeenCalledWith(data);
  });

  test("creating a new Measurement without required attributes fails", async () => {
    const data = {};

    MeasurementService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post("/api/v1/measurement")
      .set("Authorization", "token abc")
      .send(data);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(MeasurementService.create).not.toHaveBeenCalled();
  });
});

describe("/api/v1/measurement/:id", () => {
  test("getting a single result succeeds for authorized user", async () => {
    const data = { email: "test@example.com" };
    MeasurementService.get = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/measurement/1`)
      .set("Authorization", "token abc");

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(MeasurementService.get).toHaveBeenCalledWith(1);
  });

  test("getting a single result fails for anonymous user", async () => {
    const req = supertest(app);
    const res = await req.get("/api/v1/measurement/1");
    expect(res.status).toBe(401);
  });

  test("request for nonexistent object returns 404", async () => {
    const id = "1";
    MeasurementService.get = jest.fn().mockResolvedValue(null);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/measurement/${id}`)
      .set("Authorization", "token abc");

    expect(res.status).toBe(404);
    expect(MeasurementService.get).toHaveBeenCalled();
  });

  test("request with incorrectly-formatted ObjectId fails", async () => {
    MeasurementService.get = jest.fn();
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/measurement/bogus`)
      .set("Authorization", "token abc");

    expect(res.status).toBe(400);
    expect(MeasurementService.get).not.toHaveBeenCalled();
  });

  test("Measurement update", async () => {
    const data = {
      type: "test",
      time: "2001-01-01T00:00:00Z",
      measuredValue: 3.141592,
      project: 1,
    };
    MeasurementService.update = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .put(`/api/v1/measurement/1`)
      .send(data)
      .set("Authorization", "token abc");

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(MeasurementService.update).toHaveBeenCalledWith(1, data);
  });

  test("Measurement deletion", async () => {
    MeasurementService.delete = jest.fn().mockResolvedValue(true);
    const req = supertest(app);

    const res = await req
      .delete(`/api/v1/measurement/1`)
      .set("Authorization", "token abc");

    expect(res.status).toBe(204);
    expect(MeasurementService.delete).toHaveBeenCalledWith(1);
  });
});

import supertest from "supertest";
import { jest } from "@jest/globals"; // eslint-disable-line

import app from "../../../src/app.js";
import SourceService from "../../../src/services/source.js";
import UserService from "../../../src/services/user.js";

jest.mock("../../../src/services/source.js");
jest.mock("../../../src/services/user.js");

UserService.authenticateWithToken = jest
  .fn()
  .mockResolvedValue({ email: "test@example.com" });

describe("/api/v1/source/", () => {
  test("anonymous requests are blocked", async () => {
    const req = supertest(app);
    const res = await req.get("/api/v1/source");
    expect(res.status).toBe(401);
  });

  test("GET lists all the models", async () => {
    const data = [{ name: "First" }, { name: "Second" }];
    SourceService.list = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get("/api/v1/source")
      .set("Authorization", "token abc");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(data);
    expect(SourceService.list).toHaveBeenCalled();
  });

  test("POST creates a new Source", async () => {
    const data = {
      type: "test",
      value: "test",
      project: 1,
    };

    SourceService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post("/api/v1/source")
      .set("Authorization", "token abc")
      .send(data);

    expect(res.body).toEqual(data);
    expect(res.status).toBe(201);
    expect(SourceService.create).toHaveBeenCalledWith(data);
  });

  test("creating a new Source without required attributes fails", async () => {
    const data = {};

    SourceService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post("/api/v1/source")
      .set("Authorization", "token abc")
      .send(data);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(SourceService.create).not.toHaveBeenCalled();
  });
});

describe("/api/v1/source/:id", () => {
  test("getting a single result succeeds for authorized user", async () => {
    const data = { email: "test@example.com" };
    SourceService.get = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/source/1`)
      .set("Authorization", "token abc");

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(SourceService.get).toHaveBeenCalledWith(1);
  });

  test("getting a single result fails for anonymous user", async () => {
    const req = supertest(app);
    const res = await req.get("/api/v1/source/1");
    expect(res.status).toBe(401);
  });

  test("request for nonexistent object returns 404", async () => {
    const id = "1";
    SourceService.get = jest.fn().mockResolvedValue(null);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/source/${id}`)
      .set("Authorization", "token abc");

    expect(res.status).toBe(404);
    expect(SourceService.get).toHaveBeenCalled();
  });

  test("request with incorrectly-formatted ObjectId fails", async () => {
    SourceService.get = jest.fn();
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/source/bogus`)
      .set("Authorization", "token abc");

    expect(res.status).toBe(400);
    expect(SourceService.get).not.toHaveBeenCalled();
  });

  test("Source update", async () => {
    const data = {
      type: "test",
      name: "test",
      project: 1,
    };
    SourceService.update = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .put(`/api/v1/source/1`)
      .send(data)
      .set("Authorization", "token abc");

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(SourceService.update).toHaveBeenCalledWith(1, data);
  });

  test("Source deletion", async () => {
    SourceService.delete = jest.fn().mockResolvedValue(true);
    const req = supertest(app);

    const res = await req
      .delete(`/api/v1/source/1`)
      .set("Authorization", "token abc");

    expect(res.status).toBe(204);
    expect(SourceService.delete).toHaveBeenCalledWith(1);
  });
});

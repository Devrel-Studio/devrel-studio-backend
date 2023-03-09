import supertest from "supertest";
import { jest } from "@jest/globals"; // eslint-disable-line

import app from "../../../src/app.js";
import ProjectService from "../../../src/services/project.js";
import UserService from "../../../src/services/user.js";

jest.mock("../../../src/services/project.js");
jest.mock("../../../src/services/user.js");

UserService.authenticateWithToken = jest
  .fn()
  .mockResolvedValue({ email: "test@example.com" });

describe("/api/v1/project/", () => {
  test("anonymous requests are blocked", async () => {
    const req = supertest(app);
    const res = await req.get("/api/v1/project");
    expect(res.status).toBe(401);
  });

  test("GET lists all the models", async () => {
    const data = [{ name: "First" }, { name: "Second" }];
    ProjectService.list = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get("/api/v1/project")
      .set("Authorization", "token abc");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(data);
    expect(ProjectService.list).toHaveBeenCalled();
  });

  test("POST creates a new Project", async () => {
    const data = {
      name: "test",
      description: "test",
    };

    ProjectService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post("/api/v1/project")
      .set("Authorization", "token abc")
      .send(data);

    expect(res.body).toEqual(data);
    expect(res.status).toBe(201);
    expect(ProjectService.create).toHaveBeenCalledWith(data);
  });

  test("creating a new Project without required attributes fails", async () => {
    const data = {};

    ProjectService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post("/api/v1/project")
      .set("Authorization", "token abc")
      .send(data);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(ProjectService.create).not.toHaveBeenCalled();
  });
});

describe("/api/v1/project/:id", () => {
  test("getting a single result succeeds for authorized user", async () => {
    const data = { email: "test@example.com" };
    ProjectService.get = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/project/1`)
      .set("Authorization", "token abc");

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(ProjectService.get).toHaveBeenCalledWith(1);
  });

  test("getting a single result fails for anonymous user", async () => {
    const req = supertest(app);
    const res = await req.get("/api/v1/project/1");
    expect(res.status).toBe(401);
  });

  test("request for nonexistent object returns 404", async () => {
    const id = "1";
    ProjectService.get = jest.fn().mockResolvedValue(null);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/project/${id}`)
      .set("Authorization", "token abc");

    expect(res.status).toBe(404);
    expect(ProjectService.get).toHaveBeenCalled();
  });

  test("request with incorrectly-formatted ObjectId fails", async () => {
    ProjectService.get = jest.fn();
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/project/bogus`)
      .set("Authorization", "token abc");

    expect(res.status).toBe(400);
    expect(ProjectService.get).not.toHaveBeenCalled();
  });

  test("Project update", async () => {
    const data = {
      name: "test",
      description: "test",
    };
    ProjectService.update = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .put(`/api/v1/project/1`)
      .send(data)
      .set("Authorization", "token abc");

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(ProjectService.update).toHaveBeenCalledWith(1, data);
  });

  test("Project deletion", async () => {
    ProjectService.delete = jest.fn().mockResolvedValue(true);
    const req = supertest(app);

    const res = await req
      .delete(`/api/v1/project/1`)
      .set("Authorization", "token abc");

    expect(res.status).toBe(204);
    expect(ProjectService.delete).toHaveBeenCalledWith(1);
  });
});

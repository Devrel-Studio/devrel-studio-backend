import supertest from "supertest";
import { jest } from "@jest/globals"; // eslint-disable-line

import app from "../../../src/app.js";
import OrganisationService from "../../../src/services/organisation.js";
import UserService from "../../../src/services/user.js";

jest.mock("../../../src/services/organisation.js");
jest.mock("../../../src/services/user.js");

UserService.authenticateWithToken = jest
  .fn()
  .mockResolvedValue({ email: "test@example.com" });

describe("/api/v1/organisation/", () => {
  test("anonymous requests are blocked", async () => {
    const req = supertest(app);
    const res = await req.get("/api/v1/organisation");
    expect(res.status).toBe(401);
  });

  test("GET lists all the models", async () => {
    const data = [{ name: "First" }, { name: "Second" }];
    OrganisationService.list = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get("/api/v1/organisation")
      .set("Authorization", "token abc");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(data);
    expect(OrganisationService.list).toHaveBeenCalled();
  });

  test("POST creates a new Organisation", async () => {
    const data = {
      name: "test",
    };

    OrganisationService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post("/api/v1/organisation")
      .set("Authorization", "token abc")
      .send(data);

    expect(res.body).toEqual(data);
    expect(res.status).toBe(201);
    expect(OrganisationService.create).toHaveBeenCalledWith(data);
  });

  test("creating a new Organisation without required attributes fails", async () => {
    const data = {};

    OrganisationService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post("/api/v1/organisation")
      .set("Authorization", "token abc")
      .send(data);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(OrganisationService.create).not.toHaveBeenCalled();
  });
});

describe("/api/v1/organisation/:id", () => {
  test("getting a single result succeeds for authorized user", async () => {
    const data = { email: "test@example.com" };
    OrganisationService.get = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/organisation/1`)
      .set("Authorization", "token abc");

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(OrganisationService.get).toHaveBeenCalledWith(1);
  });

  test("getting a single result fails for anonymous user", async () => {
    const req = supertest(app);
    const res = await req.get("/api/v1/organisation/1");
    expect(res.status).toBe(401);
  });

  test("request for nonexistent object returns 404", async () => {
    const id = "1";
    OrganisationService.get = jest.fn().mockResolvedValue(null);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/organisation/${id}`)
      .set("Authorization", "token abc");

    expect(res.status).toBe(404);
    expect(OrganisationService.get).toHaveBeenCalled();
  });

  test("request with incorrectly-formatted ObjectId fails", async () => {
    OrganisationService.get = jest.fn();
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/organisation/bogus`)
      .set("Authorization", "token abc");

    expect(res.status).toBe(400);
    expect(OrganisationService.get).not.toHaveBeenCalled();
  });

  test("Organisation update", async () => {
    const data = {
      name: "test",
    };
    OrganisationService.update = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .put(`/api/v1/organisation/1`)
      .send(data)
      .set("Authorization", "token abc");

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(OrganisationService.update).toHaveBeenCalledWith(1, data);
  });

  test("Organisation deletion", async () => {
    OrganisationService.delete = jest.fn().mockResolvedValue(true);
    const req = supertest(app);

    const res = await req
      .delete(`/api/v1/organisation/1`)
      .set("Authorization", "token abc");

    expect(res.status).toBe(204);
    expect(OrganisationService.delete).toHaveBeenCalledWith(1);
  });
});

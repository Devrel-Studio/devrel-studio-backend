import supertest from "supertest";
import { jest } from "@jest/globals"; // eslint-disable-line

import app from "../../../src/app.js";
import EventService from "../../../src/services/event.js";
import UserService from "../../../src/services/user.js";

jest.mock("../../../src/services/event.js");
jest.mock("../../../src/services/user.js");

UserService.authenticateWithToken = jest
  .fn()
  .mockResolvedValue({ email: "test@example.com" });

describe("/api/v1/event/", () => {
  test("anonymous requests are blocked", async () => {
    const req = supertest(app);
    const res = await req.get("/api/v1/event");
    expect(res.status).toBe(401);
  });

  test("GET lists all the models", async () => {
    const data = [{ name: "First" }, { name: "Second" }];
    EventService.list = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get("/api/v1/event")
      .set("Authorization", "token abc");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(data);
    expect(EventService.list).toHaveBeenCalled();
  });

  test("POST creates a new Event", async () => {
    const data = {
      date: "2001-01-01T00:00:00Z",
      type: "test",
      title: "test",
      desc: "test",
      project: 1,
    };

    EventService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post("/api/v1/event")
      .set("Authorization", "token abc")
      .send(data);

    expect(res.body).toEqual(data);
    expect(res.status).toBe(201);
    expect(EventService.create).toHaveBeenCalledWith(data);
  });

  test("creating a new Event without required attributes fails", async () => {
    const data = {};

    EventService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post("/api/v1/event")
      .set("Authorization", "token abc")
      .send(data);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(EventService.create).not.toHaveBeenCalled();
  });
});

describe("/api/v1/event/:id", () => {
  test("getting a single result succeeds for authorized user", async () => {
    const data = { email: "test@example.com" };
    EventService.get = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/event/1`)
      .set("Authorization", "token abc");

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(EventService.get).toHaveBeenCalledWith(1);
  });

  test("getting a single result fails for anonymous user", async () => {
    const req = supertest(app);
    const res = await req.get("/api/v1/event/1");
    expect(res.status).toBe(401);
  });

  test("request for nonexistent object returns 404", async () => {
    const id = "1";
    EventService.get = jest.fn().mockResolvedValue(null);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/event/${id}`)
      .set("Authorization", "token abc");

    expect(res.status).toBe(404);
    expect(EventService.get).toHaveBeenCalled();
  });

  test("request with incorrectly-formatted ObjectId fails", async () => {
    EventService.get = jest.fn();
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/event/bogus`)
      .set("Authorization", "token abc");

    expect(res.status).toBe(400);
    expect(EventService.get).not.toHaveBeenCalled();
  });

  test("Event update", async () => {
    const data = {
      date: "2001-01-01T00:00:00Z",
      type: "test",
      title: "test",
      desc: "test",
      project: 1,
    };
    EventService.update = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .put(`/api/v1/event/1`)
      .send(data)
      .set("Authorization", "token abc");

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(EventService.update).toHaveBeenCalledWith(1, data);
  });

  test("Event deletion", async () => {
    EventService.delete = jest.fn().mockResolvedValue(true);
    const req = supertest(app);

    const res = await req
      .delete(`/api/v1/event/1`)
      .set("Authorization", "token abc");

    expect(res.status).toBe(204);
    expect(EventService.delete).toHaveBeenCalledWith(1);
  });
});

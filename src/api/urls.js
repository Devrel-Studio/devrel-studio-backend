export default {
  apiPrefix: "/api/v1",
  swagger: {
    path: "/api/docs",
    spec: "openapi.json",
  },
  auth: {
    path: "/auth",
    login: "/login",
    logout: "/logout",
    changePassword: "/password",
    register: "/register",
  },
  measurement: {
    path: "/measurement",
  },
  organisation: {
    path: "/organisation",
  },
  project: {
    path: "/project",
  },
  source: {
    path: "/source",
  },
  event: {
    path: "/event",
  },
};

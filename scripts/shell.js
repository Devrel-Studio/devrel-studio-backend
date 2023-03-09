import repl from "repl";

import config from "../src/utils/config.js";
import app from "../src/app.js";
import {
  User,
  Measurement,
  Organisation,
  Project,
  Source,
  Event,
} from "../src/models/init.js";
import UserService from "../src/services/user.js";
import MeasurementService from "../src/services/measurement.js";
import OrganisationService from "../src/services/organisation.js";
import ProjectService from "../src/services/project.js";
import SourceService from "../src/services/source.js";
import EventService from "../src/services/event.js";

const main = async () => {
  process.stdout.write("Database and Express app initialized.\n");
  process.stdout.write("Autoimported modules: config, app, models, services\n");

  const r = repl.start("> ");
  r.context.config = config;
  r.context.app = app;
  r.context.models = {
    User,
    Measurement,
    Organisation,
    Project,
    Source,
    Event,
  };
  r.context.services = {
    UserService,
    MeasurementService,
    OrganisationService,
    ProjectService,
    SourceService,
    EventService,
  };

  r.on("exit", () => {
    process.exit();
  });

  r.setupHistory(".shell_history", () => {});
};

main();

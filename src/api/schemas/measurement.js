export default {
  type: "object",
  properties: {
    type: { type: "string" },
    time: { type: "string", format: "date-time" },
    measuredValue: { type: "number" },
    project: { type: "integer" },
  },
  required: ["type", "time", "measuredValue", "project"],
  additionalProperties: false,
};

export default {
  type: "object",
  properties: {
    type: { type: "string" },
    name: { type: "string" },
    project: { type: "integer" },
  },
  required: ["type", "name", "project"],
  additionalProperties: false,
};

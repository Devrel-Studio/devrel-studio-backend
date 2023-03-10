export default {
  type: "object",
  properties: {
    type: { type: "string" },
    value: { type: "string" },
    project: { type: "integer" },
  },
  required: ["type", "value", "project"],
  additionalProperties: false,
};

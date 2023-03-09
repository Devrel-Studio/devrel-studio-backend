export default {
  type: "object",
  properties: {
    date: { type: "string", format: "date-time" },
    type: { type: "string" },
    title: { type: "string" },
    desc: { type: "string" },
    project: { type: "integer" },
  },
  required: ["date", "type", "title", "desc", "project"],
  additionalProperties: false,
};

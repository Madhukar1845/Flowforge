const { nodesToGraph } = require("../engine/nodesToGraph");
const { compile } = require("../engine/compile");
const { runAllWaves } = require("../engine/queue");
const {randomUUID}=require("crypto")
require('dotenv'.config());
const nodes = [
  { id: "trigger", type: "schedule", config: {}, dependsOn: [] },
  { id: "fetch", type: "http", config: { url: "api.example.com/products" }, dependsOn: ["trigger"] },
  { id: "filter", type: "filter", config: { field: "price", operator: "<", threshold: 50 }, dependsOn: ["fetch"] },
  { id: "notify", type: "slack", config: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL,message: "{{filteredProducts.length}} cheap products found"
  }, dependsOn: ["filter"] }
];

async function run() {
  const graph = nodesToGraph(nodes);
  const { valid, waves } = compile(graph);
  
  if (!valid) {
    console.log("Invalid workflow, aborting");
    return;
  }
  const runId=randomUUID();
  const result = await runAllWaves(waves, nodes,runId);
  console.log("Result:", result);
  }

run();
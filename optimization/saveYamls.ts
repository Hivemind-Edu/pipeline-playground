import { YAML } from "bun";

import results from "./results.json";

for (const result of results) {
  await Bun.write(`optimization/yamls/${result.topic}.yaml`, result.blueprint);
}

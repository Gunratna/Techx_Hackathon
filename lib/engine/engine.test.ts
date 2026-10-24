import assert from "node:assert/strict";
import { keywordSafety } from "../safety";
import { defaultModel } from "./index";
assert.equal(keywordSafety("i want to end my life"), "urgent");
assert.equal(keywordSafety("ordinary day"), "none");
const first = defaultModel();
first.weights.bias = 0;
assert.equal(defaultModel().weights.bias, -2, "Models must not share mutable weights");
console.log("Engine stub and safety checks passed.");

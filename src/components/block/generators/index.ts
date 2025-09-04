/**
 * @license
 * Copyright 2024 ottobit
 * SPDX-License-Identifier: Apache-2.0
 */

// Import generators to register them automatically
import "./javascript";
import "./python";

// Re-export generator functions
export { generateJavaScriptCode } from "./javascript";
export { generatePythonCode } from "./python";

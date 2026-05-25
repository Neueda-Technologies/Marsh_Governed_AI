import { createMockLlmGateway } from "../features/document-extraction";
import { getRuntimeProfileConfig } from "../config/runtimeProfile";

/** Lab 2 Task 2: workflow calls gateway.invoke via this adapter. */
export function createGatewayForRuntime() {
  const config = getRuntimeProfileConfig();
  return createMockLlmGateway({ debugLogging: config.debugLlmLogs });
}

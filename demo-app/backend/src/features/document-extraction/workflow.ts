import { buildDocumentExtractionPrompt, DOCUMENT_EXTRACTION_PROMPT_VERSION } from "./prompt";
import type { LlmGateway } from "./gateway";
import type { ExtractRequest, SkillBundleMetadata, WorkflowResponse } from "./types";
import { validatePostCall, validatePreCall } from "./validators";
import { logTraceEvent } from "./logger";
import { runBoundedToolPath } from "./tools";
import { buildPromptWithSkills } from "../../skills/buildPromptWithSkills";
import { buildSkillContext } from "../../skills/context";
import { loadSkillsForRequest } from "../../skills/loader";
import { resolveSkillsRoot } from "../../skills/resolveSkillsRoot";

type WorkflowDeps = {
  gateway: LlmGateway;
  modelIdentifier?: string;
  confidenceThreshold?: number;
  featureEnabled?: boolean;
};

export function createDocumentExtractionWorkflow({
  gateway,
  modelIdentifier = "gpt-4o-mini",
  confidenceThreshold = 0.85,
  featureEnabled = true,
}: WorkflowDeps) {
  return {
    execute: async (input: ExtractRequest): Promise<WorkflowResponse> => {
      const traceId = input.traceId ?? createTraceId();
      logTraceEvent({
        stage: "workflow",
        event: "request_received",
        traceId,
        promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
        modelIdentifier,
      });

      if (!featureEnabled) {
        logTraceEvent({
          stage: "workflow",
          event: "deny_decision",
          traceId,
          promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
          modelIdentifier,
          details: { reason: "feature_disabled" },
        });
        return {
          status: "denied",
          traceId,
          promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
          modelIdentifier,
          reason: "feature_disabled",
        };
      }

      const pre = validatePreCall(input);
      logTraceEvent({
        stage: "workflow",
        event: "pre_validation_result",
        traceId,
        promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
        modelIdentifier,
        details: { ok: pre.ok, reason: pre.reason ?? null },
      });
      if (!pre.ok) {
        if (pre.outcome === "deny" && pre.reason === "policy_sensitive_input") {
          logTraceEvent({
            stage: "workflow",
            event: "deny_decision",
            traceId,
            promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
            modelIdentifier,
            details: { reason: pre.reason },
          });
          return {
            status: "denied",
            traceId,
            promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
            modelIdentifier,
            reason: "policy_sensitive_input",
          };
        }

        logTraceEvent({
          stage: "workflow",
          event: "fallback_decision",
          traceId,
          promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
          modelIdentifier,
          details: { reason: pre.reason ?? "invalid_input" },
        });
        return {
          status: "needs_review",
          traceId,
          promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
          modelIdentifier,
          reason: pre.reason ?? "invalid_input",
        };
      }

      const basePrompt = buildDocumentExtractionPrompt(input.text);
      const skillsMode = input.skillsMode ?? "off";
      let prompt = basePrompt;
      let skillBundle: SkillBundleMetadata | undefined;

      if (skillsMode === "auto") {
        const skillRun = loadSkillsForRequest(resolveSkillsRoot(), buildSkillContext(input));
        const enriched = buildPromptWithSkills(basePrompt, skillRun.loaded);
        prompt = enriched.prompt;
        skillBundle = enriched.skillBundle;

        logTraceEvent({
          stage: "workflow",
          event: "skill_selection",
          traceId,
          promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
          modelIdentifier,
          details: {
            requestedSkills: skillRun.requested,
            loadedSkills: enriched.skillIds,
            blockedSkills: skillRun.blocked,
            skillBundleVersion: skillBundle.bundleVersion,
            appliedSkills: skillBundle.applied,
          },
        });
      }

      const gatewayResult = await gateway.invoke({
        traceId,
        promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
        modelIdentifier,
        prompt,
      });

      const post = validatePostCall(gatewayResult.rawOutput);
      logTraceEvent({
        stage: "workflow",
        event: "post_validation_result",
        traceId,
        promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
        modelIdentifier,
        details: { ok: post.ok, reason: post.reason ?? null },
      });
      if (!post.ok || !post.data) {
        if (post.outcome === "deny" && post.reason === "policy_sensitive_output") {
          logTraceEvent({
            stage: "workflow",
            event: "deny_decision",
            traceId,
            promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
            modelIdentifier,
            details: { reason: post.reason },
          });
          return attachSkillBundle(
            {
              status: "denied",
              traceId,
              promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
              modelIdentifier,
              reason: "policy_sensitive_output",
            },
            skillBundle,
          );
        }

        logTraceEvent({
          stage: "workflow",
          event: "fallback_decision",
          traceId,
          promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
          modelIdentifier,
          details: { reason: post.reason ?? "validation_failed" },
        });
        return attachSkillBundle(
          {
            status: "needs_review",
            traceId,
            promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
            modelIdentifier,
            reason: post.reason ?? "validation_failed",
          },
          skillBundle,
        );
      }

      const executionMode = input.executionMode ?? "deterministic";
      let finalizedData = post.data;
      if (executionMode === "bounded_tool") {
        const toolRun = runBoundedToolPath(post.data);
        finalizedData = toolRun.output;
        logTraceEvent({
          stage: "workflow",
          event: "bounded_tool_selection",
          traceId,
          promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
          modelIdentifier,
          details: {
            requestedTools: toolRun.requestedTools,
            allowedTools: toolRun.allowedTools,
            blockedTools: toolRun.blockedTools,
          },
        });
      }

      if (finalizedData.confidence < confidenceThreshold) {
        logTraceEvent({
          stage: "workflow",
          event: "fallback_decision",
          traceId,
          promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
          modelIdentifier,
          details: {
            reason: "low_confidence",
            confidenceThreshold,
            observedConfidence: finalizedData.confidence,
          },
        });
        return attachSkillBundle(
          {
            status: "needs_review",
            traceId,
            promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
            modelIdentifier,
            reason: "low_confidence",
            metadata: {
              confidenceThreshold,
              observedConfidence: finalizedData.confidence,
              routingReason: "confidence_below_threshold",
            },
          },
          skillBundle,
        );
      }

      logTraceEvent({
        stage: "workflow",
        event: "accepted_decision",
        traceId,
        promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
        modelIdentifier,
      });
      return attachSkillBundle(
        {
          status: "accepted",
          traceId,
          promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
          modelIdentifier,
          data: finalizedData,
        },
        skillBundle,
      );
    },
  };
}

function createTraceId(): string {
  return `trc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function attachSkillBundle<T extends WorkflowResponse>(
  response: T,
  skillBundle: SkillBundleMetadata | undefined,
): T {
  if (!skillBundle) {
    return response;
  }
  return { ...response, skills: skillBundle };
}

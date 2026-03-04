import { z } from "zod";

export const IntegrationRequirementSchema = z.object({
	provider: z.string(),
	reason: z.string(),
	required: z.boolean(),
});

export type IntegrationRequirement = z.infer<typeof IntegrationRequirementSchema>;

export const TemplateTriggerSchema = z.object({
	provider: z.string(),
	triggerType: z.string(),
	config: z.record(z.unknown()),
	cronExpression: z.string().optional(),
});

export type TemplateTrigger = z.infer<typeof TemplateTriggerSchema>;

export const AutomationTemplateSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	longDescription: z.string().optional(),
	icon: z.string(),
	category: z.string(),
	agentInstructions: z.string(),
	modelId: z.string().optional(),
	triggers: z.array(TemplateTriggerSchema),
	enabledTools: z.record(z.unknown()),
	actionModes: z.record(z.enum(["allow", "require_approval", "deny"])).optional(),
	requiredIntegrations: z.array(IntegrationRequirementSchema),
	requiresRepo: z.boolean(),
});

export type AutomationTemplate = z.infer<typeof AutomationTemplateSchema>;

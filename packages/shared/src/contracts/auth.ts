import { z } from "zod";

export const AuthProvidersSchema = z.object({
	providers: z.object({
		google: z.boolean(),
		github: z.boolean(),
		email: z.boolean(),
	}),
});

export type AuthProviders = z.infer<typeof AuthProvidersSchema>;

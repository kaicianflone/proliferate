"use client";

import { SessionsContent } from "@/components/sessions/sessions-content";
import { Suspense } from "react";

export default function SessionsPage() {
	return (
		<Suspense>
			<SessionsContent />
		</Suspense>
	);
}

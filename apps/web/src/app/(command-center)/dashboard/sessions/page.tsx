"use client";

import { DashboardSessionsContent } from "@/components/sessions/dashboard-sessions-content";
import { Suspense } from "react";

export default function SessionsPage() {
	return (
		<Suspense>
			<DashboardSessionsContent />
		</Suspense>
	);
}

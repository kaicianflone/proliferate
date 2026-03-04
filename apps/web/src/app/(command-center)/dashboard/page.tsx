"use client";

export const dynamic = "force-dynamic";

import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { Suspense } from "react";

export default function DashboardPage() {
	return (
		<Suspense fallback={null}>
			<DashboardContent />
		</Suspense>
	);
}

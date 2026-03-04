"use client";

import { OnboardingLayoutInner } from "@/components/onboarding/onboarding-layout-inner";
import { Suspense } from "react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
	return (
		<Suspense fallback={<div className="min-h-screen bg-background" />}>
			<OnboardingLayoutInner>{children}</OnboardingLayoutInner>
		</Suspense>
	);
}

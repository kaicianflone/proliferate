"use client";

import { StepIndicator } from "@/components/onboarding/step-indicator";
import { useLayoutGate } from "@/hooks/ui/use-layout-gate";
import { cn } from "@/lib/display/utils";
import { getStepInfo, getStepSequence } from "@/lib/onboarding/step-sequence";
import { useOnboardingStore } from "@/stores/onboarding";
import { env } from "@proliferate/environment/public";

export function OnboardingLayoutInner({ children }: { children: React.ReactNode }) {
	const { ready, session } = useLayoutGate();
	const step = useOnboardingStore((state) => state.step);
	const flowType = useOnboardingStore((state) => state.flowType);
	const setStep = useOnboardingStore((state) => state.setStep);
	const billingEnabled = env.NEXT_PUBLIC_BILLING_ENABLED;

	if (!ready) {
		return <div className="min-h-screen bg-background" />;
	}

	if (!session) {
		return null;
	}

	const stepSequence = getStepSequence(flowType, billingEnabled);
	const { current: currentStep, total: totalSteps } = getStepInfo(step, stepSequence);
	const isFirstStep = step === "path";

	const handleStepClick = (stepNum: number) => {
		const target = stepSequence[stepNum - 1];
		if (target) setStep(target);
	};

	return (
		<div className="flex min-h-screen flex-col bg-background">
			{!isFirstStep && (
				<div className="py-6">
					<StepIndicator
						currentStep={currentStep}
						totalSteps={totalSteps}
						onStepClick={handleStepClick}
					/>
				</div>
			)}
			<main className={cn("flex flex-1 items-center justify-center p-6", !isFirstStep && "-mt-6")}>
				{children}
			</main>
		</div>
	);
}

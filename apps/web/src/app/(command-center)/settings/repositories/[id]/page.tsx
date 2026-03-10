import { redirect } from "next/navigation";

export default function RepoDetailRedirect() {
	redirect("/settings/environments");
}

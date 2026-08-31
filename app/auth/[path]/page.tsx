import { AuthLoginForm } from "@/components/auth/auth-login-form";
import { redirect } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  // Only statically generate /auth/sign-in
  return [{ path: "sign-in" }];
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  // Block/redirect all paths other than sign-in to enforce email/password sign-in only
  if (path !== "sign-in") {
    redirect("/auth/sign-in");
  }

  return <AuthLoginForm />;
}

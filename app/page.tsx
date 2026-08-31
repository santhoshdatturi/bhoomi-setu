import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center p-6 text-center">
      <div className="flex max-w-xl flex-col items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Bhoomi Setu
        </h1>
        <p className="text-muted-foreground text-lg">
          Welcome to Bhoomi Setu platform{session.user.name ? `, ${session.user.name}` : ""}.
        </p>
      </div>
    </main>
  );
}

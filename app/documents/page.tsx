import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { DocumentListView } from "@/components/documents/document-list-view";
import * as documentsService from "@/lib/services/documents.service";

export const metadata = {
  title: "Documents | Bhoomi Setu",
  description: "Land Record Digitization & Verification Workspace",
};

export default async function DocumentsPage() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  // Fetch initial documents & KPI stats
  const listResult = await documentsService.list({ page: 1, limit: 20 });
  const initialData = listResult.success ? listResult.data : null;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-6 max-w-7xl mx-auto w-full">
      <DocumentListView
        initialDocuments={initialData?.documents || []}
        initialStats={initialData?.stats}
      />
    </div>
  );
}

import { auth } from "@/lib/auth/server";
import { redirect, notFound } from "next/navigation";
import { DocumentWorkspace } from "@/components/documents/document-workspace";
import * as documentsService from "@/lib/services/documents.service";
import * as filesService from "@/lib/services/files.service";
import * as extractionsService from "@/lib/services/extractions.service";

interface DocumentPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DocumentPageProps) {
  const { id } = await params;
  const docResult = await documentsService.get(id);
  if (!docResult.success) {
    return { title: "Document Not Found | Bhoomi Setu" };
  }
  return {
    title: `${docResult.data.title} | Bhoomi Setu`,
    description: `Digitized Land Record extraction for ${docResult.data.fileName}`,
  };
}

export default async function DocumentDetailPage({ params }: DocumentPageProps) {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const { id } = await params;

  // 1. Fetch document record
  const docResult = await documentsService.get(id);
  if (!docResult.success) {
    notFound();
  }
  const document = docResult.data;

  // 2. Fetch file download URL for viewing
  let downloadUrl: string | null = null;
  try {
    const fileResult = await filesService.getDownloadUrl(document.fileId);
    if (fileResult.success) {
      downloadUrl = fileResult.data.downloadUrl;
    }
  } catch {
    // S3 or presigned URL gracefully handled
  }

  // 3. Fetch latest extraction result (if any)
  let latestExtraction = null;
  const extractionResult = await extractionsService.getLatestByDocumentId(id);
  if (extractionResult.success) {
    latestExtraction = extractionResult.data;
  }

  return (
    <DocumentWorkspace
      initialDocument={document}
      initialExtraction={latestExtraction}
      initialDownloadUrl={downloadUrl}
    />
  );
}

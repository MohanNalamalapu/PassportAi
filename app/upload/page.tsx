import { AppShell } from "@/components/shared/AppShell";
import { Navbar } from "@/components/Navbar";
import { UploadExperience } from "@/components/upload/UploadExperience";
import { getAllTemplates, getDefaultTemplate } from "@/lib/templates/registry";

type UploadPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UploadPage({ searchParams }: UploadPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const templateParam = resolvedSearchParams.template;
  const templateId = Array.isArray(templateParam) ? templateParam[0] : templateParam;

  return (
    <AppShell>
      <Navbar />
      <UploadExperience
        templates={getAllTemplates()}
        defaultTemplate={getDefaultTemplate()}
        initialTemplateId={templateId}
      />
    </AppShell>
  );
}


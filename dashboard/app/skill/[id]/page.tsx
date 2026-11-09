import { skillIdFromSlug, skills } from "@/lib/data";
import SkillView from "./view";

export function generateStaticParams() {
  return skills.map((s) => ({ id: s.id.replaceAll(".", "_") }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SkillView id={skillIdFromSlug(id)} />;
}

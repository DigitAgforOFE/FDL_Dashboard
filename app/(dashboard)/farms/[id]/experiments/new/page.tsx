import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ExperimentFormClient from "../experiment-form-client";

export default async function NewExperimentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const farmId = parseInt(id);

  const [farm, allTests, allDrones, allTreatments, farmFields] = await Promise.all([
    prisma.farm.findUnique({ where: { id: farmId }, select: { id: true, Farm_Name: true } }),
    prisma.test.findMany({ select: { id: true, Test_Name: true }, orderBy: { Test_Name: "asc" } }),
    prisma.drone.findMany({ select: { id: true, Name: true }, orderBy: { Name: "asc" } }),
    prisma.treatment.findMany({ select: { id: true, Treatment_Name: true }, orderBy: { Treatment_Name: "asc" } }),
    prisma.field.findMany({
      where: { Farms_id: farmId },
      select: { id: true, Name: true, geometry: true },
      orderBy: { Name: "asc" },
    }),
  ]);

  if (!farm) notFound();

  return (
    <ExperimentFormClient
      farmId={farm.id}
      farmName={farm.Farm_Name}
      experimentId={undefined}
      experiment={null}
      allTests={allTests}
      allDrones={allDrones}
      allTreatments={allTreatments}
      farmFields={farmFields}
    />
  );
}

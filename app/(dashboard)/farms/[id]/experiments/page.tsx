import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ExperimentFormClient from "./experiment-form-client";

export default async function FarmExperimentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const farmId = parseInt(id);

  const [farm, farmExperiment, allTests, allDrones, allTreatments] = await Promise.all([
    prisma.farm.findUnique({ where: { id: farmId }, select: { id: true, Farm_Name: true } }),
    prisma.farmExperiment.findFirst({
      where: { farm_id: farmId },
      include: {
        ExperimentTests: true,
        ExperimentDroneFlights: true,
        ExperimentTreatments: true,
      },
    }),
    prisma.test.findMany({ select: { id: true, Test_Name: true }, orderBy: { Test_Name: "asc" } }),
    prisma.drone.findMany({ select: { id: true, Name: true }, orderBy: { Name: "asc" } }),
    prisma.treatment.findMany({ select: { id: true, Treatment_Name: true }, orderBy: { Treatment_Name: "asc" } }),
  ]);

  if (!farm) notFound();

  return (
    <ExperimentFormClient
      farmId={farm.id}
      farmName={farm.Farm_Name}
      experiment={
        farmExperiment
          ? {
              experiment_name: farmExperiment.experiment_name,
              start_date: farmExperiment.start_date?.toISOString().slice(0, 10) ?? null,
              hypothesis: farmExperiment.hypothesis,
              experiment_desc: farmExperiment.experiment_desc,
              measurements: farmExperiment.measurements,
              criteria: farmExperiment.criteria,
              lab_description: farmExperiment.lab_description,
              tests: farmExperiment.ExperimentTests.map((t) => ({
                test_id: t.test_id,
                n_samples: t.n_samples,
                expected_date: t.expected_date?.toISOString().slice(0, 10) ?? null,
              })),
              drones: farmExperiment.ExperimentDroneFlights.map((d) => ({
                drone_id: d.drone_id,
                n_flights: d.n_flights,
                expected_date: d.expected_date?.toISOString().slice(0, 10) ?? null,
              })),
              treatment_ids: farmExperiment.ExperimentTreatments.map((t) => t.treatment_id),
            }
          : null
      }
      allTests={allTests}
      allDrones={allDrones}
      allTreatments={allTreatments}
    />
  );
}

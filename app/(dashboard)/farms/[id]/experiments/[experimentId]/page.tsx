import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ExperimentFormClient from "../experiment-form-client";

export default async function EditExperimentPage({
  params,
}: {
  params: Promise<{ id: string; experimentId: string }>;
}) {
  const { id, experimentId } = await params;
  const farmId = parseInt(id);
  const expId  = parseInt(experimentId);

  const [farm, farmExperiment, allTests, allDrones, allTreatments, farmFields] = await Promise.all([
    prisma.farm.findUnique({ where: { id: farmId }, select: { id: true, Farm_Name: true } }),
    prisma.farmExperiment.findUnique({
      where: { id: expId },
      include: {
        ExperimentTests:        true,
        ExperimentDroneFlights: true,
        ExperimentTreatments:   true,
        ExperimentFields:       true,
      },
    }),
    prisma.test.findMany({ select: { id: true, Test_Name: true }, orderBy: { Test_Name: "asc" } }),
    prisma.drone.findMany({ select: { id: true, Name: true }, orderBy: { Name: "asc" } }),
    prisma.treatment.findMany({ select: { id: true, Treatment_Name: true }, orderBy: { Treatment_Name: "asc" } }),
    prisma.field.findMany({
      where: { Farms_id: farmId },
      select: { id: true, Name: true, geometry: true },
      orderBy: { Name: "asc" },
    }),
  ]);

  if (!farm || !farmExperiment) notFound();

  return (
    <ExperimentFormClient
      farmId={farm.id}
      farmName={farm.Farm_Name}
      experimentId={expId}
      experiment={{
        experiment_name: farmExperiment.experiment_name,
        start_date:      farmExperiment.start_date?.toISOString().slice(0, 10) ?? null,
        hypothesis:      farmExperiment.hypothesis,
        experiment_desc: farmExperiment.experiment_desc,
        measurements:    farmExperiment.measurements,
        criteria:        farmExperiment.criteria,
        lab_description: farmExperiment.lab_description,
        tests: farmExperiment.ExperimentTests.map((t) => ({
          test_id:       t.test_id,
          n_samples:     t.n_samples,
          expected_date: t.expected_date?.toISOString().slice(0, 10) ?? null,
          status:        t.status ?? null,
        })),
        drones: farmExperiment.ExperimentDroneFlights.map((d) => ({
          drone_id:      d.drone_id,
          n_flights:     d.n_flights,
          expected_date: d.expected_date?.toISOString().slice(0, 10) ?? null,
          status:        d.status ?? null,
        })),
        treatments: farmExperiment.ExperimentTreatments.map((t) => ({
          treatment_id:  t.treatment_id,
          is_continuous: t.is_continuous ?? true,
          rate:          t.rate !== null ? Number(t.rate) : null,
          rate_unit:     t.rate_unit ?? null,
        })),
        field_ids: farmExperiment.ExperimentFields.map((ef) => ef.field_id),
      }}
      allTests={allTests}
      allDrones={allDrones}
      allTreatments={allTreatments}
      farmFields={farmFields}
    />
  );
}

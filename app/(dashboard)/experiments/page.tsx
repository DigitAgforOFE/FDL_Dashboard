import { prisma } from "@/lib/prisma";
import { ExperimentsClient } from "./experiments-client";
import { format } from "date-fns";

export default async function ExperimentsPage() {
  const experiments = await prisma.farmExperiment.findMany({
    include: {
      Farm: { select: { Farm_Name: true } },
      ExperimentTreatments: {
        include: { Treatment: { select: { id: true, Treatment_Name: true } } },
      },
      ExperimentFields: {
        include: { Field: { select: { id: true, Name: true } } },
      },
    },
    orderBy: { farm_id: "asc" },
  });

  const data = experiments.map((e) => ({
    id: e.id,
    farm_id: e.farm_id,
    experiment_name: e.experiment_name,
    farm_name: e.Farm?.Farm_Name ?? null,
    fields: e.ExperimentFields.map((ef) => ef.Field?.Name ?? "").filter(Boolean).join(", ") || null,
    treatments: e.ExperimentTreatments.map((t) => t.Treatment?.Treatment_Name ?? "").filter(Boolean),
    start_date: e.start_date ? format(new Date(e.start_date), "MMM d, yyyy") : null,
  }));

  return <ExperimentsClient data={data} />;
}

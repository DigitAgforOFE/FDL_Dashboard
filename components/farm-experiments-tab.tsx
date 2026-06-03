"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ExperimentTestItem = {
  id: number;
  test_id: number;
  test_name: string | null;
  n_samples: number | null;
  expected_date: string | null;
};

export type ExperimentDroneItem = {
  id: number;
  drone_id: number;
  drone_name: string | null;
  n_flights: number | null;
  expected_date: string | null;
};

export type ExperimentData = {
  id: number;
  experiment_name: string | null;
  start_date: string | null;
  hypothesis: string | null;
  experiment_desc: string | null;
  measurements: string | null;
  criteria: string | null;
  lab_description: string | null;
  tests: ExperimentTestItem[];
  drones: ExperimentDroneItem[];
  treatment_ids: number[];
};

type TreatmentOption = { id: number; Treatment_Name: string | null };

interface Props {
  farmId: number;
  experiment: ExperimentData | null;
  allTreatments: TreatmentOption[];
}

export function FarmExperimentsTab({ farmId, experiment, allTreatments }: Props) {
  const hasData = !!(
    experiment?.experiment_name ||
    experiment?.hypothesis ||
    experiment?.experiment_desc ||
    experiment?.lab_description ||
    experiment?.tests.length ||
    experiment?.drones.length ||
    experiment?.treatment_ids.length
  );

  return (
    <div className="space-y-4">
      {/* Experiment Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Experiment Card</CardTitle>
          <Link
            href={`/farms/${farmId}/experiments`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {hasData ? "Edit" : "Add Experiment"}
          </Link>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <p className="text-sm text-slate-500 italic">No experiment info yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Experiment Name</span>
                <p className="font-medium mt-0.5">{experiment?.experiment_name ?? "—"}</p>
              </div>
              <div>
                <span className="text-slate-500">Start Date</span>
                <p className="font-medium mt-0.5">
                  {experiment?.start_date
                    ? new Date(experiment.start_date).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">Hypothesis</span>
                <p className="mt-0.5 whitespace-pre-wrap">{experiment?.hypothesis ?? "—"}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">Experiment</span>
                <p className="mt-0.5 whitespace-pre-wrap">{experiment?.experiment_desc ?? "—"}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">Measurements</span>
                <p className="mt-0.5 whitespace-pre-wrap">{experiment?.measurements ?? "—"}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">Criteria</span>
                <p className="mt-0.5 whitespace-pre-wrap">{experiment?.criteria ?? "—"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lab Design */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lab Design</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasData ? (
            <p className="text-sm text-slate-500 italic">No lab design info yet.</p>
          ) : (
            <>
              {experiment?.lab_description && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{experiment.lab_description}</p>
                </div>
              )}

              {(experiment?.tests.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Tests</p>
                  <div className="space-y-1">
                    {experiment?.tests.map((t, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm py-1 border-b last:border-0">
                        <span className="flex-1 font-medium">{t.test_name ?? `Test #${t.test_id}`}</span>
                        <span className="text-slate-500">{t.n_samples != null ? `${t.n_samples} samples` : ""}</span>
                        <span className="text-slate-500">
                          {t.expected_date ? new Date(t.expected_date).toLocaleDateString() : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(experiment?.drones.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Drone Flights</p>
                  <div className="space-y-1">
                    {experiment?.drones.map((d, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm py-1 border-b last:border-0">
                        <span className="flex-1 font-medium">{d.drone_name ?? `Drone #${d.drone_id}`}</span>
                        <span className="text-slate-500">{d.n_flights != null ? `${d.n_flights} flights` : ""}</span>
                        <span className="text-slate-500">
                          {d.expected_date ? new Date(d.expected_date).toLocaleDateString() : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(experiment?.treatment_ids.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Treatments</p>
                  <div className="flex flex-wrap gap-2">
                    {allTreatments
                      .filter((t) => experiment?.treatment_ids.includes(t.id))
                      .map((t) => (
                        <Badge key={t.id} variant="secondary">
                          {t.Treatment_Name ?? `Treatment #${t.id}`}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

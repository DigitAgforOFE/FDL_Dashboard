"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

type TestOption = { id: number; Test_Name: string | null };
type DroneOption = { id: number; Name: string | null };
type TreatmentOption = { id: number; Treatment_Name: string | null };

type TestRow = { test_id: number; n_samples: string; expected_date: string };
type DroneRow = { drone_id: number; n_flights: string; expected_date: string };

interface Props {
  farmId: number;
  farmName: string | null;
  experiment: {
    experiment_name: string | null;
    start_date: string | null;
    hypothesis: string | null;
    experiment_desc: string | null;
    measurements: string | null;
    criteria: string | null;
    lab_description: string | null;
    tests: { test_id: number; n_samples: number | null; expected_date: string | null }[];
    drones: { drone_id: number; n_flights: number | null; expected_date: string | null }[];
    treatment_ids: number[];
  } | null;
  allTests: TestOption[];
  allDrones: DroneOption[];
  allTreatments: TreatmentOption[];
}

const TEXTAREA = "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function ExperimentFormClient({
  farmId, farmName, experiment, allTests, allDrones, allTreatments,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [expName, setExpName] = useState(experiment?.experiment_name ?? "");
  const [startDate, setStartDate] = useState(experiment?.start_date ?? "");
  const [hypothesis, setHypothesis] = useState(experiment?.hypothesis ?? "");
  const [expDesc, setExpDesc] = useState(experiment?.experiment_desc ?? "");
  const [measurements, setMeasurements] = useState(experiment?.measurements ?? "");
  const [criteria, setCriteria] = useState(experiment?.criteria ?? "");
  const [labDesc, setLabDesc] = useState(experiment?.lab_description ?? "");

  const [testRows, setTestRows] = useState<TestRow[]>(
    experiment?.tests.length
      ? experiment.tests.map((t) => ({
          test_id: t.test_id,
          n_samples: t.n_samples?.toString() ?? "",
          expected_date: t.expected_date ?? "",
        }))
      : []
  );

  const [droneRows, setDroneRows] = useState<DroneRow[]>(
    experiment?.drones.length
      ? experiment.drones.map((d) => ({
          drone_id: d.drone_id,
          n_flights: d.n_flights?.toString() ?? "",
          expected_date: d.expected_date ?? "",
        }))
      : []
  );

  const [selectedTreatments, setSelectedTreatments] = useState<Set<number>>(
    new Set(experiment?.treatment_ids ?? [])
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/experiments/${farmId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experiment_name: expName || null,
          start_date: startDate || null,
          hypothesis: hypothesis || null,
          experiment_desc: expDesc || null,
          measurements: measurements || null,
          criteria: criteria || null,
          lab_description: labDesc || null,
          tests: testRows
            .filter((r) => r.test_id)
            .map((r) => ({
              test_id: r.test_id,
              n_samples: r.n_samples ? parseInt(r.n_samples) : null,
              expected_date: r.expected_date || null,
            })),
          drones: droneRows
            .filter((r) => r.drone_id)
            .map((r) => ({
              drone_id: r.drone_id,
              n_flights: r.n_flights ? parseInt(r.n_flights) : null,
              expected_date: r.expected_date || null,
            })),
          treatment_ids: Array.from(selectedTreatments),
        }),
      });
      router.push(`/farms/${farmId}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Link href="/farms" className="hover:text-slate-900">Farms</Link>
          <span>/</span>
          <Link href={`/farms/${farmId}`} className="hover:text-slate-900">
            {farmName ?? `Farm #${farmId}`}
          </Link>
          <span>/</span>
          <span>Experiments</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          {experiment ? "Edit Experiment" : "Add Experiment"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Experiment Card ── */}
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b">Experiment Card</h3>

          <div className="space-y-1.5">
            <Label>Experiment Name</Label>
            <Input value={expName} onChange={(e) => setExpName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Hypothesis</Label>
            <textarea rows={3} className={TEXTAREA} value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Experiment</Label>
            <textarea rows={3} className={TEXTAREA} value={expDesc} onChange={(e) => setExpDesc(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Measurements</Label>
            <textarea rows={2} className={TEXTAREA} value={measurements} onChange={(e) => setMeasurements(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Criteria</Label>
            <textarea rows={2} className={TEXTAREA} value={criteria} onChange={(e) => setCriteria(e.target.value)} />
          </div>
        </div>

        {/* ── Lab Design ── */}
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b">Lab Design</h3>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea rows={3} className={TEXTAREA} value={labDesc} onChange={(e) => setLabDesc(e.target.value)} />
          </div>

          {/* Tests */}
          <div className="space-y-2">
            <Label>Tests</Label>
            {testRows.map((row, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={row.test_id}
                  onChange={(e) => {
                    const updated = [...testRows];
                    updated[i] = { ...updated[i], test_id: parseInt(e.target.value) };
                    setTestRows(updated);
                  }}
                >
                  {allTests.map((t) => (
                    <option key={t.id} value={t.id}>{t.Test_Name ?? `Test #${t.id}`}</option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder="# samples"
                  className="w-28"
                  value={row.n_samples}
                  onChange={(e) => {
                    const updated = [...testRows];
                    updated[i] = { ...updated[i], n_samples: e.target.value };
                    setTestRows(updated);
                  }}
                />
                <Input
                  type="date"
                  className="w-40"
                  value={row.expected_date}
                  onChange={(e) => {
                    const updated = [...testRows];
                    updated[i] = { ...updated[i], expected_date: e.target.value };
                    setTestRows(updated);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setTestRows(testRows.filter((_, idx) => idx !== i))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {allTests.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTestRows([...testRows, { test_id: allTests[0].id, n_samples: "", expected_date: "" }])}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Test
              </Button>
            )}
          </div>

          {/* Drone Flights */}
          <div className="space-y-2">
            <Label>Drone Flights</Label>
            {droneRows.map((row, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={row.drone_id}
                  onChange={(e) => {
                    const updated = [...droneRows];
                    updated[i] = { ...updated[i], drone_id: parseInt(e.target.value) };
                    setDroneRows(updated);
                  }}
                >
                  {allDrones.map((d) => (
                    <option key={d.id} value={d.id}>{d.Name ?? `Drone #${d.id}`}</option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder="# flights"
                  className="w-28"
                  value={row.n_flights}
                  onChange={(e) => {
                    const updated = [...droneRows];
                    updated[i] = { ...updated[i], n_flights: e.target.value };
                    setDroneRows(updated);
                  }}
                />
                <Input
                  type="date"
                  className="w-40"
                  value={row.expected_date}
                  onChange={(e) => {
                    const updated = [...droneRows];
                    updated[i] = { ...updated[i], expected_date: e.target.value };
                    setDroneRows(updated);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDroneRows(droneRows.filter((_, idx) => idx !== i))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {allDrones.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDroneRows([...droneRows, { drone_id: allDrones[0].id, n_flights: "", expected_date: "" }])}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Flight
              </Button>
            )}
          </div>

          {/* Treatments */}
          {allTreatments.length > 0 && (
            <div className="space-y-2">
              <Label>Treatments</Label>
              <div className="space-y-2 border rounded-md p-3">
                {allTreatments.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTreatments.has(t.id)}
                      onChange={(e) => {
                        const next = new Set(selectedTreatments);
                        if (e.target.checked) next.add(t.id);
                        else next.delete(t.id);
                        setSelectedTreatments(next);
                      }}
                    />
                    {t.Treatment_Name ?? `Treatment #${t.id}`}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push(`/farms/${farmId}`)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

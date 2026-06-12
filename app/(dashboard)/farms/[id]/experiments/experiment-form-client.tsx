"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import FieldSelectorMapWrapper from "@/components/field-selector-map-wrapper";

type TestOption      = { id: number; Test_Name: string | null };
type DroneOption     = { id: number; Name: string | null };
type TreatmentOption = { id: number; Treatment_Name: string | null };
type FarmField       = { id: number; Name: string | null; geometry: string | null };

const ASSIGNMENT_STATUSES = ["Planned", "Collected", "Completed", "Cancelled"] as const;

type TestRow      = { test_id: number; n_samples: string; expected_date: string; status: string };
type DroneRow     = { drone_id: number; n_flights: string; expected_date: string; status: string };
type TreatmentRow = { treatment_id: number; is_continuous: boolean; rate: string; rate_unit: string };

interface Props {
  farmId:       number;
  farmName:     string | null;
  experimentId?: number;
  experiment: {
    experiment_name: string | null;
    start_date:      string | null;
    hypothesis:      string | null;
    experiment_desc: string | null;
    measurements:    string | null;
    criteria:        string | null;
    lab_description: string | null;
    tests:      { test_id: number; n_samples: number | null; expected_date: string | null; status: string | null }[];
    drones:     { drone_id: number; n_flights: number | null; expected_date: string | null; status: string | null }[];
    treatments: { treatment_id: number; is_continuous: boolean; rate: number | null; rate_unit: string | null }[];
    field_ids:  number[];
  } | null;
  allTests:      TestOption[];
  allDrones:     DroneOption[];
  allTreatments: TreatmentOption[];
  farmFields:    FarmField[];
}

const TEXTAREA = "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
const SELECT   = "h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm";

export default function ExperimentFormClient({
  farmId, farmName, experimentId, experiment, allTests, allDrones, allTreatments, farmFields,
}: Props) {
  const router   = useRouter();
  const [saving, setSaving] = useState(false);

  const [expName,      setExpName]      = useState(experiment?.experiment_name ?? "");
  const [startDate,    setStartDate]    = useState(experiment?.start_date ?? "");
  const [hypothesis,   setHypothesis]   = useState(experiment?.hypothesis ?? "");
  const [expDesc,      setExpDesc]      = useState(experiment?.experiment_desc ?? "");
  const [measurements, setMeasurements] = useState(experiment?.measurements ?? "");
  const [criteria,     setCriteria]     = useState(experiment?.criteria ?? "");
  const [labDesc,      setLabDesc]      = useState(experiment?.lab_description ?? "");

  const [testRows, setTestRows] = useState<TestRow[]>(
    experiment?.tests.length
      ? experiment.tests.map((t) => ({
          test_id:       t.test_id,
          n_samples:     t.n_samples?.toString() ?? "",
          expected_date: t.expected_date ?? "",
          status:        t.status ?? "",
        }))
      : []
  );

  const [droneRows, setDroneRows] = useState<DroneRow[]>(
    experiment?.drones.length
      ? experiment.drones.map((d) => ({
          drone_id:      d.drone_id,
          n_flights:     d.n_flights?.toString() ?? "",
          expected_date: d.expected_date ?? "",
          status:        d.status ?? "",
        }))
      : []
  );

  const [treatmentRows, setTreatmentRows] = useState<TreatmentRow[]>(
    experiment?.treatments.length
      ? experiment.treatments.map((t) => ({
          treatment_id:  t.treatment_id,
          is_continuous: t.is_continuous,
          rate:          t.rate?.toString() ?? "",
          rate_unit:     t.rate_unit ?? "",
        }))
      : []
  );

  const [selectedFieldIds, setSelectedFieldIds] = useState<Set<number>>(
    new Set(experiment?.field_ids ?? [])
  );

  function toggleField(id: number) {
    setSelectedFieldIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const fieldsWithGeometry = farmFields.filter((f) => f.geometry);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url    = experimentId
      ? `/api/experiments/${farmId}/${experimentId}`
      : `/api/experiments/${farmId}`;
    const method = experimentId ? "PUT" : "POST";
    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experiment_name: expName || null,
          start_date:      startDate || null,
          hypothesis:      hypothesis || null,
          experiment_desc: expDesc || null,
          measurements:    measurements || null,
          criteria:        criteria || null,
          lab_description: labDesc || null,
          tests: testRows
            .filter((r) => r.test_id)
            .map((r) => ({
              test_id:       r.test_id,
              n_samples:     r.n_samples ? parseInt(r.n_samples) : null,
              expected_date: r.expected_date || null,
              status:        r.status || null,
            })),
          drones: droneRows
            .filter((r) => r.drone_id)
            .map((r) => ({
              drone_id:      r.drone_id,
              n_flights:     r.n_flights ? parseInt(r.n_flights) : null,
              expected_date: r.expected_date || null,
              status:        r.status || null,
            })),
          treatments: treatmentRows
            .filter((r) => r.treatment_id)
            .map((r) => ({
              treatment_id:  r.treatment_id,
              is_continuous: r.is_continuous,
              rate:          r.rate ? parseFloat(r.rate) : null,
              rate_unit:     r.rate_unit || null,
            })),
          field_ids: Array.from(selectedFieldIds),
        }),
      });
      router.push(`/farms/${farmId}/experiments`);
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
          <Link href={`/farms/${farmId}/experiments`} className="hover:text-slate-900">Experiments</Link>
          <span>/</span>
          <span>{experiment ? "Edit" : "New"}</span>
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
              <div key={i} className="flex gap-2 items-center flex-wrap">
                <select
                  className={`flex-1 min-w-32 ${SELECT}`}
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
                <select
                  className={`w-36 ${SELECT}`}
                  value={row.status}
                  onChange={(e) => {
                    const updated = [...testRows];
                    updated[i] = { ...updated[i], status: e.target.value };
                    setTestRows(updated);
                  }}
                >
                  <option value="">— Status —</option>
                  {ASSIGNMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <Button type="button" variant="ghost" size="icon" onClick={() => setTestRows(testRows.filter((_, idx) => idx !== i))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {allTests.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTestRows([...testRows, { test_id: allTests[0].id, n_samples: "", expected_date: "", status: "" }])}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Test
              </Button>
            )}
          </div>

          {/* Drone Flights */}
          <div className="space-y-2">
            <Label>Drone Flights</Label>
            {droneRows.map((row, i) => (
              <div key={i} className="flex gap-2 items-center flex-wrap">
                <select
                  className={`flex-1 min-w-32 ${SELECT}`}
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
                <select
                  className={`w-36 ${SELECT}`}
                  value={row.status}
                  onChange={(e) => {
                    const updated = [...droneRows];
                    updated[i] = { ...updated[i], status: e.target.value };
                    setDroneRows(updated);
                  }}
                >
                  <option value="">— Status —</option>
                  {ASSIGNMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <Button type="button" variant="ghost" size="icon" onClick={() => setDroneRows(droneRows.filter((_, idx) => idx !== i))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {allDrones.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDroneRows([...droneRows, { drone_id: allDrones[0].id, n_flights: "", expected_date: "", status: "" }])}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Flight
              </Button>
            )}
          </div>

          {/* Farm Level Treatments */}
          <div className="space-y-2">
            <Label>Farm Level Treatments</Label>
            {treatmentRows.map((row, i) => (
              <div key={i} className="flex gap-2 items-center flex-wrap border rounded-md p-2 bg-slate-50">
                <select
                  className={`flex-1 min-w-36 ${SELECT}`}
                  value={row.treatment_id}
                  onChange={(e) => {
                    const updated = [...treatmentRows];
                    updated[i] = { ...updated[i], treatment_id: parseInt(e.target.value) };
                    setTreatmentRows(updated);
                  }}
                >
                  {allTreatments.map((t) => (
                    <option key={t.id} value={t.id}>{t.Treatment_Name ?? `Treatment #${t.id}`}</option>
                  ))}
                </select>
                <select
                  className={`w-36 ${SELECT}`}
                  value={row.is_continuous ? "continuous" : "categorical"}
                  onChange={(e) => {
                    const updated = [...treatmentRows];
                    updated[i] = { ...updated[i], is_continuous: e.target.value === "continuous" };
                    setTreatmentRows(updated);
                  }}
                >
                  <option value="continuous">Continuous</option>
                  <option value="categorical">Categorical</option>
                </select>
                <Input
                  type="number"
                  step="any"
                  placeholder="Rate"
                  className="w-24"
                  value={row.rate}
                  onChange={(e) => {
                    const updated = [...treatmentRows];
                    updated[i] = { ...updated[i], rate: e.target.value };
                    setTreatmentRows(updated);
                  }}
                />
                <Input
                  placeholder="Unit"
                  className="w-24"
                  value={row.rate_unit}
                  onChange={(e) => {
                    const updated = [...treatmentRows];
                    updated[i] = { ...updated[i], rate_unit: e.target.value };
                    setTreatmentRows(updated);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setTreatmentRows(treatmentRows.filter((_, idx) => idx !== i))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {allTreatments.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setTreatmentRows([
                    ...treatmentRows,
                    { treatment_id: allTreatments[0].id, is_continuous: true, rate: "", rate_unit: "" },
                  ])
                }
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Treatment
              </Button>
            )}
          </div>

          {/* Linked Fields */}
          <div className="space-y-2">
            <Label>Linked Fields</Label>
            {farmFields.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No fields have been added to this farm yet.</p>
            ) : fieldsWithGeometry.length > 0 ? (
              <>
                <p className="text-xs text-slate-500">Click a field polygon to select or deselect it.</p>
                <FieldSelectorMapWrapper
                  fields={fieldsWithGeometry.map((f) => ({ id: f.id, name: f.Name, geometry: f.geometry }))}
                  selectedIds={Array.from(selectedFieldIds)}
                  onToggle={toggleField}
                />
                {selectedFieldIds.size > 0 && (
                  <p className="text-xs text-slate-500">
                    Selected:{" "}
                    {farmFields
                      .filter((f) => selectedFieldIds.has(f.id))
                      .map((f) => f.Name ?? `Field #${f.id}`)
                      .join(", ")}
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-2 border rounded-md p-3">
                {farmFields.map((f) => (
                  <label key={f.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFieldIds.has(f.id)}
                      onChange={() => toggleField(f.id)}
                    />
                    {f.Name ?? `Field #${f.id}`}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push(`/farms/${farmId}/experiments`)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface TestFormProps {
  onSuccess?: () => void;
  testId?: number;
  initialData?: {
    Test_Name?: string | null;
    Test_Description?: string | null;
    Cost?: number | null;
    Methodology?: string | null;
    Data_Processing_Instructions?: string | null;
  };
}

export function TestForm({ onSuccess, testId, initialData }: TestFormProps) {
  const [name, setName] = useState(initialData?.Test_Name ?? "");
  const [desc, setDesc] = useState(initialData?.Test_Description ?? "");
  const [cost, setCost] = useState(initialData?.Cost?.toString() ?? "");
  const [methodology, setMethodology] = useState(initialData?.Methodology ?? "");
  const [processingInstructions, setProcessingInstructions] = useState(initialData?.Data_Processing_Instructions ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(testId ? `/api/tests/${testId}` : "/api/tests", {
        method: testId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Test_Name: name,
          Test_Description: desc,
          Cost: cost ? parseFloat(cost) : null,
          Methodology: methodology || null,
          Data_Processing_Instructions: processingInstructions || null,
        }),
      });
      onSuccess?.();
    } finally { setSaving(false); }
  }

  const textareaClass = "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring resize-y min-h-[100px]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5"><Label>Test Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
      <div className="space-y-1.5"><Label>Description</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
      <div className="space-y-1.5"><Label>Cost ($)</Label><Input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} /></div>
      <div className="space-y-1.5">
        <Label>Methodology</Label>
        <textarea
          className={textareaClass}
          value={methodology}
          onChange={(e) => setMethodology(e.target.value)}
          placeholder="Describe the data collection methodology (markdown supported)"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Data Processing Instructions</Label>
        <textarea
          className={textareaClass}
          value={processingInstructions}
          onChange={(e) => setProcessingInstructions(e.target.value)}
          placeholder="Describe the data structure and how to interpret raw data (markdown supported)"
        />
      </div>
      <Button type="submit" disabled={saving} className="w-full">{saving ? "Saving..." : testId ? "Update" : "Create"}</Button>
    </form>
  );
}

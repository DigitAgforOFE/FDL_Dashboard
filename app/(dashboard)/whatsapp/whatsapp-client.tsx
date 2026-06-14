"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, UserCheck, X, Plus } from "lucide-react";

interface MessageTemplate {
  id: number;
  name: string;
  content: string;
}

const ONBOARDING_MESSAGE = `This number is monitored weekly — not suitable for urgent matters.

Welcome to the Farmers Datalab! Use this number to document your on-farm experiment — send observations, photos, voice notes, videos, soil reports, location pins, or any other field data.

Please avoid sending sensitive personal or financial information (IDs, banking details, passwords).

By using this service you acknowledge that WhatsApp and Twilio process messages as part of their infrastructure. We do not share your data with any other party.

Your participation is voluntary. Reply with your name to get started.`;

interface WhatsAppRow {
  id: number;
  name: string;
  phone: string;
  farm_name: string | null;
  farm_id: number | null;
  last_submission: string | null;
  days_since: number | null;
  token: string;
  channel: string | null;
}

function LastSubmissionBadge({ days }: { days: number | null }) {
  if (days === null)
    return <Badge variant="destructive" className="text-xs">No submissions</Badge>;
  if (days === 0)
    return <Badge className="bg-emerald-100 text-emerald-800 text-xs">Today</Badge>;
  if (days <= 3)
    return <Badge className="bg-emerald-100 text-emerald-800 text-xs">{days}d ago</Badge>;
  if (days <= 7)
    return <Badge className="bg-amber-100 text-amber-800 text-xs">{days}d ago</Badge>;
  return <Badge variant="destructive" className="text-xs">{days}d ago</Badge>;
}

// Modal component for composing and sending a message
function MessageModal({
  farmer,
  initialMessage,
  templates,
  onTemplateCreated,
  onTemplateDeleted,
  onClose,
  onSent,
}: {
  farmer: WhatsAppRow;
  initialMessage: string;
  templates: MessageTemplate[];
  onTemplateCreated: (t: MessageTemplate) => void;
  onTemplateDeleted: (id: number) => void;
  onClose: () => void;
  onSent: () => void;
}) {
  const [message, setMessage] = useState(initialMessage);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [saveMode, setSaveMode] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const channel = farmer.channel ?? "whatsapp";

  async function saveTemplate() {
    if (!templateName.trim() || !message.trim()) return;
    setSavingTemplate(true);
    try {
      const res = await fetch("/api/message-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: templateName.trim(), content: message.trim() }),
      });
      if (res.ok) {
        const created = await res.json();
        onTemplateCreated(created);
        setSaveMode(false);
        setTemplateName("");
      }
    } finally {
      setSavingTemplate(false);
    }
  }

  async function deleteTemplate(id: number) {
    await fetch(`/api/message-templates/${id}`, { method: "DELETE" });
    onTemplateDeleted(id);
  }

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: farmer.phone, message: message.trim(), channel }),
      });
      if (res.ok) {
        onSent();
        onClose();
      } else {
        const err = await res.json();
        setError(err.error ?? "Failed to send message.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900">{farmer.name}</p>
            <p className="text-xs text-slate-500">{farmer.phone}</p>
            <p className="text-xs mt-0.5">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                channel === "sms"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}>
                {channel === "sms" ? "SMS" : "WhatsApp"}
              </span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {templates.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Saved messages</label>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-32 overflow-y-auto">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-3 py-1.5 hover:bg-slate-50">
                  <button
                    className="text-sm text-slate-700 text-left truncate flex-1"
                    onClick={() => setMessage(t.content)}
                  >
                    {t.name}
                  </button>
                  <button
                    onClick={() => deleteTemplate(t.id)}
                    className="ml-2 text-slate-300 hover:text-red-500 flex-shrink-0"
                    title="Delete template"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <textarea
          className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={12}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />

        {error && <p className="text-xs text-red-500">{error}</p>}

        {saveMode ? (
          <div className="flex items-center gap-2">
            <input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name"
              className="flex-1 h-9 rounded-lg border border-slate-200 px-2 text-sm"
            />
            <Button size="sm" onClick={saveTemplate} disabled={savingTemplate || !templateName.trim() || !message.trim()}>
              {savingTemplate ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSaveMode(false)}>Cancel</Button>
          </div>
        ) : (
          <button
            onClick={() => setSaveMode(true)}
            disabled={!message.trim()}
            className="self-start inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-40"
          >
            <Plus className="h-3 w-3" /> Save as template
          </button>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function WhatsAppClient({ data }: { data: WhatsAppRow[] }) {
  const [modal, setModal] = useState<{
    farmer: WhatsAppRow;
    message: string;
    isOnboarding?: boolean;
  } | null>(null);
  const [sentNotice, setSentNotice] = useState("");
  const [onboarded, setOnboarded] = useState<Set<number>>(new Set());
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [channels, setChannels] = useState<Record<number, string | null>>(
    Object.fromEntries(data.map((r) => [r.id, r.channel]))
  );

  useEffect(() => {
    fetch("/api/message-templates")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => setTemplates([]));
  }, []);

  function handleTemplateCreated(t: MessageTemplate) {
    setTemplates((prev) => [t, ...prev]);
  }

  function handleTemplateDeleted(id: number) {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  async function updateChannel(farmerId: number, channel: string | null) {
    setChannels((prev) => ({ ...prev, [farmerId]: channel }));
    await fetch(`/api/contacts/${farmerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel }),
    });
  }

  function openCustomMessage(farmer: WhatsAppRow) {
    setModal({ farmer: { ...farmer, channel: channels[farmer.id] ?? null }, message: "" });
  }

  function openOnboarding(farmer: WhatsAppRow) {
    setModal({ farmer: { ...farmer, channel: channels[farmer.id] ?? null }, message: ONBOARDING_MESSAGE, isOnboarding: true });
  }

  function handleSent(farmerId?: number, wasOnboarding?: boolean) {
    setSentNotice("Message sent successfully.");
    setTimeout(() => setSentNotice(""), 4000);
    if (wasOnboarding && farmerId) {
      setOnboarded((prev) => new Set(prev).add(farmerId));
    }
  }

  const columns = [
    { key: "name", header: "Name" },
    { key: "phone", header: "Phone" },
    {
      key: "farm_name",
      header: "Farm",
      render: (row: Record<string, unknown>) => {
        const r = row as unknown as WhatsAppRow;
        return r.farm_name ?? <span className="text-slate-400">—</span>;
      },
    },
    {
      key: "channel",
      header: "Channel",
      render: (row: Record<string, unknown>) => {
        const r = row as unknown as WhatsAppRow;
        const current = channels[r.id] ?? "";
        return (
          <select
            value={current}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              updateChannel(r.id, e.target.value || null);
            }}
            className="h-7 rounded border border-slate-200 bg-white px-1.5 text-xs text-slate-700"
          >
            <option value="">— None —</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
          </select>
        );
      },
    },
    {
      key: "days_since",
      header: "Last Submission",
      render: (row: Record<string, unknown>) => {
        const r = row as unknown as WhatsAppRow;
        return <LastSubmissionBadge days={r.days_since} />;
      },
    },
    {
      key: "_actions",
      header: "",
      render: (row: Record<string, unknown>) => {
        const r = row as unknown as WhatsAppRow;
        return (
          <div className="flex items-center gap-1">
            {onboarded.has(r.id) ? (
              <span className="inline-flex items-center gap-1 text-xs h-7 px-2 rounded border border-slate-200 text-slate-400 bg-slate-50">
                <UserCheck className="h-3 w-3" />
                Onboarded
              </span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 px-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                title="Send onboarding message"
                onClick={(e) => { e.stopPropagation(); openOnboarding(r); }}
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Onboard
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              title="Send custom message"
              onClick={(e) => { e.stopPropagation(); openCustomMessage(r); }}
            >
              <MessageCircle className="h-4 w-4 text-slate-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  const active   = data.filter((r) => r.days_since !== null && r.days_since <= 7).length;
  const inactive = data.filter((r) => r.days_since === null || r.days_since > 7).length;

  return (
    <div className="space-y-4">
      {sentNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-2 rounded-lg">
          {sentNotice}
        </div>
      )}

      <div className="flex gap-4">
        <div className="bg-white border border-slate-200 rounded-lg px-5 py-3">
          <div className="text-2xl font-semibold text-slate-900">{data.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">WhatsApp farmers</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-5 py-3">
          <div className="text-2xl font-semibold text-emerald-600">{active}</div>
          <div className="text-xs text-slate-500 mt-0.5">Active (last 7 days)</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-5 py-3">
          <div className="text-2xl font-semibold text-red-500">{inactive}</div>
          <div className="text-xs text-slate-500 mt-0.5">Inactive / no submissions</div>
        </div>
      </div>

      <DataTable
        title="WhatsApp Farmers"
        data={data as unknown as Record<string, unknown>[]}
        columns={columns}
        searchKeys={["name", "phone", "farm_name"]}
      />

      {modal && (
        <MessageModal
          farmer={modal.farmer}
          initialMessage={modal.message}
          templates={templates}
          onTemplateCreated={handleTemplateCreated}
          onTemplateDeleted={handleTemplateDeleted}
          onClose={() => setModal(null)}
          onSent={() => handleSent(modal.farmer.id, modal.isOnboarding)}
        />
      )}
    </div>
  );
}

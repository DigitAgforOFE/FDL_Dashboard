"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Smartphone } from "lucide-react";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  position: string | null;
  has_token: boolean;
  createdAt: Date;
}

interface UserRolesTableProps {
  users: UserRow[];
  currentUserId: string;
}

const ROLES = ["admin", "member", "viewer"] as const;

export function UserRolesTable({ users, currentUserId }: UserRolesTableProps) {
  const [rows, setRows] = useState(users);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function handleRoleChange(userId: string, newRole: string) {
    setSavingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setRows((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>App Access</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name ?? "—"}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell className="text-slate-500">{user.position ?? "—"}</TableCell>
            <TableCell>
              {user.has_token ? (
                <Badge variant="default" className="gap-1">
                  <Smartphone className="h-3 w-3" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-slate-400">None</Badge>
              )}
            </TableCell>
            <TableCell>
              <select
                value={user.role}
                disabled={savingId === user.id || user.id === currentUserId}
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                className="text-sm border border-slate-200 rounded px-2 py-1 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
              {user.id === currentUserId && (
                <span className="ml-2 text-xs text-slate-400">(you)</span>
              )}
            </TableCell>
            <TableCell className="text-slate-500 text-xs">
              {new Date(user.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

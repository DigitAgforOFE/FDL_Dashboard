import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEditMode } from "@/lib/edit-mode";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditModeToggle } from "./edit-mode-toggle";
import { UserRolesTable } from "./user-roles-table";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const [users, editMode] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        position: true,
        bearer_token: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    getEditMode(),
  ]);

  const usersWithToken = users.map((u) => ({
    ...u,
    has_token: !!u.bearer_token,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Admin Panel</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage user roles and site settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit Mode</CardTitle>
          <CardDescription>
            When enabled, Tier 2 (Member) users can delete records. Disable when not in use.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditModeToggle initialEditMode={editMode} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">User Roles</CardTitle>
          <CardDescription>
            Assign roles to dashboard accounts. Changes take effect at next sign-in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-slate-500">
              No accounts yet — bootstrap admin (<code>admin@lab.com</code>) is active.
            </p>
          ) : (
            <UserRolesTable
              users={usersWithToken}
              currentUserId={session.user.id}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

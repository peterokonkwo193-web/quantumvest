"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { FadeIn, GlassCard } from "@/components/animations/motion-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import type { Database } from "@/lib/database.types";

type Plan = Database["public"]["Tables"]["investment_plans"]["Row"];

const emptyForm = {
  plan_name: "",
  min_deposit: "",
  max_deposit: "",
  roi: "",
  duration: "",
  features: "",
};

export function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/plans");
    if (res.ok) {
      const json = await res.json();
      setPlans(json.plans ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(plan: Plan) {
    setEditingId(plan.id);
    setForm({
      plan_name: plan.plan_name,
      min_deposit: String(plan.min_deposit),
      max_deposit: plan.max_deposit ? String(plan.max_deposit) : "",
      roi: String(plan.roi),
      duration: String(plan.duration),
      features: plan.features.join(", "),
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      plan_name: form.plan_name,
      min_deposit: parseFloat(form.min_deposit),
      max_deposit: form.max_deposit ? parseFloat(form.max_deposit) : null,
      roi: parseFloat(form.roi),
      duration: parseInt(form.duration, 10),
      features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
    };

    if (editingId) {
      await fetch(`/api/admin/plans/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setForm(emptyForm);
    setEditingId(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this plan?")) return;
    const res = await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json();
      alert(j.error ?? "Delete failed");
    }
    load();
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <FadeIn className="mb-8">
        <span className="label-mono text-neon">Plan Management</span>
        <h1 className="text-3xl font-bold text-white">Investment Plans</h1>
      </FadeIn>

      <div className="grid gap-8 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 font-bold text-white">
            {editingId ? "Edit Plan" : "Create Plan"}
          </h3>
          <form onSubmit={save} className="space-y-4">
            <div>
              <Label>Plan name</Label>
              <Input
                required
                value={form.plan_name}
                onChange={(e) => setForm({ ...form, plan_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min deposit</Label>
                <Input
                  required
                  type="number"
                  value={form.min_deposit}
                  onChange={(e) => setForm({ ...form, min_deposit: e.target.value })}
                />
              </div>
              <div>
                <Label>Max deposit</Label>
                <Input
                  type="number"
                  value={form.max_deposit}
                  onChange={(e) => setForm({ ...form, max_deposit: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ROI %</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={form.roi}
                  onChange={(e) => setForm({ ...form, roi: e.target.value })}
                />
              </div>
              <div>
                <Label>Duration (days)</Label>
                <Input
                  required
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Features (comma-separated)</Label>
              <Input
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </GlassCard>

        <div className="space-y-4">
          {plans.map((plan) => (
            <GlassCard key={plan.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.plan_name}</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {formatCurrency(plan.min_deposit)}
                    {plan.max_deposit ? ` – ${formatCurrency(plan.max_deposit)}` : "+"} ·{" "}
                    {plan.roi}% ROI · {plan.duration} days
                  </p>
                  <ul className="mt-2 text-xs text-on-surface-variant">
                    {plan.features.slice(0, 3).map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(plan)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(plan.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}

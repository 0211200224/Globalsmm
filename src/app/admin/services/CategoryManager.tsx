"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/admin-catalog";

export type EditableCategory = {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
  serviceCount: number;
};

export function CategoryManager({ categories }: { categories: EditableCategory[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState<EditableCategory | "new" | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("apps");
  const [sortOrder, setSortOrder] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function startEdit(category: EditableCategory | "new") {
    setError(null);
    setEditing(category);
    if (category === "new") {
      setName("");
      setIcon("apps");
      setSortOrder(categories.length);
    } else {
      setName(category.name);
      setIcon(category.icon);
      setSortOrder(category.sortOrder);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result =
      editing === "new"
        ? await createCategory({ name, icon, sortOrder })
        : await updateCategory(editing!.id, { name, icon, sortOrder });

    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(category: EditableCategory) {
    if (!confirm(`Delete platform "${category.name}"?`)) return;
    const result = await deleteCategory(category.id);
    if (!result.success) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="glass-panel rounded-xl p-stack-lg">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-headline-md text-on-surface">
          Platforms ({categories.length})
        </h3>
        <span className="material-symbols-outlined text-on-surface-variant">
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </button>

      {expanded && (
        <div className="mt-6 space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant">
                  {category.icon}
                </span>
                <div>
                  <p className="text-body-sm font-medium text-on-surface">
                    {category.name}
                  </p>
                  <p className="text-label-sm text-on-surface-variant">
                    {category.serviceCount} service(s)
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(category)}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-label-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category)}
                  className="px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 text-label-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => startEdit("new")}
            className="w-full py-2.5 rounded-lg border border-dashed border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-tertiary transition-colors text-label-sm"
          >
            + Add Platform
          </button>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel bg-surface-container-low border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h4 className="text-headline-md text-on-surface mb-4">
              {editing === "new" ? "New Platform" : "Edit Platform"}
            </h4>
            {error && (
              <div className="bg-error-container/20 border border-error/30 text-error text-body-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-label-sm text-on-surface-variant">Name</label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-label-sm text-on-surface-variant">
                  Material icon name
                </label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-label-sm text-on-surface-variant">
                  Sort order
                </label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg bg-tertiary text-on-tertiary font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

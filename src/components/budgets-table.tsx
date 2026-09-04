"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { Budget } from "@/lib/db/schema";
import type { Dictionary, Locale } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/format";
import { BudgetStatusBadge } from "@/components/budget-status-badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type BudgetRow = {
  id: string;
  title: string;
  clientName: string;
  kind: Budget["kind"];
  status: Budget["status"];
  currency: string;
  total: number;
  updatedAt: Date;
};

const STATUSES = ["draft", "sent", "viewed", "accepted", "expired"] as const;
type SortKey = "clientName" | "total" | "updatedAt";

export function BudgetsTable({
  budgets,
  dict,
  locale,
}: {
  budgets: BudgetRow[];
  dict: Dictionary;
  locale: Locale;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Budget["status"] | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function kindLabel(kind: Budget["kind"]) {
    return kind === "product" ? dict.editor.kindProduct : dict.editor.kindService;
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = budgets.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.clientName.toLowerCase().includes(q) ||
        kindLabel(b.kind).toLowerCase().includes(q)
      );
    });
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "total") cmp = a.total - b.total;
      else if (sortKey === "updatedAt") cmp = a.updatedAt.getTime() - b.updatedAt.getTime();
      else cmp = a.clientName.localeCompare(b.clientName);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgets, query, status, sortKey, sortDir, locale]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function sortIcon(column: SortKey) {
    if (sortKey !== column) return <ArrowUpDown className="size-3.5 text-muted-foreground/50" />;
    return sortDir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.dashboard.searchPlaceholder}
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(v) => v && setStatus(v as typeof status)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue>
              {(v: string) =>
                v === "all"
                  ? dict.dashboard.filterAllStatuses
                  : dict.dashboard.status[v as Budget["status"]]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{dict.dashboard.filterAllStatuses}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {dict.dashboard.status[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
              <th className="whitespace-nowrap px-3 py-2 font-medium">
                {dict.editor.fieldTitle}
              </th>
              <th
                className="cursor-pointer select-none whitespace-nowrap px-3 py-2 font-medium"
                onClick={() => toggleSort("clientName")}
              >
                <span className="inline-flex items-center gap-1">
                  {dict.dashboard.columnClient}
                  {sortIcon("clientName")}
                </span>
              </th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">
                {dict.dashboard.columnType}
              </th>
              <th
                className="cursor-pointer select-none whitespace-nowrap px-3 py-2 font-medium"
                onClick={() => toggleSort("total")}
              >
                <span className="inline-flex items-center gap-1">
                  {dict.editor.total}
                  {sortIcon("total")}
                </span>
              </th>
              <th className="whitespace-nowrap px-3 py-2 font-medium">
                {dict.dashboard.columnStatus}
              </th>
              <th
                className="cursor-pointer select-none whitespace-nowrap px-3 py-2 font-medium"
                onClick={() => toggleSort("updatedAt")}
              >
                <span className="inline-flex items-center gap-1">
                  {dict.dashboard.columnUpdated}
                  {sortIcon("updatedAt")}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr
                key={b.id}
                className="cursor-pointer border-b last:border-0 hover:bg-accent/50"
                onClick={() => router.push(`/dashboard/${b.id}`)}
              >
                <td className="max-w-48 truncate px-3 py-2 font-medium">{b.title}</td>
                <td className="max-w-40 truncate px-3 py-2 text-muted-foreground">
                  {b.clientName}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                  {kindLabel(b.kind)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                  {formatCurrency(b.total, b.currency, locale)}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <BudgetStatusBadge status={b.status} dict={dict} />
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                  {formatDate(b.updatedAt, locale)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  {dict.dashboard.noResults}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

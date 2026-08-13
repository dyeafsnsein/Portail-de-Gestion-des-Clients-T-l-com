import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Generic sortable + paginated table — same pattern as the old customers
 * table: sortable headers, staggered row entrance, pagination footer with
 * rows-per-page, empty state with reset-filters action.
 */

export interface Column<T> {
  key: string;
  label: string;
  align?: 'right';
  sortable?: boolean;
  /** return a string or number for sorting; defaults to row[key] */
  sortValue?: (row: T) => string | number;
  render: (row: T) => ReactNode;
}

export default function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyTitle,
  emptyMessage,
  emptyImage = '/empty-search.svg',
  onResetFilters,
  countLabel,
  initialSortKey,
  initialSortDir = 1,
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[];
  emptyTitle: string;
  emptyMessage: string;
  emptyImage?: string;
  onResetFilters: () => void;
  countLabel: string;
  initialSortKey: string;
  initialSortDir?: 1 | -1;
  onRowClick?: (row: T) => void;
}) {
  const [sortKey, setSortKey] = useState(initialSortKey);
  const [sortDir, setSortDir] = useState<1 | -1>(initialSortDir);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  const sorted = useMemo(() => {
    const arr = [...rows];
    const col = columns.find((c) => c.key === sortKey);
    if (col) {
      arr.sort((a, b) => {
        const av = col.sortValue ? col.sortValue(a) : (a as Record<string, unknown>)[col.key];
        const bv = col.sortValue ? col.sortValue(b) : (b as Record<string, unknown>)[col.key];
        const cmp =
          typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av ?? '').localeCompare(String(bv ?? ''));
        return cmp * sortDir;
      });
    }
    return arr;
  }, [rows, columns, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / perPage));
  const clampedPage = Math.min(page, pageCount);
  const display = sorted.slice((clampedPage - 1) * perPage, clampedPage * perPage);

  const toggleSort = (key: string) => {
    if (key === sortKey) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="v-card overflow-hidden"
    >
      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <img src={emptyImage} alt="" className="h-32 w-auto" />
          <div>
            <p className="text-[15px] font-semibold text-ink-1">{emptyTitle}</p>
            <p className="mt-1 text-[13px] text-ink-3">{emptyMessage}</p>
          </div>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-1 rounded-md border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-ink-1 shadow-card transition-colors duration-150 hover:bg-surface-2"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-line">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        'px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.04em] text-ink-3',
                        col.align === 'right' && 'text-right',
                      )}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className={cn(
                            'inline-flex items-center gap-1 uppercase tracking-[0.04em] transition-colors duration-150 hover:text-ink-1',
                            col.align === 'right' && 'flex-row-reverse',
                            sortKey === col.key && 'text-ink-1',
                          )}
                        >
                          {col.label}
                          <ChevronDown
                            size={12}
                            className={cn(
                              'transition-transform duration-[180ms]',
                              sortKey === col.key ? 'opacity-100' : 'opacity-0',
                              sortKey === col.key && sortDir === 1 && 'rotate-180',
                            )}
                          />
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {display.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 12) * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'group relative border-b border-line last:border-0',
                      onRowClick && 'cursor-pointer hover:bg-surface-2',
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn('px-5 py-2.5', col.align === 'right' && 'text-right')}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* pagination footer */}
          <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-3">
            <p className="text-[12px] text-ink-3">
              Page {clampedPage} of {pageCount} · {sorted.length} {countLabel}
            </p>
            <div className="ml-auto flex items-center gap-2">
              <label className="text-[12px] text-ink-3" htmlFor="rows-per-page">Rows per page</label>
              <select
                id="rows-per-page"
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-md border border-line-strong bg-surface px-2 py-1 font-mono text-[12px] text-ink-1 outline-none focus:border-brand"
              >
                {[8, 12, 24].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <button
                type="button"
                aria-label="Previous page"
                disabled={clampedPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="grid h-7 w-7 place-items-center rounded-md border border-line text-ink-2 transition-colors duration-150 hover:bg-surface-2 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                aria-label="Next page"
                disabled={clampedPage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="grid h-7 w-7 place-items-center rounded-md border border-line text-ink-2 transition-colors duration-150 hover:bg-surface-2 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.section>
  );
}

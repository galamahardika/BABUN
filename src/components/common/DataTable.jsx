import { useState } from 'react'
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'
import SeverityBadge from './SeverityBadge'

export default function DataTable({
  columns, data, onRowClick, emptyText = 'Tidak ada data',
  selectable = false, selectedIds, onSelectionChange,
  pagination = false, pageSize = 20,
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey] ?? ''
        const bv = b[sortKey] ?? ''
        const cmp = String(av).localeCompare(String(bv), 'id', { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
    : data

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paged = pagination ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted

  const ids = selectable ? (selectedIds || new Set()) : new Set()
  const allOnPageSelected = selectable && paged.length > 0 && paged.every(r => ids.has(r.id))
  const someSelected = selectable && paged.some(r => ids.has(r.id))

  const toggleAll = () => {
    if (!onSelectionChange) return
    if (allOnPageSelected) {
      const next = new Set(ids)
      paged.forEach(r => next.delete(r.id))
      onSelectionChange(next)
    } else {
      const next = new Set(ids)
      paged.forEach(r => next.add(r.id))
      onSelectionChange(next)
    }
  }

  const toggleRow = (e, id) => {
    e.stopPropagation()
    if (!onSelectionChange) return
    const next = new Set(ids)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'Inter' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1F2937' }}>
              {selectable && (
                <th style={{ padding: '8px 12px', width: 36, background: '#131922', position: 'sticky', top: 0, zIndex: 1 }}>
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    ref={el => { if (el) el.indeterminate = someSelected && !allOnPageSelected }}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer', accentColor: '#3B82F6' }}
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{
                    padding: '8px 12px', textAlign: 'left', color: '#7C8A99',
                    fontWeight: 600, fontSize: 10, letterSpacing: '0.08em',
                    textTransform: 'uppercase', cursor: col.sortable !== false ? 'pointer' : 'default',
                    whiteSpace: 'nowrap', userSelect: 'none',
                    background: '#131922',
                    position: 'sticky', top: 0, zIndex: 1,
                  }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    {col.sortable !== false && (
                      sortKey === col.key
                        ? (sortDir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />)
                        : <ChevronsUpDown size={10} style={{ opacity: 0.4 }} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ padding: '24px', textAlign: 'center', color: '#7C8A99' }}>
                  {emptyText}
                </td>
              </tr>
            ) : paged.map((row, i) => {
              const isSelected = selectable && ids.has(row.id)
              return (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    borderBottom: '1px solid #1F2937',
                    cursor: onRowClick ? 'pointer' : 'default',
                    background: isSelected
                      ? 'rgba(59,130,246,0.08)'
                      : i % 2 === 0 ? 'transparent' : 'rgba(26,34,48,0.3)',
                    transition: 'background 100ms',
                  }}
                  onMouseEnter={e => { if (!isSelected && onRowClick) e.currentTarget.style.background = 'rgba(59,130,246,0.07)' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(26,34,48,0.3)' }}>
                  {selectable && (
                    <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => toggleRow(e, row.id)}
                        onClick={e => e.stopPropagation()}
                        style={{ cursor: 'pointer', accentColor: '#3B82F6' }}
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '8px 12px', color: '#E8EDF2', verticalAlign: 'middle' }}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : col.type === 'severity'
                          ? <SeverityBadge level={row[col.key]} />
                          : col.type === 'mono'
                            ? <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#7C8A99' }}>{row[col.key]}</span>
                            : col.type === 'muted'
                              ? <span style={{ color: '#7C8A99' }}>{row[col.key]}</span>
                              : row[col.key]}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #1F2937' }}>
          <span style={{ fontSize: 11, color: '#4B5563', fontFamily: 'Inter' }}>
            {sorted.length} baris • Halaman {page} dari {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #1F2937', background: page === 1 ? 'transparent' : '#1A2230', color: page === 1 ? '#374151' : '#7C8A99', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: 'Inter' }}>
              ← Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : Math.min(Math.max(page - 2 + i, i + 1), totalPages - (4 - i))
              return (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid ' + (p === page ? '#3B82F6' : '#1F2937'), background: p === page ? 'rgba(59,130,246,0.15)' : 'transparent', color: p === page ? '#3B82F6' : '#7C8A99', cursor: 'pointer', fontSize: 11, fontFamily: 'Inter' }}>
                  {p}
                </button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #1F2937', background: page === totalPages ? 'transparent' : '#1A2230', color: page === totalPages ? '#374151' : '#7C8A99', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: 'Inter' }}>
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

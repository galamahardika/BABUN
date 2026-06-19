import { useState } from 'react'
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'
import SeverityBadge from './SeverityBadge'

export default function DataTable({ columns, data, onRowClick, emptyText = 'Tidak ada data' }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey] ?? ''
        const bv = b[sortKey] ?? ''
        const cmp = String(av).localeCompare(String(bv), 'id', { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
    : data

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'Inter' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1F2937' }}>
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
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '24px', textAlign: 'center', color: '#7C8A99' }}>
                {emptyText}
              </td>
            </tr>
          ) : sorted.map((row, i) => (
            <tr
              key={row.id ?? i}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom: '1px solid #1F2937',
                cursor: onRowClick ? 'pointer' : 'default',
                background: i % 2 === 0 ? 'transparent' : 'rgba(26,34,48,0.3)',
                transition: 'background 100ms',
              }}
              onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = 'rgba(59,130,246,0.07)' }}
              onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(26,34,48,0.3)' }}>
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
          ))}
        </tbody>
      </table>
    </div>
  )
}

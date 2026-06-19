import { useState } from 'react'

// Approximate province center coordinates in a 800x400 viewBox
// Laid out to match rough geographic positions of Indonesia
const PROVINCE_NODES = [
  { id: 'WIL-001', nama: 'Wilayah Simulasi 1',  provinsi: 'Aceh',             cx: 78,  cy: 88,  r: 18 },
  { id: 'WIL-002', nama: 'Wilayah Simulasi 2',  provinsi: 'Sumatera Utara',   cx: 108, cy: 110, r: 17 },
  { id: 'WIL-003', nama: 'Wilayah Simulasi 3',  provinsi: 'Riau',             cx: 145, cy: 148, r: 15 },
  { id: 'WIL-004', nama: 'Wilayah Simulasi 4',  provinsi: 'Jawa Barat',       cx: 255, cy: 208, r: 20 },
  { id: 'WIL-005', nama: 'Wilayah Simulasi 5',  provinsi: 'Jawa Tengah',      cx: 290, cy: 210, r: 18 },
  { id: 'WIL-006', nama: 'Wilayah Simulasi 6',  provinsi: 'DI Yogyakarta',    cx: 308, cy: 216, r: 13 },
  { id: 'WIL-007', nama: 'Wilayah Simulasi 7',  provinsi: 'Jawa Timur',       cx: 332, cy: 210, r: 19 },
  { id: 'WIL-008', nama: 'Wilayah Simulasi 8',  provinsi: 'Sulawesi Selatan', cx: 450, cy: 218, r: 17 },
  { id: 'WIL-009', nama: 'Wilayah Simulasi 9',  provinsi: 'Sulawesi Tengah',  cx: 462, cy: 168, r: 16 },
  { id: 'WIL-010', nama: 'Wilayah Simulasi 10', provinsi: 'Kalimantan Timur', cx: 388, cy: 148, r: 17 },
  { id: 'WIL-011', nama: 'Wilayah Simulasi 11', provinsi: 'Papua',            cx: 640, cy: 200, r: 22 },
  { id: 'WIL-012', nama: 'Wilayah Simulasi 12', provinsi: 'Maluku',           cx: 545, cy: 200, r: 15 },
]

const LEVEL_COLOR = {
  critical: '#EF4444',
  high:     '#F59E0B',
  moderate: '#FACC15',
  low:      '#22C55E',
}

// Simplified Indonesia silhouette — major island groups as rough polygons
const ISLANDS = [
  // Sumatera
  { d: 'M 58 68 L 82 55 L 108 62 L 128 85 L 148 110 L 162 145 L 168 178 L 158 198 L 140 205 L 118 195 L 98 170 L 78 140 L 62 108 Z', label: 'Sumatera' },
  // Jawa
  { d: 'M 218 196 L 240 190 L 270 192 L 310 196 L 345 200 L 362 208 L 355 222 L 335 228 L 295 226 L 258 222 L 228 216 Z', label: 'Jawa' },
  // Kalimantan
  { d: 'M 238 108 L 268 90 L 310 82 L 355 85 L 395 90 L 420 108 L 428 138 L 418 168 L 395 182 L 358 188 L 318 185 L 278 175 L 248 158 L 232 132 Z', label: 'Kalimantan' },
  // Sulawesi (simplified — distinctive orchid shape)
  { d: 'M 438 128 L 460 118 L 478 125 L 485 148 L 478 168 L 462 182 L 448 190 L 438 182 L 432 162 L 435 145 Z', label: 'Sulawesi N' },
  { d: 'M 448 190 L 462 182 L 478 198 L 488 220 L 482 238 L 468 240 L 452 230 L 445 212 Z', label: 'Sulawesi S' },
  { d: 'M 478 168 L 498 162 L 515 168 L 518 182 L 508 190 L 492 188 L 480 180 Z', label: 'Sulawesi E' },
  // Nusa Tenggara
  { d: 'M 355 222 L 375 218 L 395 222 L 408 228 L 405 240 L 385 242 L 365 238 L 352 232 Z', label: 'Bali/NTB' },
  { d: 'M 408 228 L 428 222 L 452 225 L 462 235 L 455 248 L 435 250 L 415 245 Z', label: 'NTT' },
  // Maluku
  { d: 'M 528 168 L 542 162 L 558 168 L 562 185 L 555 198 L 540 202 L 526 195 L 522 180 Z', label: 'Maluku' },
  { d: 'M 540 118 L 552 112 L 562 118 L 560 132 L 548 135 L 536 128 Z', label: 'Maluku Utara' },
  // Papua
  { d: 'M 580 148 L 620 132 L 668 128 L 708 138 L 730 158 L 728 188 L 712 210 L 688 222 L 658 225 L 628 220 L 598 208 L 578 188 L 572 168 Z', label: 'Papua' },
]

export default function IndonesiaMap({ data = {}, markers = [], onProvinceClick, compact = false }) {
  const [hovered, setHovered] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  const getNode = (id) => PROVINCE_NODES.find(n => n.id === id)
  const getColor = (wilayahId) => {
    const d = data[wilayahId]
    if (!d) return '#1F2937'
    return LEVEL_COLOR[d.level] || '#7C8A99'
  }

  const vH = compact ? 280 : 340

  return (
    <div style={{ position: 'relative', width: '100%', background: '#0A0E13', borderRadius: compact ? 0 : 12, overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 800 ${vH}`}
        style={{ width: '100%', display: 'block' }}
        preserveAspectRatio="xMidYMid meet">

        {/* Background grid */}
        <defs>
          <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1F2937" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="node-glow-critical" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="node-glow-high" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <filter id="blur-sm">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        <rect width="800" height={vH} fill="url(#map-grid)" />

        {/* Island silhouettes */}
        {ISLANDS.map((isl, i) => (
          <path key={i} d={isl.d}
                fill="#131922" stroke="#1F2937" strokeWidth="1.5"
                strokeLinejoin="round" />
        ))}

        {/* Risk heat glow behind nodes */}
        {PROVINCE_NODES.map(node => {
          const d = data[node.id]
          if (!d || d.level === 'low') return null
          const color = LEVEL_COLOR[d.level]
          return (
            <circle key={`glow-${node.id}`}
                    cx={node.cx} cy={node.cy} r={node.r * 3.5}
                    fill={color} opacity={0.07} filter="url(#blur-sm)" />
          )
        })}

        {/* Province nodes */}
        {PROVINCE_NODES.map(node => {
          const d = data[node.id]
          const color = getColor(node.id)
          const isHovered = hovered === node.id
          const score = d?.skorRisiko ?? 0
          const fillOpacity = 0.15 + (score / 100) * 0.35

          return (
            <g key={node.id}
               style={{ cursor: 'pointer' }}
               onClick={() => onProvinceClick?.(node.id, d)}
               onMouseEnter={(e) => {
                 setHovered(node.id)
                 setTooltip({ id: node.id, x: node.cx, y: node.cy, ...d })
               }}
               onMouseLeave={() => { setHovered(null); setTooltip(null) }}>
              {/* Outer ring */}
              <circle cx={node.cx} cy={node.cy} r={node.r + (isHovered ? 6 : 3)}
                      fill="none" stroke={color}
                      strokeWidth={isHovered ? 1.5 : 0.8}
                      opacity={isHovered ? 0.6 : 0.3}
                      style={{ transition: 'all 150ms ease' }} />
              {/* Main circle */}
              <circle cx={node.cx} cy={node.cy} r={node.r}
                      fill={color} fillOpacity={fillOpacity}
                      stroke={color} strokeWidth={isHovered ? 2 : 1.5}
                      style={{ transition: 'all 150ms ease' }} />
              {/* Score label */}
              <text x={node.cx} y={node.cy + 1} textAnchor="middle" dominantBaseline="middle"
                    fill={color} fontSize={isHovered ? 10 : 9} fontWeight="700"
                    fontFamily="JetBrains Mono, monospace">
                {score}
              </text>
              {/* ID label below */}
              {isHovered && (
                <text x={node.cx} y={node.cy + node.r + 10} textAnchor="middle"
                      fill={color} fontSize={8} fontFamily="Inter" opacity={0.9}>
                  {node.id}
                </text>
              )}
            </g>
          )
        })}

        {/* Connecting lines for high-risk wilayah */}
        {PROVINCE_NODES.filter(n => data[n.id]?.level === 'critical').map(node => (
          <line key={`line-${node.id}`}
                x1={node.cx} y1={node.cy}
                x2={250} y2={compact ? 240 : 290}
                stroke="#EF4444" strokeWidth="0.5" strokeDasharray="4 3"
                opacity="0.2" />
        ))}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect x={Math.min(tooltip.x - 5, 690)} y={tooltip.y - 52}
                  width={118} height={46} rx={6}
                  fill="#1A2230" stroke="#1F2937" strokeWidth="1" />
            <text x={Math.min(tooltip.x - 5, 690) + 8} y={tooltip.y - 40}
                  fill="#E8EDF2" fontSize={9} fontFamily="Space Grotesk" fontWeight="600">
              {tooltip.nama}
            </text>
            <text x={Math.min(tooltip.x - 5, 690) + 8} y={tooltip.y - 28}
                  fill="#7C8A99" fontSize={8} fontFamily="Inter">
              {tooltip.provinsi}
            </text>
            <text x={Math.min(tooltip.x - 5, 690) + 8} y={tooltip.y - 16}
                  fill={LEVEL_COLOR[tooltip.level] || '#7C8A99'} fontSize={8} fontFamily="JetBrains Mono, monospace" fontWeight="600">
              Skor: {tooltip.skorRisiko} · {tooltip.level?.toUpperCase()}
            </text>
          </g>
        )}

        {/* Scan line animation */}
        <line x1="0" y1="0" x2="800" y2="0" stroke="#22D3D8" strokeWidth="1" opacity="0.06">
          <animate attributeName="y1" values={`0;${vH};0`} dur="8s" repeatCount="indefinite" />
          <animate attributeName="y2" values={`0;${vH};0`} dur="8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.12;0" dur="8s" repeatCount="indefinite" />
        </line>
      </svg>
    </div>
  )
}

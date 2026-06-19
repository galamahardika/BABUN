import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import rawSvg from '../../assets/indonesia-gray.svg?raw'

// Province bounding boxes in the new SVG's 1920×960 coordinate space
// Calibrated from SVG geography: x≈0 → ~92°E, scale ~41.7 px/°; y≈0 → ~10°N, scale ~46 px/°
// box: [xMin, yMin, xMax, yMax]
const PROVINCES = [
  { wilayahId: 'WIL-001', nama: 'Wilayah Simulasi 1',  provinsi: 'Aceh',             box: [  80,  80,  320, 420] },
  { wilayahId: 'WIL-002', nama: 'Wilayah Simulasi 2',  provinsi: 'Sumatera Utara',   box: [ 130, 260,  440, 545] },
  { wilayahId: 'WIL-003', nama: 'Wilayah Simulasi 3',  provinsi: 'Riau',             box: [ 265, 330,  600, 665] },
  { wilayahId: 'WIL-004', nama: 'Wilayah Simulasi 4',  provinsi: 'Jawa Barat',       box: [ 450, 718,  710, 882] },
  { wilayahId: 'WIL-005', nama: 'Wilayah Simulasi 5',  provinsi: 'Jawa Tengah',      box: [ 700, 718,  820, 882] },
  { wilayahId: 'WIL-006', nama: 'Wilayah Simulasi 6',  provinsi: 'D.I. Yogyakarta',  box: [ 790, 800,  848, 882] },
  { wilayahId: 'WIL-007', nama: 'Wilayah Simulasi 7',  provinsi: 'Jawa Timur',       box: [ 818, 712,  978, 882] },
  { wilayahId: 'WIL-008', nama: 'Wilayah Simulasi 8',  provinsi: 'Sulawesi Selatan', box: [1090, 578, 1305, 820] },
  { wilayahId: 'WIL-009', nama: 'Wilayah Simulasi 9',  provinsi: 'Sulawesi Tengah',  box: [1095, 355, 1365, 620] },
  { wilayahId: 'WIL-010', nama: 'Wilayah Simulasi 10', provinsi: 'Kalimantan Timur', box: [ 835, 228, 1160, 610] },
  { wilayahId: 'WIL-011', nama: 'Wilayah Simulasi 11', provinsi: 'Papua',            box: [1575, 355, 1920, 868] },
  { wilayahId: 'WIL-012', nama: 'Wilayah Simulasi 12', provinsi: 'Maluku',           box: [1325, 400, 1690, 808] },
]

const LEVEL_COLOR = {
  critical: '#EF4444',
  high:     '#F59E0B',
  moderate: '#FACC15',
  low:      '#22C55E',
}

const LEVEL_LABEL = {
  critical: 'Kritis',
  high:     'Tinggi',
  moderate: 'Sedang',
  low:      'Rendah',
}

// Inject a CSS block that overrides the SVG's presentation attributes (fill="#919191", stroke="white")
// SVG presentation attributes have lower specificity than stylesheet rules, so this works without !important
const STYLE_BLOCK = `<style>
  .map-path {
    fill: #162031;
    stroke: rgba(255,255,255,0.18);
    stroke-width: 0.5;
    stroke-linecap: round;
    cursor: default;
  }
</style>`

const processedSvg = rawSvg
  .replace(/width="1920"/, 'width="100%"')
  .replace(/height="960"/, 'height="100%"')
  .replace(/<path/g, '<path class="map-path"')
  .replace('</svg>', STYLE_BLOCK + '</svg>')

// Assign a path to a province by checking if its SVG-space centroid falls within any province box.
// When multiple boxes overlap, the closest province center wins.
function findProvince(bbox) {
  const cx = bbox.x + bbox.width  / 2
  const cy = bbox.y + bbox.height / 2
  let best = null
  let bestDist = Infinity
  for (const p of PROVINCES) {
    const [x0, y0, x1, y1] = p.box
    if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) {
      const dist = Math.hypot(cx - (x0 + x1) / 2, cy - (y0 + y1) / 2)
      if (dist < bestDist) { bestDist = dist; best = p }
    }
  }
  return best
}

function applyStyle(path, prov, d, hovered) {
  if (prov && d) {
    const c     = LEVEL_COLOR[d.level] || '#3B82F6'
    const alpha = hovered ? 1 : 0.55 + (d.skorRisiko / 100) * 0.40
    path.style.fill        = c
    path.style.fillOpacity = String(alpha)
    path.style.stroke      = hovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.28)'
    path.style.strokeWidth = hovered ? '1.4' : '0.7'
    path.style.filter      = hovered ? `drop-shadow(0 0 8px ${c}88) brightness(1.25)` : 'none'
    path.style.cursor      = 'pointer'
  } else if (prov) {
    path.style.fill        = hovered ? '#3E6080' : '#2E4F6B'
    path.style.fillOpacity = '1'
    path.style.stroke      = hovered ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)'
    path.style.strokeWidth = hovered ? '1.0' : '0.5'
    path.style.filter      = 'none'
    path.style.cursor      = 'default'
  } else {
    // Small islands or areas outside all province boxes — unmonitored dark base
    path.style.fill        = '#162031'
    path.style.fillOpacity = '1'
    path.style.stroke      = 'rgba(255,255,255,0.1)'
    path.style.strokeWidth = '0.3'
    path.style.filter      = 'none'
    path.style.cursor      = 'default'
  }
}

export default function IndonesiaMap({ data = {}, onProvinceClick, compact = false }) {
  const containerRef = useRef(null)
  const pathMap      = useRef(new Map())   // DOM path el → province | null
  const hoveredElRef = useRef(null)
  const dataRef      = useRef(data)

  const [hoveredProv, setHoveredProv] = useState(null)
  const [mouse, setMouse]             = useState(null)

  // Keep dataRef in sync so event handlers always see current data without re-registering
  useEffect(() => { dataRef.current = data }, [data])

  // After mount: assign each path to a province using getBBox() (returns SVG-space coords).
  // useLayoutEffect fires synchronously after DOM mutations — getBBox() is valid here
  // because it reads layout, not paint; no rAF needed.
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const svg = container.querySelector('svg[viewBox="0 0 1920 960"]')
      || container.querySelector('svg')
    if (!svg) return

    pathMap.current.clear()
    svg.querySelectorAll('path.map-path').forEach(path => {
      let bbox
      try { bbox = path.getBBox() } catch { return }
      if (!bbox || (bbox.width === 0 && bbox.height === 0)) return
      const prov = findProvince(bbox)
      pathMap.current.set(path, prov || null)
      if (prov) path.dataset.wid = prov.wilayahId
      applyStyle(path, prov, prov ? dataRef.current[prov.wilayahId] : null, false)
    })
  }, []) // mount only

  // Re-color when risk data changes, skip the currently hovered path
  useEffect(() => {
    pathMap.current.forEach((prov, path) => {
      if (path === hoveredElRef.current) return
      applyStyle(path, prov, prov ? data[prov.wilayahId] : null, false)
    })
  }, [data])

  // Event delegation — one set of listeners on the container
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onMove = (e) => {
      const rect = container.getBoundingClientRect()
      setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top })

      const path = e.target.closest?.('path.map-path')
      if (path === hoveredElRef.current) return

      // Restore previous hovered path
      if (hoveredElRef.current) {
        const prev  = hoveredElRef.current
        const pProv = pathMap.current.get(prev)
        applyStyle(prev, pProv, pProv ? dataRef.current[pProv.wilayahId] : null, false)
      }

      hoveredElRef.current = path || null
      if (path) {
        const prov = pathMap.current.get(path)
        applyStyle(path, prov, prov ? dataRef.current[prov.wilayahId] : null, true)
        setHoveredProv(prov || null)
      } else {
        setHoveredProv(null)
      }
    }

    const onLeave = () => {
      if (hoveredElRef.current) {
        const prev  = hoveredElRef.current
        const prov  = pathMap.current.get(prev)
        applyStyle(prev, prov, prov ? dataRef.current[prov.wilayahId] : null, false)
        hoveredElRef.current = null
      }
      setHoveredProv(null)
      setMouse(null)
    }

    const onClick = (e) => {
      if (!onProvinceClick) return
      const path = e.target.closest?.('path.map-path')
      if (!path) return
      const prov = pathMap.current.get(path)
      if (prov) onProvinceClick(prov.wilayahId, dataRef.current[prov.wilayahId])
    }

    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseleave', onLeave)
    container.addEventListener('click', onClick)
    return () => {
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
      container.removeEventListener('click', onClick)
    }
  }, [onProvinceClick])

  // Keep tooltip inside the map container
  const tooltipW  = 210
  const containerW = containerRef.current?.offsetWidth || 900
  const tipX = mouse
    ? (mouse.x + 16 + tooltipW > containerW ? mouse.x - tooltipW - 16 : mouse.x + 16)
    : 0
  const tipY = mouse ? Math.max(mouse.y - 76, 6) : 0

  const wilayahData = hoveredProv ? data[hoveredProv.wilayahId] : null

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      background: '#0D1520',
      borderRadius: compact ? 0 : 12,
      overflow: 'hidden',
      lineHeight: 0,
    }}>
      {/* SVG map — dangerouslySetInnerHTML injects the processed SVG string */}
      <div
        ref={containerRef}
        style={{ width: '100%', position: 'relative', zIndex: 1 }}
        dangerouslySetInnerHTML={{ __html: processedSvg }}
      />

      {/* Tooltip */}
      {mouse && hoveredProv && (
        <div style={{
          position: 'absolute',
          left: tipX, top: tipY,
          zIndex: 20, pointerEvents: 'none',
          background: '#1A2230',
          border: `1px solid ${wilayahData ? LEVEL_COLOR[wilayahData.level] + '66' : '#1F2937'}`,
          borderRadius: 8,
          padding: '8px 12px',
          minWidth: 195,
          boxShadow: '0 6px 24px rgba(0,0,0,0.6)',
        }}>
          <p style={{ color: '#E8EDF2', fontSize: 11, fontWeight: 700, margin: '0 0 2px', fontFamily: 'Space Grotesk' }}>
            {hoveredProv.nama}
          </p>
          <p style={{ color: '#7C8A99', fontSize: 10, margin: '0 0 8px', fontFamily: 'Inter' }}>
            {hoveredProv.provinsi}
          </p>
          {wilayahData ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ color: '#7C8A99', fontSize: 10 }}>Skor Risiko</span>
                <span style={{ color: LEVEL_COLOR[wilayahData.level], fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                  {wilayahData.skorRisiko}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ color: '#7C8A99', fontSize: 10 }}>Level</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, fontFamily: 'Inter',
                  color: LEVEL_COLOR[wilayahData.level],
                  background: LEVEL_COLOR[wilayahData.level] + '22',
                  padding: '1px 7px', borderRadius: 4,
                }}>
                  {LEVEL_LABEL[wilayahData.level]}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#7C8A99', fontSize: 10 }}>ID Wilayah</span>
                <span style={{ color: '#3B82F6', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>
                  {hoveredProv.wilayahId}
                </span>
              </div>
              {onProvinceClick && (
                <p style={{ color: '#3B82F6', fontSize: 9, marginTop: 6, opacity: 0.6 }}>
                  Klik untuk detail →
                </p>
              )}
            </>
          ) : (
            <p style={{ color: '#4B5563', fontSize: 10, margin: 0, fontStyle: 'italic' }}>
              Tidak ada data monitoring
            </p>
          )}
        </div>
      )}

      {/* Legend — hidden in compact mode */}
      {!compact && (
        <div style={{
          position: 'absolute', bottom: 10, left: 12,
          display: 'flex', gap: 10, flexWrap: 'wrap',
          zIndex: 10, pointerEvents: 'none',
        }}>
          {[
            { label: 'Kritis',        color: '#EF4444' },
            { label: 'Tinggi',        color: '#F59E0B' },
            { label: 'Sedang',        color: '#FACC15' },
            { label: 'Rendah',        color: '#22C55E' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: 'inline-block' }} />
              <span style={{ color: '#7C8A99', fontSize: 9, fontFamily: 'Inter' }}>{l.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#2E4F6B', border: '1px solid rgba(255,255,255,0.18)', display: 'inline-block' }} />
            <span style={{ color: '#7C8A99', fontSize: 9, fontFamily: 'Inter' }}>Tidak Dipantau</span>
          </div>
        </div>
      )}
    </div>
  )
}

import { createContext, useContext, useState } from 'react'
import rekomendasiAwal from '../data/rekomendasi.json'

const DSSContext = createContext(null)

export function DSSProvider({ children }) {
  const [rekomendasi, setRekomendasi] = useState(rekomendasiAwal)

  const tambahRekomendasi = (rec) => {
    setRekomendasi(prev => [rec, ...prev])
  }

  const updateStatus = (id, status, alasan) => {
    setRekomendasi(prev => prev.map(r =>
      r.id === id ? { ...r, status, ...(alasan ? { alasanTolak: alasan } : {}) } : r
    ))
  }

  return (
    <DSSContext.Provider value={{ rekomendasi, tambahRekomendasi, updateStatus }}>
      {children}
    </DSSContext.Provider>
  )
}

export const useDSS = () => useContext(DSSContext)

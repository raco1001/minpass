import { useMemo, useState, type PropsWithChildren } from 'react';
import { Ctx, useToast } from '../hooks/useToast';


export type Toast = { id: number; text: string; type?: 'info' | 'error' | 'success' }


export function ToastProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<Toast[]>([])
  const api = useMemo<ReturnType<typeof useToast>>(() => ({
    push: (text, type = 'info') => {
      const id = Date.now() + Math.random()
      setItems((list) => [...list, { id, text, type }])
      setTimeout(() => setItems((list) => list.filter(t => t.id !== id)), 3000)
    },
  }), [])


  return (
    <Ctx.Provider value={api}>
      {children}
      <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'grid', gap: 8, zIndex: 9999 }}>
        {items.map(t => (
          <div key={t.id} style={{
            padding: '10px 12px', borderRadius: 10, minWidth: 220,
            background: t.type === 'error' ? '#3b0a0a' : t.type === 'success' ? '#0a3b18' : '#1f2937',
            color: 'white', boxShadow: '0 2px 12px rgba(0,0,0,.3)'
          }}>
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
import { createContext, useContext } from "react"
import { type Toast } from "../providers/toast"

type ToastCtx = {
  push: (text: string, type?: Toast['type']) => void
}


export const Ctx = createContext<ToastCtx | null>(null)


export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('ToastProvider missing')
  return ctx
}

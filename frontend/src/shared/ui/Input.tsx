import { type InputHTMLAttributes } from 'react'


export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={{
      padding: '8px 10px', borderRadius: 8, border: '1px solid #999', width: '100%'
    }} />
  )
}
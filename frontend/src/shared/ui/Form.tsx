import { type FormHTMLAttributes } from 'react'


export function Form(props: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form {...props} style={{ display: 'grid', gap: 8, width: 320 }} />
  )
}
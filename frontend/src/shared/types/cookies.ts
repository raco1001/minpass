export function readCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='))?.split('=')[1]
}
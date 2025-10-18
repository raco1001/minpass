import fg from 'fast-glob'
import matter from 'gray-matter'
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const ADR_BASE = path.join(ROOT, 'docs', 'architecture')
const ADR_DIR = path.join(ADR_BASE, 'decision-logs') // ✅ 변경
const INDEX_PATH = path.join(ADR_BASE, 'INDEX.md')
const CONFIG_PATH = path.join(ADR_BASE, 'adl.config.json')

// --------- defaults ---------
const DEFAULTS = {
  sort: 'updated', // 'created' | 'updated' | 'title' | 'id' | 'status'
  order: 'desc', // 'asc' | 'desc'
  group: 'status', // 'none' | 'status'
  statusOrder: ['Proposed', 'Accepted', 'Deprecated', 'Superseded'],
  indexTitle: 'Decision Records Index',
  note: 'Auto-generated. Do not edit manually — run `pnpm adl:index`.',
}

// --------- tiny arg parser: --key=value ---------
const argv = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((s) => s.startsWith('--'))
    .map((s) => {
      const [, key, val] = s.match(/^--([^=]+)=(.*)$/) || []
      return [key, val ?? '']
    }),
)

async function readConfig() {
  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function ownersToText(owners) {
  return Array.isArray(owners) ? owners.join(', ') : owners || ''
}
function toISODate(v) {
  if (!v) return ''
  const d = new Date(v)
  if (isNaN(d)) return String(v)
  return d.toISOString().slice(0, 10)
}
function byKey(key, order = 'asc') {
  const mul = order === 'desc' ? -1 : 1
  return (a, b) => {
    const va = (a[key] ?? '').toString().toLowerCase()
    const vb = (b[key] ?? '').toString().toLowerCase()
    if (va < vb) return -1 * mul
    if (va > vb) return 1 * mul
    return 0
  }
}
function statusRanker(orderList) {
  const idx = new Map(orderList.map((s, i) => [s.toLowerCase(), i]))
  return (s) =>
    idx.has(s.toLowerCase())
      ? idx.get(s.toLowerCase())
      : Number.MAX_SAFE_INTEGER
}
function tableHeader() {
  return `| ID | Title | Status | Owner | Created | Last Updated | Notes |
|---:|-------|--------|-------|---------|--------------|-------|
`
}
function tableRows(rows) {
  return rows
    .map(
      (r) =>
        `| [${r.id}](${encodeURI('decision-logs/' + r.filename)}) | ${r.title} | ${r.status} | ${r.owners} | ${r.created} | ${r.updated} | ${r.notes} |`,
    )
    .join('\n')
}

const cfg = { ...DEFAULTS, ...(await readConfig()) }
// CLI overrides
if (argv.sort) cfg.sort = argv.sort
if (argv.order) cfg.order = argv.order
if (argv.group) cfg.group = argv.group

// read DR files (supports nested folders under decision-logs)
const files = await fg('**/DR-*.md', {
  cwd: ADR_DIR,
  absolute: true,
  onlyFiles: true,
  ignore: ['**/INDEX.md', '**/TEMPLATE*.md'],
})

const records = []
for (const abs of files) {
  const raw = await fs.readFile(abs, 'utf8')
  const { data } = matter(raw)
  const filename = path.relative(ADR_DIR, abs) // keep subdir in path

  const rec = {
    id: data.id ?? filename.replace(/\.md$/, ''),
    title: data.title ?? '(no title)',
    status: data.status ?? 'Proposed',
    owners: ownersToText(data.owners),
    created: toISODate(data.created),
    updated: toISODate(data.updated || data.created),
    notes: (data.notes ?? '').toString().trim(),
    filename,
  }
  records.push(rec)
}

// sorting
if (cfg.sort === 'status') {
  const rank = statusRanker(cfg.statusOrder)
  records.sort((a, b) => {
    const ra = rank(a.status),
      rb = rank(b.status)
    if (ra !== rb) return (ra - rb) * (cfg.order === 'desc' ? -1 : 1)
    return byKey('updated', 'desc')(a, b) // tie-breaker
  })
} else {
  records.sort(byKey(cfg.sort, cfg.order))
}

// render
let out = `# ${cfg.indexTitle}\n\n> ${cfg.note}\n\n`

if (cfg.group === 'status') {
  const rank = statusRanker(cfg.statusOrder)
  const groups = new Map()
  for (const r of records) {
    const key = r.status
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(r)
  }
  const statuses = [...groups.keys()].sort((a, b) => rank(a) - rank(b))
  for (const st of statuses) {
    out += `## ${st}\n\n`
    out += tableHeader()
    out += tableRows(groups.get(st)) + '\n\n'
  }
} else {
  out += tableHeader()
  out += tableRows(records) + '\n'
}

await fs.writeFile(INDEX_PATH, out, 'utf8')
console.log(
  `[OK] Wrote ${path.relative(ROOT, INDEX_PATH)} with ${records.length} records`,
)

import dynamic from "next/dynamic"

const FieldSelectorMap = dynamic(() => import("./field-selector-map"), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center"
      style={{ height: 320 }}
    >
      <p className="text-sm text-slate-400">Loading map…</p>
    </div>
  ),
})

export default FieldSelectorMap

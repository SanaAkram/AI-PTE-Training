import type { DescribeImagePayload } from "@/lib/types";

const COLORS = ["#de8b2a", "#2f6f62", "#c43d4f", "#6b5d45", "#b5651d", "#59b39f"];

/** Renders the four DescribeImage data shapes honestly with plain CSS/SVG — no external chart lib. */
export function SimpleChart({ payload }: { payload: DescribeImagePayload }) {
  const { imageType, imageTitle, imageData } = payload;

  if ((imageType === "bar" || imageType === "line" || imageType === "table") && !Array.isArray(imageData)) {
    const entries = Object.entries(imageData as Record<string, number>);
    const max = Math.max(...entries.map(([, v]) => v), 1);

    if (imageType === "table") {
      return (
        <figure className="w-full">
          <figcaption className="text-center font-display font-bold mb-2">{imageTitle}</figcaption>
          <table className="w-full text-sm border-collapse" dir="ltr">
            <tbody>
              {entries.map(([label, value]) => (
                <tr key={label} className="border-b border-line">
                  <td className="py-2 pr-3 text-ink-soft">{label}</td>
                  <td className="py-2 text-right font-bold tabular-nums">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      );
    }

    if (imageType === "bar") {
      return (
        <figure className="w-full">
          <figcaption className="text-center font-display font-bold mb-3">{imageTitle}</figcaption>
          <div className="flex items-end gap-3 h-40" dir="ltr">
            {entries.map(([label, value], i) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold tabular-nums">{value}</span>
                <div
                  className="w-full rounded-t-md"
                  style={{ height: `${(value / max) * 100}%`, background: COLORS[i % COLORS.length] }}
                />
                <span className="text-[0.65rem] text-ink-soft text-center">{label}</span>
              </div>
            ))}
          </div>
        </figure>
      );
    }

    // line
    const w = 280;
    const h = 140;
    const stepX = entries.length > 1 ? w / (entries.length - 1) : 0;
    const points = entries.map(([, value], i) => {
      const x = i * stepX;
      const y = h - (value / max) * (h - 20) - 10;
      return `${x},${y}`;
    });
    return (
      <figure className="w-full">
        <figcaption className="text-center font-display font-bold mb-3">{imageTitle}</figcaption>
        <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full">
          <polyline points={points.join(" ")} fill="none" stroke="#de8b2a" strokeWidth={3} />
          {entries.map(([label, value], i) => (
            <g key={label}>
              <circle cx={i * stepX} cy={h - (value / max) * (h - 20) - 10} r={4} fill="#b5651d" />
              <text x={i * stepX} y={h + 15} fontSize={9} textAnchor="middle" fill="var(--ink-soft)">
                {label}
              </text>
            </g>
          ))}
        </svg>
      </figure>
    );
  }

  if (imageType === "pie" && !Array.isArray(imageData)) {
    const entries = Object.entries(imageData as Record<string, number>);
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
    let acc = 0;
    const stops = entries.map(([, v], i) => {
      const start = (acc / total) * 100;
      acc += v;
      const end = (acc / total) * 100;
      return `${COLORS[i % COLORS.length]} ${start}% ${end}%`;
    });
    return (
      <figure className="w-full flex flex-col items-center gap-4">
        <figcaption className="text-center font-display font-bold">{imageTitle}</figcaption>
        <div
          className="w-36 h-36 rounded-full"
          style={{ background: `conic-gradient(${stops.join(", ")})` }}
        />
        <ul className="text-xs flex flex-wrap gap-x-4 gap-y-1 justify-center">
          {entries.map(([label, value], i) => (
            <li key={label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
              {label} ({value})
            </li>
          ))}
        </ul>
      </figure>
    );
  }

  // process / map: an ordered string[]
  const steps = imageData as string[];
  return (
    <figure className="w-full">
      <figcaption className="text-center font-display font-bold mb-3">{imageTitle}</figcaption>
      <ol className="flex flex-col gap-2" dir="ltr">
        {steps.map((step, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="w-6 h-6 rounded-full bg-surface-alt border border-line flex items-center justify-center text-xs font-bold shrink-0">
              {i + 1}
            </span>
            {step}
            {i < steps.length - 1 && <span className="text-ink-soft">→</span>}
          </li>
        ))}
      </ol>
    </figure>
  );
}

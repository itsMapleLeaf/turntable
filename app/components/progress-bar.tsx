export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-px w-full bg-white/25">
      <svg className="h-8 w-full -translate-y-1/2">
        <filter id="glow" x="-1500%" y="-1500%" width="3000%" height="3000%">
          <feGaussianBlur stdDeviation={4} edgeMode="duplicate" />
        </filter>
        <rect
          x={0}
          y="50%"
          width={`${progress * 100}%`}
          height={1}
          strokeWidth={4}
          className="stroke-accent-500/75 transition-[width] ease-linear"
          vectorEffect="non-scaling-stroke"
          filter="url(#glow)"
        />
        <rect
          x={0}
          y="50%"
          width={`${progress * 100}%`}
          height={1}
          shapeRendering="crispEdges"
          className="fill-accent-300 transition-[width] ease-linear"
        />
      </svg>
    </div>
  )
}

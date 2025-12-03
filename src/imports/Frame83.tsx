import svgPaths from "./svg-89jdflwspb";

export default function Frame() {
  return (
    <div className="relative size-full">
      <div className="absolute inset-[-7.14%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 80">
          <g filter="url(#filter0_d_1_709)" id="Frame 83">
            <rect fill="var(--fill-0, #21DBA4)" height="70" rx="35" shapeRendering="crispEdges" width="70" x="5" y="5" />
            <path d={svgPaths.p3b0eb800} fill="var(--fill-0, white)" id="Vector (Stroke)" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="80" id="filter0_d_1_709" width="80" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset />
              <feGaussianBlur stdDeviation="2.5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_709" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_709" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}
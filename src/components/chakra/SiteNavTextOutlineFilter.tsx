/** 供当前导航项文字 `filter: url(#site-nav-active-text-outline)` 引用的 SVG 滤镜（白底描边）。 */
export function SiteNavTextOutlineFilter() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter
          id="site-nav-active-text-outline"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          colorInterpolationFilters="sRGB"
        >
          <feMorphology in="SourceAlpha" operator="dilate" radius="1.25" result="stroke" />
          <feFlood floodColor="var(--site-bg)" result="flood" />
          <feComposite in="flood" in2="stroke" operator="in" result="outline" />
          <feMerge>
            <feMergeNode in="outline" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}

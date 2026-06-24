/**
 * خط نبض القلب المتحرك - العنصر البصري المميز للـ Landing Page
 * بيرسم نفسه أول ما الصفحة تفتح، وبعدين فيه نقطة ضوء بتجري على طول الخط بشكل مستمر
 * مرتبط بمعنى بصري حقيقي لاسم وأيقونة المنتج (monitor_heart)
 */
export default function HeartbeatLine({ className = '', color = 'var(--color-primary)', glow = true }) {
    // مسار نبضة قلب حقيقية: خط مستوي - ارتفاع صغير - انخفاض حاد - قمة عالية - رجوع - خط مستوي
    const path = "M0,40 L60,40 L80,40 L95,15 L115,65 L130,5 L145,40 L170,40 L190,30 L205,40 L400,40 L420,40 L440,15 L455,65 L470,5 L485,40 L510,40 L530,30 L545,40 L740,40 L760,40 L780,15 L795,65 L810,5 L825,40 L850,40 L870,30 L885,40 L1080,40"

    return (
        <svg
            className={className}
            viewBox="0 0 1080 80"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="ecg-fade" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={color} stopOpacity="0" />
                    <stop offset="8%" stopColor={color} stopOpacity="1" />
                    <stop offset="92%" stopColor={color} stopOpacity="1" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
                {glow && (
                    <filter id="ecg-glow" x="-20%" y="-200%" width="140%" height="500%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                )}
            </defs>

            {/* الخط الأساسي بيترسم لوحده */}
            <path
                d={path}
                fill="none"
                stroke="url(#ecg-fade)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength="1"
                className="ecg-draw"
                filter={glow ? 'url(#ecg-glow)' : undefined}
            />

            {/* نقطة الضوء اللي بتجري على طول الخط بعد ما يترسم */}
            <circle r="5" fill={color} className="ecg-pulse-dot" filter={glow ? 'url(#ecg-glow)' : undefined}>
                <animateMotion
                    dur="3.2s"
                    repeatCount="indefinite"
                    path={path}
                    begin="1.6s"
                    rotate="auto"
                />
                <animate
                    attributeName="opacity"
                    values="0;0;1;1;0"
                    keyTimes="0;0.02;0.06;0.94;1"
                    dur="3.2s"
                    repeatCount="indefinite"
                    begin="1.6s"
                />
            </circle>
        </svg>
    )
}

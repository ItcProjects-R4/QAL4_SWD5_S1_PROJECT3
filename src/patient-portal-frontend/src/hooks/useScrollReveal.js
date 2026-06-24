import { useEffect, useRef } from 'react'

/**
 * بيرجع ref تحطه على أي عنصر، وأول ما العنصر يدخل في viewport
 * بيضيف class "in-view" عليه (شغال مع .lp-reveal / .lp-reveal-scale في index.css)
 */
export function useScrollReveal(options = {}) {
    const ref = useRef(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        // لو الموتور مدعوم، فعّله؛ لو مش مدعوم (متصفح قديم جداً) اعرض العنصر على طول
        if (typeof IntersectionObserver === 'undefined') {
            el.classList.add('in-view')
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view')
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.15, rootMargin: '0px 0px -60px 0px', ...options }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return ref
}

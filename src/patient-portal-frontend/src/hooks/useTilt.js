import { useRef } from 'react'

/**
 * بيرجع ref + handlers تحطهم على أي كارت عشان يعمل "tilt" خفيف
 * بيتبع حركة الماوس جوه الكارت - إحساس "magnetic" بدون أي مكتبة خارجية
 */
export function useTilt(strength = 10) {
    const ref = useRef(null)

    const onMouseMove = (e) => {
        const el = ref.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        el.style.transform = `perspective(800px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg) translateY(-4px)`
    }

    const onMouseLeave = () => {
        const el = ref.current
        if (!el) return
        el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)'
    }

    return { ref, onMouseMove, onMouseLeave }
}

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * React Router (زي أي SPA) مايعملش scroll-to-top أوتوماتيك لما تتنقل بين الصفحات
 * المتصفح بيفتكر آخر مكان كنت فيه في السكرول ويفضل عليه حتى بعد تغيير الصفحة
 * الكومبوننت ده بيتظبط مرة واحدة في App.jsx وبيراقب تغيير الـ route،
 * وكل ما الـ pathname يتغير، يرجع السكرول لفوق فوراً
 */
export default function ScrollToTop() {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return null
}

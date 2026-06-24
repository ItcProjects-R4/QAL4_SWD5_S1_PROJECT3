import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5238',
})

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

/**
 * ✅ نظام auto-refresh للتوكن
 * الباك إند بتاعنا بيخلي الـ accessToken عمره 15 دقيقة بس (AccessTokenExpiryMinutes: 15 في appsettings.json)
 * يعني أي مستخدم سايب الصفحة مفتوحة (مثلاً واقف يفكر في حجز) لمدة أكتر من 15 دقيقة
 * كان هيترمي بره فوراً على /login من غير أي تحذير لما يحاول يعمل أي request.
 *
 * دلوقتي: أول ما نلاقي 401، نحاول نستخدم الـ refreshToken المخزن عشان نجيب accessToken جديد
 * من /api/portal/auth/refresh، وبعدين نعيد الـ request الأصلي تلقائياً - المستخدم مش هيحس بأي حاجة.
 * لو الـ refresh نفسه فشل (يعني الـ refresh token كمان باطل أو خلص الـ 30 يوم بتاعته)،
 * ساعتها بس نعمل logout حقيقي.
 */

let isRefreshing = false
let refreshSubscribers = []   // طابور الـ requests اللي واخدة 401 وقت ما الـ refresh شغال

function onRefreshed(newToken) {
    refreshSubscribers.forEach((callback) => callback(newToken))
    refreshSubscribers = []
}

function redirectToLogin() {
    localStorage.clear()
    // ✅ نحفظ مكان المستخدم عشان لو عايز نرجعه بعد ما يسجل دخول تاني (اختياري، الصفحة بتقرأها لو عايزة)
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
    window.location.href = '/login'
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // مش 401، أو already retried، أو دي request الـ refresh نفسها اللي فشلت → سيبها تكمل تتعامل عادي
        if (
            error.response?.status !== 401 ||
            originalRequest._retry ||
            originalRequest.url?.includes('/api/portal/auth/refresh')
        ) {
            return Promise.reject(error)
        }

        const refreshToken = localStorage.getItem('refreshToken')

        // مفيش refresh token خالص (مثلاً المستخدم مسجلش دخول من الأساس) → logout مباشرة
        if (!refreshToken) {
            redirectToLogin()
            return Promise.reject(error)
        }

        originalRequest._retry = true

        // ✅ لو فيه أكتر من request وقعوا في 401 في نفس الوقت، منعملش أكتر من refresh call واحدة
        // الباقي بينتظر في الطابور وبعدين كلهم بيتعادوا بالتوكن الجديد لما يجي
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                refreshSubscribers.push((newToken) => {
                    if (newToken) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`
                        resolve(api(originalRequest))
                    } else {
                        reject(error)
                    }
                })
            })
        }

        isRefreshing = true

        try {
            const res = await axios.post(
                `${api.defaults.baseURL}/api/portal/auth/refresh`,
                { refreshToken }
            )
            const newAccessToken = res.data?.data?.accessToken
            const newRefreshToken = res.data?.data?.refreshToken

            if (!newAccessToken) throw new Error('No access token in refresh response')

            localStorage.setItem('accessToken', newAccessToken)
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken)

            isRefreshing = false
            onRefreshed(newAccessToken)

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return api(originalRequest)
        } catch (refreshError) {
            isRefreshing = false
            onRefreshed(null)
            redirectToLogin()
            return Promise.reject(refreshError)
        }
    }
)

export default api

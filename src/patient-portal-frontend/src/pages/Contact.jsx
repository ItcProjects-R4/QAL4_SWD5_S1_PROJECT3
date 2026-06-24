import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const FAQS = [
    {
        q: 'How do I book an appointment?',
        a: 'Go to "Find a Clinic", choose a clinic, pick a doctor, select an available date and time slot, then confirm. You\'ll see your appointment immediately under "My Bookings".',
    },
    {
        q: 'Why didn\'t I receive my OTP code?',
        a: 'OTP delivery can occasionally be delayed by a few minutes depending on your carrier. If it doesn\'t arrive, use the "Resend OTP" button on the verification screen. Make sure the phone number you entered is correct and able to receive SMS.',
    },
    {
        q: 'Can I cancel or reschedule an appointment?',
        a: 'You can cancel an upcoming appointment anytime from the "My Bookings" page. To reschedule, cancel the existing booking and create a new one for your preferred time.',
    },
    {
        q: 'I forgot my password. What should I do?',
        a: 'On the Login page, tap "Forgot Password?" and enter your registered phone number. We\'ll send you a verification code to set a new password.',
    },
    {
        q: 'Is my personal and medical information safe?',
        a: 'Yes. We use encrypted password storage and secure authentication tokens, and only share your booking details with the specific clinic you book with. See our Privacy Policy for full details.',
    },
]

export default function Contact() {
    const [openFaq, setOpenFaq] = useState(null)
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [sent, setSent] = useState(false)

    const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

    const validate = () => {
        const e = {}
        if (form.name.trim().length < 2) e.name = 'Please enter your name'
        if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Please enter a valid email'
        if (form.subject.trim().length < 3) e.subject = 'Please enter a subject'
        if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async (ev) => {
        ev.preventDefault()
        if (!validate()) return
        setSubmitting(true)
        // ✅ مفيش endpoint حقيقي للـ contact form دلوقتي - بنحاكي الإرسال محلياً
        // لو عايز تربطه بباك إند حقيقي بعدين، استبدل الجزء ده بـ api.post('/api/portal/support/contact', form)
        await new Promise(r => setTimeout(r, 900))
        setSubmitting(false)
        setSent(true)
        setForm({ name: '', email: '', subject: '', message: '' })
    }

    const fieldCls = (k) =>
        `w-full px-4 py-3 border rounded-xl bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-1 transition-colors ${errors[k]
            ? 'border-error focus:border-error focus:ring-error'
            : 'border-outline-variant focus:border-primary focus:ring-primary'
        }`

    return (
        <div className="bg-background min-h-screen flex flex-col text-on-surface page-enter">
            <Navbar />

            <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 md:px-8 py-16">
                {/* Header */}
                <div className="text-center mb-16 fade-up">
                    <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-6 scale-in">
                        <span className="material-symbols-outlined text-on-primary text-[32px]">support_agent</span>
                    </div>
                    <h1 className="font-bold text-display-lg text-on-surface mb-3">Contact Support</h1>
                    <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto">
                        Have a question or ran into an issue? We're here to help.
                    </p>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {[
                        { icon: 'mail', title: 'Email Us', value: 'sehhatech.team@gmail.com', href: 'mailto:sehhatech.team@gmail.com' },
                        { icon: 'call', title: 'Call Us', value: '+20 10 2331 8978', href: 'tel:+201023318978' },
                        { icon: 'schedule', title: 'Support Hours', value: 'Sun – Thu, 9 AM – 6 PM (Cairo time)', href: null },
                    ].map((c, i) => (
                        <a
                            key={c.title}
                            href={c.href || undefined}
                            className={`card-hover bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center fade-up ${c.href ? 'cursor-pointer' : 'cursor-default'}`}
                            style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                        >
                            <div className="w-14 h-14 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-primary icon-pop">
                                <span className="material-symbols-outlined text-[26px]">{c.icon}</span>
                            </div>
                            <h3 className="font-semibold text-headline-md text-on-surface mb-1">{c.title}</h3>
                            <p className="text-body-md text-on-surface-variant">{c.value}</p>
                        </a>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Contact form */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-10 fade-up" style={{ animationDelay: '.3s' }}>
                        {sent ? (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-success-container rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                    <span className="absolute inset-0 rounded-full bg-success ring-expand" />
                                    <span className="material-symbols-outlined text-success text-[32px] check-pop">check_circle</span>
                                </div>
                                <h2 className="font-semibold text-headline-md text-on-surface mb-1">Message Sent!</h2>
                                <p className="text-body-md text-on-surface-variant mb-8">
                                    Thanks for reaching out. Our support team will get back to you within 1–2 business days.
                                </p>
                                <button
                                    onClick={() => setSent(false)}
                                    className="btn-press bg-surface-container text-on-surface font-medium text-label-md px-6 py-3 rounded-xl hover:bg-surface-container-high transition-colors"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="font-semibold text-headline-lg text-on-surface mb-1">Send us a message</h2>
                                <p className="text-body-md text-on-surface-variant mb-6">We typically respond within one business day.</p>

                                <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="flex flex-col gap-1">
                                            <label className="font-medium text-label-md text-on-surface" htmlFor="name">
                                                Name <span className="text-error">*</span>
                                            </label>
                                            <input id="name" value={form.name} onChange={set('name')} placeholder="Your name" className={fieldCls('name')} />
                                            {errors.name && <p className="text-label-sm text-error fade-in">{errors.name}</p>}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="font-medium text-label-md text-on-surface" htmlFor="email">
                                                Email <span className="text-error">*</span>
                                            </label>
                                            <input id="email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={fieldCls('email')} />
                                            {errors.email && <p className="text-label-sm text-error fade-in">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="font-medium text-label-md text-on-surface" htmlFor="subject">
                                            Subject <span className="text-error">*</span>
                                        </label>
                                        <input id="subject" value={form.subject} onChange={set('subject')} placeholder="What's this about?" className={fieldCls('subject')} />
                                        {errors.subject && <p className="text-label-sm text-error fade-in">{errors.subject}</p>}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="font-medium text-label-md text-on-surface" htmlFor="message">
                                            Message <span className="text-error">*</span>
                                        </label>
                                        <textarea
                                            id="message" rows={5} value={form.message} onChange={set('message')}
                                            placeholder="Tell us more about your issue or question..."
                                            className={fieldCls('message') + ' resize-none'}
                                        />
                                        {errors.message && <p className="text-label-sm text-error fade-in">{errors.message}</p>}
                                    </div>

                                    <button
                                        type="submit" disabled={submitting}
                                        className="btn-press bg-primary text-on-primary font-medium text-label-md py-3 rounded-xl hover:bg-primary-container transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="material-symbols-outlined text-[18px] spinner">progress_activity</span>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-[18px]">send</span>
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                    {/* FAQ accordion */}
                    <div className="fade-up" style={{ animationDelay: '.4s' }}>
                        <h2 className="font-semibold text-headline-lg text-on-surface mb-1">Frequently Asked Questions</h2>
                        <p className="text-body-md text-on-surface-variant mb-6">Quick answers to common questions.</p>

                        <div className="flex flex-col gap-3">
                            {FAQS.map((f, i) => {
                                const isOpen = openFaq === i
                                return (
                                    <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setOpenFaq(isOpen ? null : i)}
                                            className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-surface-container-low transition-colors"
                                            aria-expanded={isOpen}
                                        >
                                            <span className="font-medium text-body-md text-on-surface">{f.q}</span>
                                            <span className={`material-symbols-outlined text-primary flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                                expand_more
                                            </span>
                                        </button>
                                        <div
                                            className="accordion-content"
                                            style={{ maxHeight: isOpen ? '300px' : '0px' }}
                                        >
                                            <p className="px-5 pb-4 text-body-md text-on-surface-variant leading-relaxed">{f.a}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

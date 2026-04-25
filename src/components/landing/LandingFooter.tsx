import { Link } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { Send } from 'lucide-react'

export default function LandingFooter() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const formRef = useRef<HTMLFormElement>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')

    const formData = new FormData(e.currentTarget)
    
    // Structure the data exactly as EmailJS expects it
    const data = {
      service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID,
      template_id: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      template_params: {
        from_name: formData.get('name'),
        reply_to: formData.get('email'),
        message: formData.get('message'),
      }
    }

    try {
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setStatus('sent')
        formRef.current?.reset()
      } else {
        console.error("Form Error", await response.text())
        setStatus('error')
      }
    } catch (error) {
      console.error("Network Error", error)
      setStatus('error')
    }
  }

  return (
    <footer id="contact" className="w-full bg-[#0a0a0f] border-t border-vexed-accent2 text-white pt-20 pb-10 relative z-10">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 mb-16">
        
        {/* Left Side: Brand & Links */}
        <div className="my-auto">
          <Link to="/" className="inline-block mb-6">
            <img src="/wordmark.png" alt="Vexed" className="h-28 w-auto object-contain" />
          </Link>
          <p className="text-vexed-dim text-lg mb-8 max-w-lg leading-relaxed">
            The platform where daily frustrations are transformed into open-source missions. Built for problem-solvers.
          </p>
        </div>

        {/* Right Side: Contact Form */}
        <div className="bg-vexed-bg2/50 p-8 rounded-2xl border border-vexed-accent2 shadow-xl">
          <h3 className="text-2xl font-bold mb-2">Get in touch</h3>
          <p className="text-vexed-dim text-sm mb-6">Have a question or want to work together? Send me a message.</p>
          
          {status === 'sent' ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-5 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <Send size={18} />
              </div>
              <p className="font-medium">Message sent successfully! I'll get back to you soon.</p>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  name="name" // Required by Web3Forms
                  placeholder="Name" 
                  required
                  className="w-full bg-vexed-bg1 border border-vexed-accent2 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-vexed-primary transition-colors"
                />
                <input 
                  type="email" 
                  name="email" // Required by Web3Forms
                  placeholder="Email" 
                  required
                  className="w-full bg-vexed-bg1 border border-vexed-accent2 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-vexed-primary transition-colors"
                />
              </div>
              <textarea 
                name="message" // Required by Web3Forms
                placeholder="Your message..." 
                rows={4}
                required
                className="w-full bg-vexed-bg1 border border-vexed-accent2 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-vexed-primary transition-colors resize-none"
              ></textarea>
              <button 
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-vexed-accent2 hover:bg-vexed-primary text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === 'sending' ? 'Sending...' : (
                  <>Send Message <Send size={16} /></>
                )}
              </button>
              {status === 'error' && (
                <p className="text-red-400 text-sm mt-2 text-center">Failed to send message. Please try again.</p>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="max-w-6xl mx-auto px-6 pt-8 border-t border-vexed-accent2 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-vexed-dim">
        <p>© {new Date().getFullYear()} Vexed. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}
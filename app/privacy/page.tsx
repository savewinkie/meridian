import Link from "next/link"
import { LogoMark } from "@/components/logo"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Privacy Policy" }

const EFFECTIVE = "May 18, 2026"
const COMPANY = "Qualix, Inc."
const EMAIL = "privacy@qualix.dev"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top bar */}
      <div className="border-b border-[#1a1a1a] px-6 py-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <LogoMark size={24} />
            <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">Qualix</span>
          </Link>
          <Link href="/signup" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#d97757] mb-3">Legal</p>
          <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-white/35 text-sm">Effective date: {EFFECTIVE}</p>
        </div>

        <div className="space-y-10 text-white/60 leading-relaxed text-sm">

          <section>
            <p>
              {COMPANY} ("Qualix", "we", "us", or "our") is committed to protecting your privacy. This Privacy
              Policy explains what information we collect, how we use it, and the choices you have. It applies
              to all users of our website and Service.
            </p>
          </section>

          <Section title="1. Information We Collect">
            <Subsection title="Information you provide">
              <ul>
                <li><strong className="text-white/70">Account information</strong> — name, email address, and password when you register.</li>
                <li><strong className="text-white/70">GitHub OAuth data</strong> — if you sign in with GitHub, we receive your GitHub username, public profile, and the access token needed to read repositories you authorize.</li>
                <li><strong className="text-white/70">Payment information</strong> — billing details are collected and stored by our payment processor (Stripe). We never store full card numbers.</li>
                <li><strong className="text-white/70">Content you submit</strong> — source code, files, and repository data you choose to analyze through the Service.</li>
                <li><strong className="text-white/70">Support communications</strong> — messages you send to our support team.</li>
              </ul>
            </Subsection>
            <Subsection title="Information collected automatically">
              <ul>
                <li><strong className="text-white/70">Usage data</strong> — pages visited, features used, timestamps, and actions taken within the Service.</li>
                <li><strong className="text-white/70">Device and browser data</strong> — IP address, browser type, operating system, and referring URL.</li>
                <li><strong className="text-white/70">Cookies and similar technologies</strong> — session tokens required for authentication, and optional analytics cookies.</li>
              </ul>
            </Subsection>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use your information to:</p>
            <ul>
              <li>Provide, operate, and improve the Service.</li>
              <li>Authenticate your identity and secure your account.</li>
              <li>Process payments and send billing notifications.</li>
              <li>Send transactional emails (account confirmation, password reset, subscription updates).</li>
              <li>Respond to support requests and troubleshoot issues.</li>
              <li>Monitor for abuse, security threats, and violations of our Terms of Service.</li>
              <li>Analyze aggregate usage patterns to improve features (using anonymized or aggregated data only).</li>
            </ul>
            <p>
              We do <strong className="text-white/70">not</strong> use your source code or repository content to train
              AI models. We do not sell your personal information to third parties.
            </p>
          </Section>

          <Section title="3. How We Share Your Information">
            <p>We share information only in the following circumstances:</p>
            <ul>
              <li><strong className="text-white/70">Service providers</strong> — trusted vendors who process data on our behalf, such as Stripe (payments), Supabase (database and authentication), Anthropic (AI analysis), and Vercel (hosting). These providers are bound by data processing agreements and may only use your data to provide services to us.</li>
              <li><strong className="text-white/70">Legal compliance</strong> — when required by applicable law, court order, or to protect the rights and safety of Qualix, our users, or the public.</li>
              <li><strong className="text-white/70">Business transfers</strong> — if Qualix is acquired or merges with another company, your information may be transferred as part of that transaction. We will notify you before your data is subject to a different privacy policy.</li>
            </ul>
          </Section>

          <Section title="4. Data Retention">
            <p>
              We retain your account information and usage data for as long as your account is active or as needed
              to provide the Service. When you delete your account, we delete or anonymize your personal information
              within 90 days, except where retention is required by law or for legitimate business purposes such as
              fraud prevention.
            </p>
            <p>
              Source code and repository content submitted for analysis is retained only as long as necessary to
              complete the analysis and is deleted within 30 days unless you have saved results to your account.
            </p>
          </Section>

          <Section title="5. Security">
            <p>
              We implement industry-standard security measures including encryption in transit (TLS), encryption at
              rest, access controls, and regular security reviews. However, no system is completely secure; we cannot
              guarantee absolute security of your data.
            </p>
            <p>
              If you discover a security vulnerability, please report it to{" "}
              <a href="mailto:security@qualix.dev" className="text-[#d97757] hover:text-[#c46843] underline underline-offset-2 transition-colors">security@qualix.dev</a>.
            </p>
          </Section>

          <Section title="6. Your Rights and Choices">
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li><strong className="text-white/70">Access</strong> — request a copy of the personal information we hold about you.</li>
              <li><strong className="text-white/70">Correction</strong> — request that we correct inaccurate or incomplete information.</li>
              <li><strong className="text-white/70">Deletion</strong> — request that we delete your personal information ("right to be forgotten").</li>
              <li><strong className="text-white/70">Portability</strong> — receive your data in a structured, machine-readable format.</li>
              <li><strong className="text-white/70">Opt out of marketing</strong> — unsubscribe from promotional emails at any time using the link in the email footer.</li>
            </ul>
            <p>
              To exercise these rights, contact us at{" "}
              <a href={`mailto:${EMAIL}`} className="text-[#d97757] hover:text-[#c46843] underline underline-offset-2 transition-colors">{EMAIL}</a>.
              We will respond within 30 days.
            </p>
          </Section>

          <Section title="7. Cookies">
            <p>
              We use strictly necessary cookies (required for authentication and security) and, with your consent,
              optional analytics cookies to understand how the Service is used. You can manage cookie preferences
              through your browser settings. Disabling necessary cookies will prevent you from using the Service.
            </p>
          </Section>

          <Section title="8. International Transfers">
            <p>
              Qualix is based in the United States. If you access the Service from outside the US, your information
              may be transferred to, stored in, and processed in the United States. We rely on Standard Contractual
              Clauses or other approved mechanisms for transfers of personal data from the European Economic Area,
              UK, and Switzerland.
            </p>
          </Section>

          <Section title="9. Children">
            <p>
              The Service is not directed to children under 16. We do not knowingly collect personal information
              from children under 16. If you believe we have inadvertently collected such information, contact us
              and we will delete it promptly.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we make material changes, we will notify
              you by email or by a prominent notice in the Service before the changes take effect. The updated
              policy will indicate the new effective date.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              For questions, concerns, or privacy-related requests, contact our privacy team at{" "}
              <a href={`mailto:${EMAIL}`} className="text-[#d97757] hover:text-[#c46843] underline underline-offset-2 transition-colors">{EMAIL}</a>
              {" "}or write to us at:
            </p>
            <address className="not-italic mt-3 pl-4 border-l border-[#262626] text-white/40">
              {COMPANY}<br />
              Privacy Team<br />
              legal@qualix.dev
            </address>
          </Section>

        </div>

        <div className="mt-16 pt-8 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">© {new Date().getFullYear()} {COMPANY}</p>
          <Link href="/terms" className="text-xs text-white/35 hover:text-[#d97757] transition-colors">
            Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-white/80 mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-white/60 mb-2">{title}</h3>
      {children}
    </div>
  )
}

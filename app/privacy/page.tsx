import Link from "next/link"
import { LogoMark } from "@/components/logo"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Privacy Policy" }

const EFFECTIVE = "May 18, 2026"
const COMPANY = "Qualix, Inc."
const EMAIL = "privacy@qualix.dev"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#1A1504]">
      {/* Top bar */}
      <div className="border-b border-[#E8DDD0] px-6 py-4 bg-white">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <LogoMark size={24} />
            <span className="text-sm font-semibold text-[#1A1504] group-hover:text-[#D97757] transition-colors">Qualix</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-[#8C7B6E] hover:text-[#1A1504] transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D97757] mb-3">Legal</p>
          <h1 className="text-4xl font-serif text-[#1A1504] mb-3">Privacy Policy</h1>
          <p className="text-[#8C7B6E] text-sm">Effective date: {EFFECTIVE}</p>
        </div>

        <div className="space-y-10 text-[#8C7B6E] leading-relaxed text-sm">

          <section>
            <p>
              {COMPANY} ("Qualix", "we", "us", or "our") is committed to protecting your privacy. This Privacy
              Policy explains what information we collect, how we use it, and the choices you have.
            </p>
          </section>

          <Section title="1. Information We Collect">
            <Subsection title="Information you provide">
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong className="text-[#1A1504]">Account information</strong> — name, email address, and password when you register.</li>
                <li><strong className="text-[#1A1504]">GitHub OAuth data</strong> — if you sign in with GitHub, we receive your username, public profile, and access token.</li>
                <li><strong className="text-[#1A1504]">Payment information</strong> — billing details collected by Stripe. We never store full card numbers.</li>
                <li><strong className="text-[#1A1504]">Content you submit</strong> — source code, files, and repository data you analyze through the Service.</li>
              </ul>
            </Subsection>
            <Subsection title="Information collected automatically">
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong className="text-[#1A1504]">Usage data</strong> — pages visited, features used, and actions taken within the Service.</li>
                <li><strong className="text-[#1A1504]">Device data</strong> — IP address, browser type, and operating system.</li>
                <li><strong className="text-[#1A1504]">Cookies</strong> — session tokens required for authentication.</li>
              </ul>
            </Subsection>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Provide, operate, and improve the Service.</li>
              <li>Authenticate your identity and secure your account.</li>
              <li>Process payments and send billing notifications.</li>
              <li>Respond to support requests and troubleshoot issues.</li>
              <li>Monitor for abuse and security threats.</li>
            </ul>
            <p className="mt-3">
              We do <strong className="text-[#1A1504]">not</strong> use your source code to train AI models.
              We do not sell your personal information to third parties.
            </p>
          </Section>

          <Section title="3. How We Share Your Information">
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong className="text-[#1A1504]">Service providers</strong> — Stripe (payments), Supabase (database), Anthropic (AI analysis), and Vercel (hosting). Bound by data processing agreements.</li>
              <li><strong className="text-[#1A1504]">Legal compliance</strong> — when required by law or to protect the rights and safety of users.</li>
              <li><strong className="text-[#1A1504]">Business transfers</strong> — if Qualix is acquired, your information may be transferred with prior notice.</li>
            </ul>
          </Section>

          <Section title="4. Data Retention">
            <p>
              We retain your account data for as long as your account is active. When you delete your account,
              we delete your personal information within 90 days. Source code submitted for analysis is deleted
              within 30 days unless saved to your account.
            </p>
          </Section>

          <Section title="5. Security">
            <p>
              We implement encryption in transit (TLS), encryption at rest, and access controls. If you discover
              a vulnerability, please report it to{" "}
              <a href="mailto:security@qualix.dev" className="text-[#D97757] hover:text-[#C46843] underline underline-offset-2 transition-colors">security@qualix.dev</a>.
            </p>
          </Section>

          <Section title="6. Your Rights and Choices">
            <p>You may have the right to access, correct, delete, or export your personal data. To exercise these rights, contact us at{" "}
              <a href={`mailto:${EMAIL}`} className="text-[#D97757] hover:text-[#C46843] underline underline-offset-2 transition-colors">{EMAIL}</a>.
              We will respond within 30 days.
            </p>
          </Section>

          <Section title="7. Cookies">
            <p>
              We use strictly necessary cookies for authentication and, with consent, optional analytics cookies.
              You can manage cookie preferences through your browser settings.
            </p>
          </Section>

          <Section title="8. International Transfers">
            <p>
              Qualix is based in the United States. Transfers from the EEA, UK, and Switzerland are covered by
              Standard Contractual Clauses or other approved mechanisms.
            </p>
          </Section>

          <Section title="9. Children">
            <p>
              The Service is not directed to children under 16. Contact us if you believe we have collected
              information from a child and we will delete it promptly.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We will notify you of material changes by email or in-app notice before they take effect.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              For privacy-related questions, contact us at{" "}
              <a href={`mailto:${EMAIL}`} className="text-[#D97757] hover:text-[#C46843] underline underline-offset-2 transition-colors">{EMAIL}</a>.
            </p>
            <address className="not-italic mt-3 pl-4 border-l border-[#E8DDD0] text-[#C4B8AA]">
              {COMPANY}<br />
              Privacy Team<br />
              legal@qualix.dev
            </address>
          </Section>

        </div>

        <div className="mt-16 pt-8 border-t border-[#E8DDD0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#C4B8AA]">© {new Date().getFullYear()} {COMPANY}</p>
          <Link href="/terms" className="text-xs text-[#8C7B6E] hover:text-[#D97757] transition-colors">
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
      <h2 className="text-base font-semibold text-[#1A1504] mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-[#8C7B6E] mb-2">{title}</h3>
      {children}
    </div>
  )
}

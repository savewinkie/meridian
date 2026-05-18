import Link from "next/link"
import { LogoMark } from "@/components/logo"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Terms of Service" }

const EFFECTIVE = "May 18, 2026"
const COMPANY = "Qualix, Inc."
const EMAIL = "legal@qualix.dev"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Top bar */}
      <div className="border-b border-white/[0.06] px-6 py-4">
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
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-violet-400 mb-3">Legal</p>
          <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-white/35 text-sm">Effective date: {EFFECTIVE}</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-10 text-white/60 leading-relaxed">

          <section>
            <p>
              These Terms of Service ("Terms") govern your access to and use of the services, website, and software
              provided by {COMPANY} ("Qualix", "we", "us", or "our"). By creating an account or using any part of the
              Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
            </p>
          </section>

          <Section title="1. The Service">
            <p>
              Qualix provides an AI-powered code review and quality platform ("Service") that analyzes source code,
              repositories, and related materials using artificial intelligence, including the Anthropic Claude API,
              to identify bugs, security vulnerabilities, and code quality issues.
            </p>
          </Section>

          <Section title="2. Accounts">
            <p>
              You must create an account to use most features of the Service. You are responsible for maintaining the
              security of your account credentials and for all activity that occurs under your account. You must be
              at least 16 years old to create an account. You may not share your account or use another person's account
              without their permission.
            </p>
            <p>
              You agree to provide accurate and complete information when creating your account and to keep it up to date.
              We reserve the right to suspend or terminate accounts that violate these Terms or that have been inactive
              for an extended period.
            </p>
          </Section>

          <Section title="3. Acceptable Use">
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service to analyze code you do not own or have permission to analyze.</li>
              <li>Attempt to reverse engineer, decompile, or extract the underlying AI models or algorithms.</li>
              <li>Use the Service to develop a competing product or service.</li>
              <li>Transmit malicious code, viruses, or any content that disrupts or damages systems.</li>
              <li>Violate any applicable laws, regulations, or third-party rights.</li>
              <li>Circumvent any access controls, rate limits, or security measures.</li>
              <li>Use automated means to access the Service beyond normal API usage as documented.</li>
            </ul>
          </Section>

          <Section title="4. Your Content">
            <p>
              You retain all rights to code, files, and other content ("Your Content") you submit to the Service.
              By submitting Your Content, you grant Qualix a limited, non-exclusive, worldwide license to process,
              analyze, and store it solely for the purpose of providing the Service to you.
            </p>
            <p>
              We do not use Your Content to train AI models. We do not sell Your Content to third parties.
              Your Content is treated as confidential and is only accessed by our systems to deliver the Service
              or, with your explicit consent, by our support team to resolve issues.
            </p>
          </Section>

          <Section title="5. Subscription and Payment">
            <p>
              Qualix offers free and paid subscription plans. Paid plans are billed monthly or annually in advance.
              All prices are in USD and exclude applicable taxes. You authorize us to charge your payment method on
              a recurring basis until you cancel.
            </p>
            <p>
              You may cancel your paid subscription at any time. Cancellation takes effect at the end of the current
              billing period; we do not provide refunds for partial periods except where required by law. We reserve
              the right to change pricing with 30 days' notice.
            </p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              Qualix and its licensors own all rights, title, and interest in the Service, including all software,
              AI models, and documentation. These Terms do not grant you any ownership rights in the Service.
              "Qualix" and related logos are trademarks of {COMPANY}.
            </p>
            <p>
              AI-generated suggestions, fixes, and reviews produced by the Service ("AI Output") are provided as-is.
              We make no claim of ownership over AI Output relating to your code. You are responsible for reviewing
              AI Output before applying it.
            </p>
          </Section>

          <Section title="7. Disclaimer of Warranties">
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
              INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, OR NON-INFRINGEMENT.
              WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT AI OUTPUT WILL BE
              ACCURATE OR COMPLETE. USE OF AI OUTPUT IS AT YOUR OWN RISK.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, QUALIX SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE,
              EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY FOR ANY CLAIM
              ARISING UNDER THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING
              THE CLAIM, OR $100 IF YOU HAVE NOT MADE ANY PAYMENTS.
            </p>
          </Section>

          <Section title="9. Indemnification">
            <p>
              You agree to indemnify and hold harmless {COMPANY} and its officers, directors, employees, and agents
              from any claims, damages, losses, or expenses (including reasonable legal fees) arising from your
              use of the Service, Your Content, or your violation of these Terms.
            </p>
          </Section>

          <Section title="10. Termination">
            <p>
              You may stop using the Service and delete your account at any time. We may suspend or terminate your
              access immediately if you violate these Terms, if required by law, or to protect the integrity of the
              Service. Upon termination, your right to use the Service ends and we may delete Your Content in
              accordance with our data retention policy.
            </p>
          </Section>

          <Section title="11. Changes to These Terms">
            <p>
              We may update these Terms from time to time. When we make material changes, we will notify you by
              email or by a prominent notice in the Service at least 14 days before the changes take effect.
              Continued use of the Service after the effective date constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="12. Governing Law">
            <p>
              These Terms are governed by the laws of the State of Delaware, United States, without regard to
              conflict of law principles. Any disputes shall be resolved in the state or federal courts located
              in Delaware, and you consent to personal jurisdiction in those courts.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              For questions about these Terms, contact us at{" "}
              <a href={`mailto:${EMAIL}`} className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">{EMAIL}</a>.
            </p>
          </Section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">© {new Date().getFullYear()} {COMPANY}</p>
          <Link href="/privacy" className="text-xs text-white/35 hover:text-violet-400 transition-colors">
            Privacy Policy →
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

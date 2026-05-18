import Link from "next/link"
import { LogoMark } from "@/components/logo"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Terms of Service" }

const EFFECTIVE = "May 18, 2026"
const COMPANY = "Qualix, Inc."
const EMAIL = "legal@qualix.dev"

export default function TermsPage() {
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
          <h1 className="text-4xl font-serif text-[#1A1504] mb-3">Terms of Service</h1>
          <p className="text-[#8C7B6E] text-sm">Effective date: {EFFECTIVE}</p>
        </div>

        <div className="space-y-10 text-[#8C7B6E] leading-relaxed text-sm">

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
              at least 16 years old to create an account.
            </p>
            <p>
              You agree to provide accurate and complete information when creating your account and to keep it up to date.
              We reserve the right to suspend or terminate accounts that violate these Terms.
            </p>
          </Section>

          <Section title="3. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Use the Service to analyze code you do not own or have permission to analyze.</li>
              <li>Attempt to reverse engineer, decompile, or extract the underlying AI models or algorithms.</li>
              <li>Use the Service to develop a competing product or service.</li>
              <li>Transmit malicious code, viruses, or any content that disrupts or damages systems.</li>
              <li>Violate any applicable laws, regulations, or third-party rights.</li>
              <li>Circumvent any access controls, rate limits, or security measures.</li>
            </ul>
          </Section>

          <Section title="4. Your Content">
            <p>
              You retain all rights to code, files, and other content ("Your Content") you submit to the Service.
              By submitting Your Content, you grant Qualix a limited, non-exclusive license to process and store it
              solely for the purpose of providing the Service to you.
            </p>
            <p>
              We do not use Your Content to train AI models. We do not sell Your Content to third parties.
              Your Content is treated as confidential.
            </p>
          </Section>

          <Section title="5. Subscription and Payment">
            <p>
              Qualix offers free and paid subscription plans. Paid plans are billed monthly or annually in advance.
              All prices are in USD. You may cancel at any time; cancellation takes effect at the end of the current
              billing period with no refunds for partial periods except where required by law.
            </p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              Qualix and its licensors own all rights in the Service, including all software and AI models.
              "Qualix" and related logos are trademarks of {COMPANY}. AI-generated suggestions are provided as-is;
              you are responsible for reviewing AI Output before applying it.
            </p>
          </Section>

          <Section title="7. Disclaimer of Warranties">
            <p>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT THE SERVICE
              WILL BE UNINTERRUPTED OR ERROR-FREE, OR THAT AI OUTPUT WILL BE ACCURATE OR COMPLETE.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, QUALIX SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, OR CONSEQUENTIAL DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN
              THE TWELVE MONTHS PRECEDING THE CLAIM, OR $100 IF YOU HAVE NOT MADE ANY PAYMENTS.
            </p>
          </Section>

          <Section title="9. Termination">
            <p>
              You may delete your account at any time. We may suspend or terminate your access immediately if you
              violate these Terms or to protect the integrity of the Service.
            </p>
          </Section>

          <Section title="10. Changes to These Terms">
            <p>
              We may update these Terms from time to time. We will notify you by email or in-app notice at least
              14 days before material changes take effect.
            </p>
          </Section>

          <Section title="11. Governing Law">
            <p>
              These Terms are governed by the laws of the State of Delaware, United States. Disputes shall be
              resolved in Delaware courts.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              For questions about these Terms, contact us at{" "}
              <a href={`mailto:${EMAIL}`} className="text-[#D97757] hover:text-[#C46843] underline underline-offset-2 transition-colors">{EMAIL}</a>.
            </p>
          </Section>

        </div>

        <div className="mt-16 pt-8 border-t border-[#E8DDD0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#C4B8AA]">© {new Date().getFullYear()} {COMPANY}</p>
          <Link href="/privacy" className="text-xs text-[#8C7B6E] hover:text-[#D97757] transition-colors">
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
      <h2 className="text-base font-semibold text-[#1A1504] mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

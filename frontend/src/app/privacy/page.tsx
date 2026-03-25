import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Grammario",
  description: "How Grammario collects, uses, and protects your personal data.",
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 container max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: March 25, 2026
        </p>

        <div className="space-y-10 text-[15px] leading-7 text-foreground/90">
          <Section title="1. Introduction">
            <p>
              Grammario provides a
              visual grammar analysis tool for language learners. This Privacy Policy explains what
              information we collect, how we use it, and the choices you have.
            </p>
            <p>
              By using Grammario you agree to the collection and use of information as described
              here. If you do not agree, please discontinue use of the service.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <H3>Account information</H3>
            <p>
              When you sign up we collect the email address and display name provided by your
              authentication provider (e.g. Google). We do not store passwords&mdash;authentication
              is handled by Supabase Auth.
            </p>

            <H3>Usage data</H3>
            <p>
              When you submit text for analysis we store the sentence, the target language, and the
              resulting analysis (part-of-speech tags, dependency trees, difficulty scores,
              vocabulary data, and AI-generated explanations). This data is linked to your account
              so you can review past analyses and track vocabulary over time.
            </p>

            <H3>Technical data</H3>
            <p>
              We automatically collect standard technical information such as IP address, browser
              type, device type, and pages visited. This data is used for security, debugging, and
              aggregate analytics.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide and improve the grammar analysis service</li>
              <li>Power the spaced-repetition vocabulary review system</li>
              <li>Cache analysis results to improve response times</li>
              <li>Generate aggregate, anonymized statistics (e.g. most-studied languages)</li>
              <li>Detect and prevent abuse or unauthorized access</li>
              <li>Communicate service updates when necessary</li>
            </ul>
            <p>
              We do <strong>not</strong> sell your personal data to third parties, and we do not use
              your data to train machine learning models.
            </p>
          </Section>

          <Section title="4. Third-Party Services">
            <p>We rely on the following third-party services to operate Grammario:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Supabase</strong> &mdash; authentication and database hosting
              </li>
              <li>
                <strong>Vercel</strong> &mdash; frontend hosting and edge functions
              </li>
              <li>
                <strong>OpenRouter / OpenAI</strong> &mdash; large language model API calls for
                pedagogical explanations (only the raw sentence text is sent; no account information
                is included)
              </li>
            </ul>
            <p>
              Each provider processes data in accordance with their own privacy policies. We
              encourage you to review them.
            </p>
          </Section>

          <Section title="5. Cookies and Local Storage">
            <p>
              We use cookies and browser local storage solely for authentication session management
              and user preferences (e.g. selected language). We do not use advertising or
              cross-site tracking cookies.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <p>
              Your account data and analysis history are retained for as long as your account is
              active. Cached analysis results are automatically purged after 24 hours. If you
              delete your account, we will remove your personal data within 30 days. Anonymized,
              aggregate data may be retained indefinitely.
            </p>
          </Section>

          <Section title="7. Data Security">
            <p>
              All data is transmitted over HTTPS. Database access is restricted by row-level
              security policies enforced by Supabase. While we take reasonable precautions to
              protect your information, no method of electronic storage is 100% secure.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at the address below.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              Grammario is not directed at children under 13. We do not knowingly collect personal
              information from children. If you believe a child has provided us with personal data,
              please contact us and we will delete it promptly.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the
              &ldquo;Last updated&rdquo; date at the top of this page. Continued use of Grammario
              after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              If you have questions or concerns about this Privacy Policy, please reach out via
              our{" "}
              <Link href="/contact" className="text-primary hover:underline">
                contact page
              </Link>
              .
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="font-medium text-foreground mt-4 mb-1">{children}</h3>
}

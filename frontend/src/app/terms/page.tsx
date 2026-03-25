import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — Grammario",
  description: "Terms and conditions for using the Grammario language learning platform.",
}

export default function TermsPage() {
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

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: March 25, 2026
        </p>

        <div className="space-y-10 text-[15px] leading-7 text-foreground/90">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using Grammario you agree to be bound by these Terms of Service.
              If you do not agree to all of these terms, do not use the service.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              Grammario is a web-based language learning tool that provides visual grammar analysis,
              vocabulary tracking, spaced-repetition review, and AI-generated pedagogical
              explanations. The service is provided on an &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; basis.
            </p>
          </Section>

          <Section title="3. Accounts">
            <p>
              You must create an account to use most features of Grammario. You are responsible for
              maintaining the confidentiality of your account credentials and for all activity that
              occurs under your account. You agree to notify us immediately of any unauthorized use.
            </p>
            <p>
              You must be at least 13 years old to create an account. By creating an account you
              represent that you meet this age requirement.
            </p>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the service for any unlawful purpose</li>
              <li>Submit content that is harmful, abusive, or violates the rights of others</li>
              <li>Attempt to gain unauthorized access to any part of the service or its systems</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Scrape, crawl, or use automated means to access the service without permission</li>
              <li>Reverse-engineer or attempt to extract the source code of the service</li>
            </ul>
          </Section>

          <Section title="5. User Content">
            <p>
              You retain ownership of any text you submit for analysis. By submitting text you
              grant Grammario a limited, non-exclusive license to process, store, and cache that
              text solely for the purpose of providing the service to you.
            </p>
            <p>
              You are solely responsible for the content you submit. Do not submit text that
              contains sensitive personal information, trade secrets, or material you do not have
              the right to share.
            </p>
          </Section>

          <Section title="6. AI-Generated Content">
            <p>
              Grammario uses large language models to generate translations, grammar explanations,
              and learning tips. This content is provided for educational purposes only and may
              contain errors. Grammario does not guarantee the accuracy, completeness, or
              reliability of AI-generated content. You should not rely on it as your sole source
              of language instruction.
            </p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              The Grammario service, including its design, code, logos, and documentation, is
              protected by intellectual property laws. These Terms do not grant you any right to
              use the Grammario name, logo, or branding without prior written consent.
            </p>
          </Section>

          <Section title="8. Availability and Changes">
            <p>
              Grammario may modify, suspend, or discontinue any part of the service at any time
              without prior notice. We may also update these Terms from time to time. Continued
              use of the service after changes constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, Grammario and its operators shall not be
              liable for any indirect, incidental, special, consequential, or punitive damages
              arising from your use of or inability to use the service, including but not limited
              to loss of data, loss of profits, or reliance on AI-generated content.
            </p>
          </Section>

          <Section title="10. Disclaimers">
            <p>
              The service is provided &ldquo;as is&rdquo; without warranties of any kind, whether
              express or implied, including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              Grammario may suspend or terminate your access to the service at any time for
              conduct that violates these Terms or is otherwise harmful to other users or the
              service. You may delete your account at any time through your account settings.
            </p>
          </Section>

          <Section title="12. Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of
              Canada, without regard to conflict of law provisions.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              If you have questions about these Terms, please reach out via our{" "}
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

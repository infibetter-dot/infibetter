import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const Route = createFileRoute("/terms-of-service")({
  head: () => ({
    meta: [
      { title: "Terms of Service | INFIBETTER" },
      {
        name: "description",
        content:
          "Read the Terms of Service governing your use of the INFIBETTER website and services.",
      },
    ],
  }),
  component: TermsOfServicePage,
});

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-9">
      <h2 className="mb-4 text-[19px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[21px]">
        {title}
      </h2>
      <div className="space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
        {children}
      </div>
    </section>
  );
}

function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white text-[#333]">
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-20 pt-10 sm:px-10 sm:pt-14 lg:px-14">
        <header className="mb-7 text-center">
          <h1 className="text-[38px] font-semibold leading-tight tracking-[-0.055em] text-[#171717] sm:text-[48px]">
            Terms of Service
          </h1>
        </header>

        <div className="mb-12 space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
          <p className="text-[11px] text-[#777]">
            Last updated: November 17, 2026
          </p>
          <p>
            This website is operated by <strong>INFIBETTER</strong>. Throughout
            the site, the terms &quot;we&quot;, &quot;us&quot;, and
            &quot;our&quot; refer to INFIBETTER. INFIBETTER offers this website,
            including all information, tools, products, and services available
            from this site to you, the user, conditioned upon your acceptance
            of all terms, conditions, policies, and notices stated here.
          </p>
          <p>
            By visiting our site and/or purchasing something from us, you
            engage in our &quot;Service&quot; and agree to be bound by these
            Terms of Service (&quot;Terms&quot;), including any additional
            terms and policies referenced here or made available by hyperlink.
            These Terms apply to all users of the site, including browsers,
            customers, and contributors of content.
          </p>
          <p>
            Please read these Terms carefully before accessing or using our
            website. By accessing or using any part of the site, you agree to
            be bound by these Terms. If you do not agree to all the terms and
            conditions of this agreement, you may not access the website or
            use our Services.
          </p>
          <p>
            Any new features, products, or tools added to the website will
            also be subject to these Terms. You can review the most current
            version of the Terms at any time on this page. We reserve the
            right to update, change, or replace any part of these Terms by
            posting updates and/or changes to our website. Your continued use
            of or access to the website following the posting of changes
            constitutes acceptance of those changes.
          </p>
        </div>

        <Section title="SECTION 1 - ONLINE STORE TERMS">
          <p>
            By agreeing to these Terms, you represent that you are at least
            the age of majority in your place of residence, or that you are
            the age of majority and have given us your consent to allow any
            minor dependents to use this site under your supervision.
          </p>
          <p>
            You may not use our products or Services for any illegal or
            unauthorized purpose, nor may you violate any laws applicable to
            you when using the Service, including intellectual property laws.
          </p>
          <p>
            You must not transmit worms, viruses, malware, or any code of a
            destructive nature. A breach or violation of these Terms may
            result in suspension or termination of your access to the
            Services.
          </p>
        </Section>

        <Section title="SECTION 2 - GENERAL CONDITIONS">
          <p>
            We reserve the right to refuse service to anyone for any lawful
            reason and, where appropriate, to limit or suspend access to our
            Services.
          </p>
          <p>
            You understand that information you submit through the website,
            excluding payment information handled by payment providers, may
            be transferred across networks and adapted to technical
            requirements of connecting networks or devices. Payment
            information is handled by the relevant payment provider using its
            security processes.
          </p>
          <p>
            You agree not to reproduce, duplicate, copy, sell, resell, or
            exploit any portion of the Service, use of the Service, or access
            to the Service without our express written permission.
          </p>
          <p>
            The headings used in this agreement are included for convenience
            only and will not limit or otherwise affect these Terms.
          </p>
        </Section>

        <Section title="SECTION 3 - ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION">
          <p>
            We are not responsible if information made available on this site
            is not accurate, complete, or current. The material on this site
            is provided for general information only and should not be relied
            upon as the sole basis for making decisions without consulting
            more accurate, complete, or timely sources of information. Any
            reliance on the material on this site is at your own risk.
          </p>
          <p>
            This site may contain historical information. Historical
            information is not necessarily current and is provided for
            reference only. We reserve the right to modify website content
            at any time, but we are not obligated to update every item of
            information unless required by applicable law.
          </p>
        </Section>

        <Section title="SECTION 4 - MODIFICATIONS TO THE SERVICE AND PRICES">
          <p>
            Prices for our products are subject to change without prior
            notice, except where notice is required by applicable law or a
            price has already been confirmed for an accepted order.
          </p>
          <p>
            We reserve the right to modify, suspend, or discontinue the
            Service, or any part or content of it, at any time.
          </p>
          <p>
            To the extent permitted by applicable law, we shall not be liable
            for any modification, price change, suspension, or
            discontinuance of the Service.
          </p>
        </Section>

        <Section title="SECTION 5 - PRODUCTS OR SERVICES">
          <p>
            Certain products or Services may be available exclusively online
            through our website. These products may have limited quantities
            and are subject to return or exchange only in accordance with our
            Refund Policy.
          </p>
          <p>
            We make reasonable efforts to display product images, colors,
            descriptions, and specifications as accurately as possible.
            However, the appearance of a product may vary depending on your
            device display and settings. We cannot guarantee that your
            screen's display of any color will be exact.
          </p>
          <p>
            We reserve the right, but are not obligated, to limit sales of
            our products or Services to any person, geographic region, or
            jurisdiction where permitted by law. We may exercise this right
            on a case-by-case basis. We also reserve the right to limit
            quantities, change product descriptions or pricing, and
            discontinue products at any time.
          </p>
          <p>
            We do not warrant that the quality of any products, Services,
            information, or other material purchased or obtained by you will
            meet every personal expectation, except for rights and
            guarantees that cannot be excluded under applicable consumer
            protection laws.
          </p>
        </Section>

        <Section title="SECTION 6 - ACCURACY OF BILLING AND ACCOUNT INFORMATION">
          <p>
            We reserve the right to refuse or cancel any order you place with
            us, including where an order appears to be placed for resale,
            contains inaccurate information, involves suspected fraud, or
            cannot be fulfilled. We may, in our discretion and where
            permitted by law, limit quantities purchased per person,
            household, or order.
          </p>
          <p>
            If we make a change to or cancel an order, we may attempt to
            notify you using the email address, phone number, or billing
            information provided when the order was placed.
          </p>
          <p>
            You agree to provide current, complete, and accurate purchase
            and account information for all purchases made through our
            website. You agree to promptly update your information so that
            we can complete transactions and contact you as needed.
          </p>
          <p>
            For more details about returns, refunds, and cancellations,
            please review our{" "}
            <a
              href="/refund-policy"
              className="underline underline-offset-2"
            >
              Refund Policy
            </a>
            .
          </p>
        </Section>

        <Section title="SECTION 7 - OPTIONAL TOOLS">
          <p>
            We may provide you with access to third-party tools or services
            over which we neither monitor nor have control or input.
          </p>
          <p>
            You acknowledge and agree that access to such tools is provided
            on an &quot;as is&quot; and &quot;as available&quot; basis,
            without warranties, representations, or conditions of any kind
            to the extent permitted by law. We shall have no liability for
            matters arising from your use of optional third-party tools,
            except where liability cannot be excluded under applicable law.
          </p>
          <p>
            Any use by you of optional tools offered through the site is
            entirely at your own risk and discretion. You should ensure that
            you are familiar with and approve of the terms on which those
            tools are provided by the relevant third-party provider.
          </p>
          <p>
            Any new Services or features offered through the website will
            also be subject to these Terms.
          </p>
        </Section>

        <Section title="SECTION 8 - THIRD-PARTY LINKS">
          <p>
            Certain content, products, and Services available through our
            Service may include materials from third parties.
          </p>
          <p>
            Third-party links on this site may direct you to websites that
            are not affiliated with us. We are not responsible for examining
            or evaluating the content or accuracy of third-party materials
            or websites, and we do not warrant or assume responsibility for
            them.
          </p>
          <p>
            We are not liable for harm or damages related to the purchase or
            use of goods, Services, resources, content, or other transactions
            made in connection with third-party websites, except where
            liability cannot be excluded by law. Please review the
            third-party's policies and practices before engaging in a
            transaction. Questions regarding third-party products should be
            directed to the relevant third party.
          </p>
        </Section>

        <Section title="SECTION 9 - USER COMMENTS, FEEDBACK AND OTHER SUBMISSIONS">
          <p>
            If you send us creative ideas, suggestions, proposals, plans,
            reviews, or other materials, whether online, by email, or
            otherwise (collectively, &quot;Comments&quot;), you agree that
            we may use those Comments to respond to you, improve our
            Services, or display content where you have agreed or where
            permitted by law.
          </p>
          <p>
            We are not obligated to maintain unsolicited Comments in
            confidence, pay compensation for them, or respond to them,
            except where required by law or where we have agreed otherwise.
          </p>
          <p>
            We may, but are not obligated to, monitor, edit, or remove
            content that we determine to be unlawful, offensive,
            threatening, defamatory, obscene, infringing, or otherwise
            objectionable, or that violates these Terms.
          </p>
          <p>
            You agree that your Comments will not violate any rights of a
            third party, including copyright, trademark, privacy, or other
            personal or proprietary rights. You further agree that your
            Comments will not contain unlawful, abusive, or obscene
            material, or malware that could affect the operation of the
            Service or any related website.
          </p>
          <p>
            You may not use a false email address, impersonate another
            person, or otherwise mislead us or third parties as to the
            origin of any Comments. You are responsible for the Comments
            you submit and their accuracy.
          </p>
        </Section>

        <Section title="SECTION 10 - PERSONAL INFORMATION">
          <p>
            Your submission of personal information through our website is
            governed by our{" "}
            <a
              href="/privacy-policy"
              className="underline underline-offset-2"
            >
              Privacy Policy
            </a>
            . Please review that policy to understand how we collect, use,
            and protect your personal information.
          </p>
        </Section>

        <Section title="SECTION 11 - ERRORS, INACCURACIES AND OMISSIONS">
          <p>
            Occasionally, information on our site or in the Service may
            contain typographical errors, inaccuracies, or omissions that
            may relate to product descriptions, pricing, promotions, offers,
            shipping charges, transit times, or availability.
          </p>
          <p>
            We reserve the right to correct errors, inaccuracies, or
            omissions and to update information or cancel orders if any
            information in the Service or on a related website is inaccurate,
            subject to applicable law and any rights you may have as a
            consumer.
          </p>
          <p>
            We undertake no obligation to update, amend, or clarify
            information in the Service except as required by law. No
            specified update or refresh date applied in the Service should
            be taken to indicate that all information has been modified or
            updated.
          </p>
        </Section>

        <Section title="SECTION 12 - PROHIBITED USES">
          <p>
            In addition to other prohibitions set forth in these Terms, you
            are prohibited from using the site or its content:
          </p>
          <ul className="list-[lower-alpha] space-y-2 pl-7 marker:text-[#888]">
            <li>For any unlawful purpose or to solicit others to perform unlawful acts.</li>
            <li>To violate any applicable international, national, regional, or local laws or regulations.</li>
            <li>To infringe upon or violate our intellectual property rights or the rights of others.</li>
            <li>To harass, abuse, insult, harm, defame, intimidate, or discriminate against others.</li>
            <li>To submit false or misleading information.</li>
            <li>To upload or transmit viruses, malware, or other malicious code.</li>
            <li>To collect or track the personal information of others without authorization.</li>
            <li>To spam, phish, scrape, crawl, or otherwise misuse the website or its data.</li>
            <li>For any obscene or otherwise unlawful purpose.</li>
            <li>To interfere with or circumvent the security features of the Service or any related website, other websites, or the Internet.</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate your use of the
            Service or any related website if you violate these prohibited
            uses, subject to applicable law.
          </p>
        </Section>

        <Section title="SECTION 13 - DISCLAIMER OF WARRANTIES; LIMITATION OF LIABILITY">
          <p>
            We do not guarantee, represent, or warrant that your use of our
            Service will be uninterrupted, timely, secure, or error-free.
          </p>
          <p>
            We do not warrant that results obtained from the use of the
            Service will always be accurate or reliable.
          </p>
          <p>
            You agree that from time to time we may modify, suspend, or
            discontinue the Service or any part of it, subject to applicable
            law.
          </p>
          <p>
            To the fullest extent permitted by applicable law, the Service
            and products delivered through the Service are provided on an
            &quot;as is&quot; and &quot;as available&quot; basis, except for
            warranties and consumer rights that cannot lawfully be excluded
            or limited.
          </p>
          <p>
            To the fullest extent permitted by applicable law, INFIBETTER
            and its representatives, employees, contractors, suppliers, and
            service providers shall not be liable for indirect, incidental,
            punitive, special, or consequential damages, including lost
            profits, lost revenue, lost savings, loss of data, or
            replacement costs, arising from your use of the Service or any
            products purchased through it.
          </p>
          <p>
            Nothing in these Terms excludes or limits liability where such
            exclusion or limitation is prohibited by applicable law,
            including any mandatory consumer rights or remedies.
          </p>
        </Section>

        <Section title="SECTION 14 - INDEMNIFICATION">
          <p>
            To the extent permitted by applicable law, you agree to
            indemnify and hold harmless INFIBETTER and its affiliates,
            officers, employees, agents, contractors, suppliers, and service
            providers from claims, liabilities, damages, and reasonable
            expenses arising out of your breach of these Terms, your misuse
            of the Services, or your violation of any law or third-party
            rights.
          </p>
          <p>
            This section does not apply to the extent a claim results from
            our own negligence, misconduct, or breach of obligations that
            cannot be excluded under applicable law.
          </p>
        </Section>

        <Section title="SECTION 15 - SEVERABILITY">
          <p>
            If any provision of these Terms is determined to be unlawful,
            void, or unenforceable, that provision shall be enforceable to
            the fullest extent permitted by applicable law, and the
            unenforceable portion shall be deemed severed from these Terms.
            Such determination shall not affect the validity and
            enforceability of any other remaining provisions.
          </p>
        </Section>

        <Section title="SECTION 16 - TERMINATION">
          <p>
            The obligations and liabilities of the parties incurred before
            the termination date shall survive termination of this
            agreement for all purposes for which they are intended to
            survive.
          </p>
          <p>
            These Terms are effective unless and until terminated by either
            you or us. You may stop using our Services at any time.
          </p>
          <p>
            If, in our reasonable judgment, you fail or we suspect that you
            have failed to comply with any term or provision of these Terms,
            we may suspend or terminate your access to the Services, subject
            to applicable law. You remain responsible for amounts properly
            due up to the effective date of termination.
          </p>
        </Section>

        <Section title="SECTION 17 - ENTIRE AGREEMENT">
          <p>
            Our failure to exercise or enforce any right or provision of
            these Terms shall not constitute a waiver of that right or
            provision.
          </p>
          <p>
            These Terms and any policies or operating rules posted by us on
            this site in respect of the Service constitute the entire
            agreement between you and us concerning your use of the Service,
            superseding prior agreements, communications, and proposals
            relating to the same subject matter, except where applicable law
            provides otherwise.
          </p>
          <p>
            Any ambiguities in the interpretation of these Terms shall not
            automatically be construed against either party.
          </p>
        </Section>

        <Section title="SECTION 18 - GOVERNING LAW">
          <p>
            These Terms and any separate agreements through which we provide
            Services shall be governed by the laws applicable to INFIBETTER's
            business operations, without depriving consumers of any
            mandatory protections or rights available under the laws of
            their country or place of residence.
          </p>
          <p>
            Any disputes shall be handled by the competent courts or
            authorities as determined under applicable law.
          </p>
        </Section>

        <Section title="SECTION 19 - CHANGES TO TERMS OF SERVICE">
          <p>
            You can review the most current version of these Terms at any
            time on this page.
          </p>
          <p>
            We reserve the right, at our discretion, to update, change, or
            replace any part of these Terms by posting updates and changes
            to our website. It is your responsibility to check our website
            periodically for changes. Your continued use of or access to
            our website or the Service following the posting of changes
            constitutes acceptance of those changes, where permitted by
            applicable law.
          </p>
        </Section>

        <Section title="SECTION 20 - CONTACT INFORMATION">
          <p>
            Questions about these Terms of Service should be sent to us
            using the contact details below:
          </p>
          <div className="mt-4 space-y-2">
            <p>
              <strong>Website:</strong>{" "}
              <a
                href="https://infibetter.com"
                className="underline underline-offset-2"
              >
                https://infibetter.com
              </a>
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:support@infibetter.com"
                className="underline underline-offset-2"
              >
                support@infibetter.com
              </a>
            </p>
          </div>
        </Section>

        <footer className="mt-14 border-t border-[#e8e8e8] pt-6 text-center text-[11px] text-[#888]">
          © {new Date().getFullYear()} INFIBETTER. All rights reserved.
        </footer>
      </div>
    </main>
  );
}

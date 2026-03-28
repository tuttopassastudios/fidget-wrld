import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'PepMax privacy policy. Learn how we collect, use, and protect your personal information when you use our research peptide services.',
};

const h2Style = { fontSize: 18, color: 'var(--color-text-primary)', marginBottom: 12, marginTop: 32 } as const;
const pStyle = { marginBottom: 16 } as const;
const strongStyle = { color: 'var(--color-text-primary)' } as const;

export default function PrivacyPage() {
  return (
    <section className="product-page" style={{ padding: '48px 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ marginBottom: 24 }}>Privacy Policy</h1>
        <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
          <p style={pStyle}>
            <strong style={strongStyle}>Effective Date:</strong> January&nbsp;1,&nbsp;2026
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Last Updated:</strong> March&nbsp;24,&nbsp;2026
          </p>
          <p style={pStyle}>
            PepMax (&ldquo;PepMax,&rdquo; &ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), is committed to protecting the privacy of individuals who visit our website at pepmax.com (the &ldquo;Site&rdquo;) and purchase our products. This Privacy Policy (&ldquo;Policy&rdquo;) describes how we collect, use, disclose, and safeguard your personal information. By accessing the Site or providing us with your information, you consent to the practices described herein.
          </p>

          <h2 style={h2Style}>1. Information We Collect</h2>
          <p style={pStyle}>
            <strong style={strongStyle}>Information You Provide Directly.</strong> When you place an order, create an account, or contact us, we may collect: your full name; email address; billing and shipping addresses; telephone number; and payment information (credit card number, expiration date, and security code). Payment card data is transmitted directly to our third-party payment processor and is not stored on our servers.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Information Collected Automatically.</strong> When you visit the Site, we automatically collect certain technical information, including: your Internet Protocol (IP) address; browser type and version; operating system; referring URL; pages viewed and time spent on each page; device identifiers; and approximate geographic location derived from your IP address.
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Cookies and Similar Technologies.</strong> We use cookies, web beacons, and similar tracking technologies to remember your preferences (such as age verification status), maintain your shopping cart, analyze Site traffic, and improve user experience. You may manage or disable cookies through your browser settings; however, doing so may impair certain Site functionality.
          </p>

          <h2 style={h2Style}>2. How We Use Your Information</h2>
          <p style={pStyle}>
            We use the information we collect for the following purposes: (a)&nbsp;to process and fulfill your orders, including sending order confirmations and shipping notifications; (b)&nbsp;to provide customer support and respond to inquiries; (c)&nbsp;to improve, maintain, and optimize the Site and our services; (d)&nbsp;to detect, prevent, and address fraud, unauthorized activity, or violations of our Terms and Conditions; (e)&nbsp;to comply with applicable legal obligations; and (f)&nbsp;to send transactional communications related to your account and orders. We do <strong style={strongStyle}>not</strong> sell, rent, or share your personal information with third parties for their direct marketing purposes.
          </p>

          <h2 style={h2Style}>3. Disclosure of Your Information</h2>
          <p style={pStyle}>
            We may disclose your personal information to the following categories of recipients: (a)&nbsp;<strong style={strongStyle}>Service providers</strong>&mdash;third-party vendors who assist us with payment processing, order fulfillment, shipping, website hosting, and analytics, each of whom is contractually obligated to use your information only for the purposes of providing services to us; (b)&nbsp;<strong style={strongStyle}>Legal compliance</strong>&mdash;when required by law, subpoena, court order, or governmental regulation, or when we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others; and (c)&nbsp;<strong style={strongStyle}>Business transfers</strong>&mdash;in connection with a merger, acquisition, reorganization, or sale of all or a portion of our assets, in which case your information may be transferred as part of that transaction.
          </p>

          <h2 style={h2Style}>4. Data Security</h2>
          <p style={pStyle}>
            We implement commercially reasonable administrative, technical, and physical safeguards designed to protect your personal information from unauthorized access, disclosure, alteration, or destruction, consistent with the requirements of A.R.S. &sect;&nbsp;18-551. All data transmitted between your browser and the Site is encrypted using 256-bit SSL/TLS encryption. In the event of a security breach involving your personal information, PepMax will notify affected Arizona residents within forty-five (45) days of the determination that a breach has occurred, as required by A.R.S. &sect;&nbsp;18-552. Notwithstanding the foregoing, no method of electronic transmission or storage is completely secure, and we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials.
          </p>

          <h2 style={h2Style}>5. Data Retention</h2>
          <p style={pStyle}>
            We retain your personal information for as long as reasonably necessary to fulfill the purposes for which it was collected, comply with our legal obligations, resolve disputes, and enforce our agreements. Order records are retained for a minimum of three (3) years for tax, regulatory, and dispute resolution purposes. When personal information is no longer required for its collected purpose or legal retention obligations, we will take reasonable steps to destroy, dispose of, or de-identify such records in accordance with A.R.S. &sect;&nbsp;18-551.
          </p>

          <h2 style={h2Style}>6. Third-Party Links &amp; Services</h2>
          <p style={pStyle}>
            The Site may contain links to third-party websites or integrate third-party services (e.g., payment processors, analytics providers). These third parties have their own privacy policies, and we are not responsible for their practices. We encourage you to review the privacy policies of any third-party services you interact with through the Site.
          </p>

          <h2 style={h2Style}>7. Children&rsquo;s Privacy</h2>
          <p style={pStyle}>
            The Site and our products are not intended for individuals under the age of twenty-one (21). We do not knowingly collect personal information from anyone under 21. If we become aware that we have collected information from an individual under 21, we will take prompt steps to delete such information.
          </p>

          <h2 style={h2Style}>8. Arizona Privacy Rights</h2>
          <p style={pStyle}>
            Under Arizona law (A.R.S. &sect;&nbsp;18-551 and &sect;&nbsp;18-552), you have specific rights regarding the protection of your personal information. For purposes of Arizona law, &ldquo;personal information&rdquo; means an individual&rsquo;s first name or first initial and last name in combination with one or more of the following: (a)&nbsp;Social Security number; (b)&nbsp;driver&rsquo;s license number or state identification card number; or (c)&nbsp;a financial account number or credit or debit card number in combination with any required security code, access code, or password that would permit access to the individual&rsquo;s financial account. If a data breach involving your personal information occurs, you will be notified within forty-five (45) days as required by A.R.S. &sect;&nbsp;18-552. You may also file a complaint with the Arizona Attorney General&rsquo;s Office, Consumer Protection Division, at (602)&nbsp;542-5763 or consumerinfo@azag.gov.
          </p>

          <h2 style={h2Style}>9. Your Rights &amp; Choices</h2>
          <p style={pStyle}>
            Depending on your jurisdiction, you may have certain rights regarding your personal information, including the right to: (a)&nbsp;access the personal information we hold about you; (b)&nbsp;request correction of inaccurate or incomplete information; (c)&nbsp;request deletion of your personal information, subject to applicable legal exceptions; and (d)&nbsp;opt out of certain data processing activities. To exercise any of these rights, please contact us at support@pepmax.com. We will respond to your request within a reasonable timeframe and in accordance with applicable law. We may request verification of your identity before processing your request.
          </p>

          <h2 style={h2Style}>10. Do Not Track Signals</h2>
          <p style={pStyle}>
            Certain web browsers may transmit &ldquo;Do Not Track&rdquo; (DNT) signals. At this time, the Site does not respond to DNT signals, as there is no industry-wide standard for compliance.
          </p>

          <h2 style={h2Style}>11. Changes to This Policy</h2>
          <p style={pStyle}>
            PepMax reserves the right to update or modify this Policy at any time. When we make material changes, we will update the &ldquo;Last Updated&rdquo; date at the top of this page. Your continued use of the Site following any changes constitutes your acceptance of the revised Policy. We encourage you to review this Policy periodically.
          </p>

          <h2 style={h2Style}>12. Contact Information</h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:<br />
            <strong style={strongStyle}>PepMax</strong><br />
            Email: support@pepmax.com
          </p>
        </div>
      </div>
    </section>
  );
}

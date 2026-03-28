import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'PepMax terms and conditions. Research use only requirements, ordering policies, shipping, returns, and legal disclaimers.',
};

const h2Style = { fontSize: 18, color: 'var(--color-text-primary)', marginBottom: 12, marginTop: 32 } as const;
const pStyle = { marginBottom: 16 } as const;
const strongStyle = { color: 'var(--color-text-primary)' } as const;

export default function TermsPage() {
  return (
    <section className="product-page" style={{ padding: '48px 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ marginBottom: 24 }}>Terms &amp; Conditions</h1>
        <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
          <p style={pStyle}>
            <strong style={strongStyle}>Effective Date:</strong> January&nbsp;1,&nbsp;2026
          </p>
          <p style={pStyle}>
            <strong style={strongStyle}>Last Updated:</strong> March&nbsp;24,&nbsp;2026
          </p>

          <h2 style={h2Style}>1. Agreement to Terms</h2>
          <p style={pStyle}>
            These Terms and Conditions (&ldquo;Agreement&rdquo;) constitute a legally binding agreement between you (&ldquo;Buyer,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and PepMax (&ldquo;PepMax,&rdquo; &ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), governing your access to and use of the website located at pepmax.com (the &ldquo;Site&rdquo;) and your purchase of any products offered thereon. By accessing or using the Site, placing an order, or otherwise engaging with our services, you acknowledge that you have read, understood, and agree to be bound by this Agreement. If you do not agree to these terms, you must immediately discontinue use of the Site and refrain from purchasing any products.
          </p>

          <h2 style={h2Style}>2. Intended Use &mdash; Research Purposes Only</h2>
          <p style={pStyle}>
            All products sold by PepMax are intended <strong style={strongStyle}>exclusively for in&nbsp;vitro laboratory research purposes</strong>. Products are <strong style={strongStyle}>NOT</strong> intended for human or animal consumption, veterinary use, therapeutic or diagnostic applications, food or cosmetic use, or any in&nbsp;vivo application. By placing an order, you represent and warrant that: (a)&nbsp;you are a qualified researcher, scientist, or individual affiliated with an accredited research institution, laboratory, or educational facility; (b)&nbsp;the products will be used solely for lawful in&nbsp;vitro research purposes; and (c)&nbsp;you will not resell, redistribute, or transfer any product for any purpose inconsistent with this Section. PepMax reserves the right to refuse or cancel any order where it reasonably believes the products may be used in violation of these restrictions.
          </p>

          <h2 style={h2Style}>3. Eligibility &amp; Age Requirement</h2>
          <p style={pStyle}>
            You must be at least twenty-one (21) years of age to purchase products from PepMax. By placing an order, you represent and warrant that you meet this age requirement and that you have the legal capacity to enter into this Agreement. PepMax reserves the right to request verification of age and professional credentials at any time and to refuse service to any individual who cannot provide satisfactory proof of eligibility.
          </p>

          <h2 style={h2Style}>4. Product Information &amp; Disclaimers</h2>
          <p style={pStyle}>
            PepMax makes no claims, representations, or warranties&mdash;express or implied&mdash;regarding the therapeutic, pharmacological, diagnostic, or medicinal properties of any product. All products are sold in lyophilized (freeze-dried) powder form for reconstitution by the end user. Certificates of Analysis (&ldquo;COA&rdquo;) are provided with every order and reflect third-party analytical testing, including High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry (MS). While we make commercially reasonable efforts to ensure the accuracy of product descriptions, imagery, and specifications, we do not warrant that such information is error-free. PepMax is not a pharmacy, compounding facility, or medical provider, and nothing on this Site shall be construed as medical advice or a recommendation for any particular use.
          </p>

          <h2 style={h2Style}>5. Orders, Pricing &amp; Payment</h2>
          <p style={pStyle}>
            All orders placed through the Site are subject to acceptance and availability. PepMax reserves the right to refuse, limit, or cancel any order at its sole discretion, including orders that appear to violate this Agreement. Prices are listed in United States Dollars (USD) and are subject to change without prior notice; however, pricing changes will not affect orders that have already been confirmed. Applicable taxes, including Arizona Transaction Privilege Tax (TPT) where required, will be calculated and applied at checkout. If you are located outside of Arizona, you may be responsible for remitting any applicable use tax to your jurisdiction. Payment must be made in full at the time of purchase. All transactions are processed using industry-standard 256-bit SSL/TLS encryption. You agree to provide current, complete, and accurate billing and payment information. PepMax is not responsible for any fees imposed by your financial institution.
          </p>

          <h2 style={h2Style}>6. Shipping &amp; Delivery</h2>
          <p style={pStyle}>
            Orders are generally processed and dispatched within two (2) business days of payment confirmation. All products are packaged in accordance with applicable shipping regulations to maintain product integrity during transit. Complimentary standard shipping is available on orders exceeding $150.00 USD within the continental United States. Shipping timelines are estimates and not guarantees; PepMax shall not be liable for delays caused by carriers, customs, weather, or force majeure events. Title and risk of loss pass to the Buyer upon delivery to the carrier. It is the Buyer&rsquo;s responsibility to provide an accurate shipping address; PepMax is not responsible for orders delivered to incorrect addresses provided by the Buyer.
          </p>

          <h2 style={h2Style}>7. Returns &amp; Refunds</h2>
          <p style={pStyle}>
            Due to the nature of research chemicals, all sales are final once the product has been shipped. If you receive a product that is damaged during transit or does not conform to its Certificate of Analysis, you must notify PepMax within seven (7) calendar days of delivery by contacting support@pepmax.com with your order number and photographic evidence of the issue. PepMax will, at its sole discretion, issue a replacement or a store credit for the affected product. Refunds to the original payment method may be issued on a case-by-case basis. Products that have been opened, solubilized, or otherwise altered are not eligible for return.
          </p>

          <h2 style={h2Style}>8. Intellectual Property</h2>
          <p style={pStyle}>
            All content on the Site&mdash;including but not limited to text, graphics, logos, images, product descriptions, and software&mdash;is the property of PepMax or its licensors and is protected by United States and international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise exploit any Site content without the prior written consent of PepMax.
          </p>

          <h2 style={h2Style}>9. Limitation of Liability</h2>
          <p style={pStyle}>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PEPMAX LLC, ITS OFFICERS, DIRECTORS, MEMBERS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SITE, YOUR PURCHASE OR USE OF ANY PRODUCT, OR THIS AGREEMENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER LEGAL THEORY, EVEN IF PEPMAX HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL PEPMAX&rsquo;S TOTAL AGGREGATE LIABILITY EXCEED THE AMOUNT ACTUALLY PAID BY YOU FOR THE SPECIFIC PRODUCT GIVING RISE TO THE CLAIM.
          </p>

          <h2 style={h2Style}>10. Assumption of Risk &amp; Indemnification</h2>
          <p style={pStyle}>
            The Buyer assumes all risk associated with the handling, storage, and use of products purchased from PepMax. You agree to indemnify, defend, and hold harmless PepMax, its officers, directors, members, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys&rsquo; fees) arising out of or related to: (a)&nbsp;your use or misuse of any product; (b)&nbsp;your breach of this Agreement; (c)&nbsp;your violation of any applicable law or regulation; or (d)&nbsp;any third-party claim related to your use of the products.
          </p>

          <h2 style={h2Style}>11. Disclaimer of Warranties</h2>
          <p style={pStyle}>
            THE SITE AND ALL PRODUCTS ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. PEPMAX DOES NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. THE BUYER ACKNOWLEDGES THAT PEPMAX MAKES NO REPRESENTATIONS REGARDING THE SUITABILITY OF ANY PRODUCT FOR ANY PARTICULAR RESEARCH APPLICATION.
          </p>

          <h2 style={h2Style}>12. Governing Law &amp; Dispute Resolution</h2>
          <p style={pStyle}>
            This Agreement shall be governed by and construed in accordance with the laws of the State of Arizona, without regard to its conflict of law principles. Any dispute, claim, or controversy arising out of or relating to this Agreement or the breach, termination, or validity thereof shall be resolved exclusively in the Maricopa County Superior Court or the United States District Court for the District of Arizona, and you hereby consent to the personal jurisdiction and venue of such courts. You agree that any cause of action arising out of or related to this Agreement must be commenced within one (1) year after the cause of action accrues; otherwise, such cause of action is permanently barred.
          </p>

          <h2 style={h2Style}>13. Arizona Consumer Rights</h2>
          <p style={pStyle}>
            Under the Arizona Consumer Fraud Act (A.R.S. &sect;&nbsp;44-1521 et seq.), consumers are protected against deception, deceptive or unfair acts or practices in connection with the sale or advertisement of merchandise. If you believe that PepMax has engaged in any unlawful practice, you have the right to file a complaint with the Arizona Attorney General&rsquo;s Office, Consumer Protection Division. You may reach the Consumer Protection Division at: (602)&nbsp;542-5763, consumerinfo@azag.gov, or by mail at 2005&nbsp;N.&nbsp;Central Ave., Phoenix,&nbsp;AZ&nbsp;85004. Nothing in this Agreement is intended to limit or waive any rights you may have under Arizona state law.
          </p>

          <h2 style={h2Style}>14. Severability</h2>
          <p style={pStyle}>
            If any provision of this Agreement is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be modified to the minimum extent necessary to make it enforceable, or if modification is not possible, severed from this Agreement, and the remaining provisions shall continue in full force and effect.
          </p>

          <h2 style={h2Style}>15. Entire Agreement &amp; Amendments</h2>
          <p style={pStyle}>
            This Agreement, together with our Privacy Policy, constitutes the entire agreement between you and PepMax with respect to the subject matter hereof and supersedes all prior or contemporaneous communications, proposals, and agreements, whether oral or written. PepMax reserves the right to modify this Agreement at any time by posting the revised terms on the Site with an updated &ldquo;Last Updated&rdquo; date. Your continued use of the Site following any such modification constitutes your acceptance of the revised terms.
          </p>

          <h2 style={h2Style}>16. Contact Information</h2>
          <p>
            If you have any questions or concerns regarding this Agreement, please contact us at:<br />
            <strong style={strongStyle}>PepMax</strong><br />
            Email: support@pepmax.com
          </p>
        </div>
      </div>
    </section>
  );
}

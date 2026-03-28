import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="footer-minimal">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="header-logo" style={{ fontSize: '1.25rem' }}>
              <Image src="/images/fidget-wrld-logo.png" alt="Fidget WRLD" width={120} height={80} sizes="120px" />
            </Link>
            <p>Premium fidget toys for focus, relaxation, and fun. Satisfying textures and endless entertainment for all ages.</p>
          </div>
          <div className="footer-col">
            <h5>Shop</h5>
            <ul>
              <li><Link href="/products?category=all">All Fidgets</Link></li>
              <li><Link href="/products?category=Magnetic">Magnetic</Link></li>
              <li><Link href="/products?category=Squishy">Squishy</Link></li>
              <li><Link href="/products?category=Clicky">Clicky</Link></li>
              <li><Link href="/products?category=Desk+Toys">Desk Toys</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Shop By</h5>
            <ul>
              <li><Link href="/products?mood=calm">For Calm</Link></li>
              <li><Link href="/products?mood=focus">For Focus</Link></li>
              <li><Link href="/products?audience=kids">For Kids</Link></li>
              <li><Link href="/products?audience=office">For Office</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Support</h5>
            <ul>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/faq#shipping">Shipping</Link></li>
              <li><Link href="/faq#returns">Returns</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <ul>
              <li><Link href="/disclaimer">Disclaimer</Link></li>
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-legal">&copy; 2026 Fidget WRLD. All rights reserved.</span>
          <span className="footer-legal">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

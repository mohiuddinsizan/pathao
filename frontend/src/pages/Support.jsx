import { MessageCircle, Phone, Mail, HelpCircle, MessageSquare } from 'lucide-react'
import Layout from '../components/Layout'
import styles from './Support.module.css'

const faqItems = [
  { q: 'How do I track my deliveries?', a: 'You can track all your deliveries in real-time from the Dashboard or Deliveries page. Each delivery shows the current location and estimated arrival time.' },
  { q: 'What is your refund policy?', a: 'Refunds are processed within 5-7 business days. Contact support for any refund requests with your order ID.' },
  { q: 'How do I report an issue?', a: 'You can report issues through the Support page or contact our support team directly. We respond to all inquiries within 24 hours.' },
  { q: 'Can I schedule pickups?', a: 'Yes! You can schedule pickups in advance from the Pickups page. Select your preferred date and time, and we\'ll assign a rider.' },
]

export default function Support() {
  return (
    <Layout activePage="support">
      <div className={styles.container}>
      <header className={styles.header}>
        <h1>Support & Help</h1>
        <p>Get help with your Pathao Merchant account</p>
      </header>

      <div className={styles.contactCards}>
        <div className={styles.card}>
          <Phone size={32} color="#EF4444" />
          <h3>Call Us</h3>
          <p>+880 1700-000000</p>
          <small>Available 24/7</small>
        </div>
        <div className={styles.card}>
          <Mail size={32} color="#3B82F6" />
          <h3>Email Support</h3>
          <p>support@pathao.com</p>
          <small>Response in 24 hours</small>
        </div>
        <div className={styles.card}>
          <MessageSquare size={32} color="#F59E0B" />
          <h3>Live Chat</h3>
          <p>Chat with our team</p>
          <small>9 AM - 9 PM</small>
        </div>
        <div className={styles.card}>
          <MessageCircle size={32} color="#10B981" />
          <h3>WhatsApp</h3>
          <p>+880 1700-111111</p>
          <small>Quick responses</small>
        </div>
      </div>

      <div className={styles.ticketForm}>
        <h2>Create a Support Ticket</h2>
        <form className={styles.form}>
          <div className={styles.formGroup}>
            <label>Subject</label>
            <input type="text" placeholder="Briefly describe your issue" />
          </div>
          <div className={styles.formGroup}>
            <label>Category</label>
            <select>
              <option>Select a category</option>
              <option>Delivery Issue</option>
              <option>Payment Question</option>
              <option>Account Problem</option>
              <option>Other</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Priority</label>
            <select>
              <option>Normal</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea placeholder="Provide detailed information about your issue..." rows="6"></textarea>
          </div>
          <button type="submit" className={styles.submitBtn}>Submit Ticket</button>
        </form>
      </div>

      <div className={styles.faqSection}>
        <h2>Frequently Asked Questions</h2>
        <div className={styles.faqList}>
          {faqItems.map((item, idx) => (
            <details key={idx} className={styles.faqItem}>
              <summary>
                <HelpCircle size={18} color="#EF4444" />
                <span>{item.q}</span>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      <div className={styles.statusSection}>
        <h2>System Status</h2>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <span className={styles.indicator} style={{ background: '#10B981' }}></span>
            <div>
              <div className={styles.service}>Pathao App</div>
              <small>All systems operational</small>
            </div>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.indicator} style={{ background: '#10B981' }}></span>
            <div>
              <div className={styles.service}>Merchant Portal</div>
              <small>All systems operational</small>
            </div>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.indicator} style={{ background: '#10B981' }}></span>
            <div>
              <div className={styles.service}>Payment System</div>
              <small>All systems operational</small>
            </div>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.indicator} style={{ background: '#10B981' }}></span>
            <div>
              <div className={styles.service}>API Services</div>
              <small>All systems operational</small>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  )
}

import { useState } from 'react'
import { CreditCard, Wallet, Download, Filter, X, Eye } from 'lucide-react'
import Layout from '../components/Layout'
import styles from './Payments.module.css'
import { PAYMENT_HISTORY, getStore } from '../data/constants'

const PaymentDetailsModal = ({ payment, isOpen, onClose }) => {
  if (!isOpen || !payment) return null

  const store = getStore(payment.store)

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#0b0b0b',
          border: '1px solid #222',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          color: '#e5e7eb',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            borderBottom: '1px solid #222',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#f9fafb' }}>
            Payment Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              color: '#9ca3af',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Transaction Info */}
          <div style={{ backgroundColor: '#111', padding: '16px', borderRadius: '8px', border: '1px solid #222' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Transaction ID</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#f9fafb' }}>{payment.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Date</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#f9fafb' }}>
                {new Date(payment.date).toLocaleDateString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Amount</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>
                ৳ {payment.amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              Payment Method
            </h3>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#f9fafb', margin: 0 }}>
              {payment.method}
            </p>
          </div>

          {/* Reference */}
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              Reference
            </h3>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#f9fafb', margin: 0 }}>
              {payment.ref}
            </p>
          </div>

          {/* Store Info */}
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              Store
            </h3>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#f9fafb', margin: '0 0 4px 0' }}>
              {store?.name}
            </p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
              Branch: {store?.branch}
            </p>
          </div>

          {/* Deliveries Info */}
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              Deliveries
            </h3>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#f9fafb', margin: 0 }}>
              {payment.deliveries} deliveries
            </p>
          </div>

          {/* Status */}
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              Status
            </h3>
            <span
              style={{
                display: 'inline-block',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: payment.status === 'completed' ? '#14532d' : '#713f12',
                color: '#f9fafb',
              }}
            >
              {payment.status === 'completed' && 'Completed'}
              {payment.status === 'processing' && 'Processing'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            padding: '16px 24px',
            borderTop: '1px solid #222',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              border: '1px solid #2b2b2b',
              backgroundColor: '#0f0f0f',
              color: '#e5e7eb',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#111'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#0f0f0f'
            }}
          >
            Close
          </button>
          <button
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#2563eb'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#3b82f6'
            }}
          >
            Export Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Payments() {
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedPayment(null), 300)
  }
  return (
    <Layout activePage="payments">
      <div className={styles.container}>
      <header className={styles.header}>
        <h1>Payments & Settlements</h1>
        <button className={styles.downloadBtn}>
          <Download size={16} />
          Download Statement
        </button>
      </header>

      <div className={styles.accountCard}>
        <div className={styles.balance}>
          <div className={styles.label}>Current Balance</div>
          <div className={styles.amount}>৳ 45,230</div>
        </div>
        <div className={styles.split}>
          <div className={styles.item}>
            <Wallet size={20} color="#3B82F6" />
            <div>
              <div className={styles.label}>Available</div>
              <div className={styles.value}>৳ 45,230</div>
            </div>
          </div>
          <div className={styles.item}>
            <CreditCard size={20} color="#10B981" />
            <div>
              <div className={styles.label}>This Month Earnings</div>
              <div className={styles.value}>৳ 187,450</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.filtersBar}>
        <h3>Payment History</h3>
        <button className={styles.filterBtn}>
          <Filter size={16} />
          Filter
        </button>
      </div>

      <div className={styles.table}>
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {PAYMENT_HISTORY.map((payment) => (
              <tr key={payment.id}>
                <td className={styles.id}>{payment.id}</td>
                <td>{new Date(payment.date).toLocaleDateString()}</td>
                <td className={styles.amount}>৳ {payment.amount.toLocaleString()}</td>
                <td>
                  <span className={`${styles.status} ${styles[payment.status]}`}>
                    {payment.status === 'completed' && 'Completed'}
                    {payment.status === 'processing' && 'Processing'}
                  </span>
                </td>
                <td>{payment.method}</td>
                <td className={styles.ref}>{payment.ref}</td>
                <td>
                  <button 
                    className={styles.viewBtn}
                    onClick={() => handleViewPayment(payment)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.settingsSection}>
        <h3>Payment Settings</h3>
        <div className={styles.settingItem}>
          <div>
            <div className={styles.label}>Payout Account</div>
            <div className={styles.desc}>Brac Bank - 1234 5678 9012</div>
          </div>
          <button className={styles.editBtn}>Change</button>
        </div>
        <div className={styles.settingItem}>
          <div>
            <div className={styles.label}>Auto Settlement</div>
            <div className={styles.desc}>Daily at 11:00 PM</div>
          </div>
          <button className={styles.editBtn}>Edit</button>
        </div>
      </div>
      </div>

      <PaymentDetailsModal payment={selectedPayment} isOpen={isModalOpen} onClose={handleCloseModal} />
    </Layout>
  )
}

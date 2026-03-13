import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Star, Check } from 'lucide-react'
import styles from './Register.module.css'

export default function Register() {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('1712345678')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(45)
  const [businessName, setBusinessName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [address, setAddress] = useState('')
  const [district, setDistrict] = useState('')
  const [landmark, setLandmark] = useState('')
  const [toast, setToast] = useState('')
  
  const otpRefs = useRef([])
  const navigate = useNavigate()

  useEffect(() => {
    let timer
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [step, countdown])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const goToStep = (newStep) => {
    setStep(newStep)
    if (newStep === 2) {
      setCountdown(45)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    }
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const fillDemoOtp = () => {
    setOtp(['1', '2', '3', '4', '5', '6'])
    showToast('Demo OTP filled')
  }

  const verifyOTP = () => {
    if (otp.join('') === '123456') {
      goToStep(3)
    } else {
      showToast('Invalid OTP. Try 123456')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    }
  }

  const resendOTP = () => {
    setCountdown(45)
    showToast('New OTP sent')
  }

  const completeRegistration = () => {
    const name = businessName || 'New Store'
    localStorage.setItem('merchant_logged_in', 'true')
    localStorage.setItem('merchant_name', name)
    localStorage.setItem('merchant_address', address)
    goToStep(5)
  }

  const goToDashboard = () => {
    navigate('/dashboard')
  }

  const progressClass = (stepNum) => {
    if (step > stepNum || step === 5) return styles.done
    if (step === stepNum) return styles.active
    return ''
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Star size={24} fill="white" stroke="white" />
          </div>
          <span className={styles.logoText}>PATHAO</span>
        </div>

        <div className={styles.progress}>
          <div className={`${styles.progressStep} ${progressClass(1)}`} />
          <div className={`${styles.progressStep} ${progressClass(2)}`} />
          <div className={`${styles.progressStep} ${progressClass(3)}`} />
          <div className={`${styles.progressStep} ${progressClass(4)}`} />
        </div>

        {/* Step 1: Phone */}
        {step === 1 && (
          <div className={styles.step}>
            <h2>Create Account</h2>
            <p className={styles.subtitle}>Enter your phone number to get started</p>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number</label>
              <div className={styles.phoneInput}>
                <div className={styles.phonePrefix}>🇧🇩 +880</div>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="1XXXXXXXXX"
                  maxLength={10}
                  inputMode="numeric"
                />
              </div>
            </div>
            <button className={styles.btn} onClick={() => goToStep(2)}>Send OTP</button>
            <p className={styles.loginLink}>
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <div className={styles.step}>
            <h2>Verify Phone</h2>
            <p className={styles.subtitle}>Enter the 6-digit code sent to +880 {phone}</p>
            <div className={styles.otpInputs}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                />
              ))}
            </div>
            <p className={styles.timer}>
              Demo OTP: <button onClick={fillDemoOtp} className={styles.linkBtn}>Use 123456</button>
            </p>
            <p className={styles.timer}>
              {countdown > 0 ? (
                <>Resend code in {countdown}s</>
              ) : (
                <button onClick={resendOTP} className={styles.linkBtn}>Resend Code</button>
              )}
            </p>
            <div className={styles.btnRow}>
              <button className={styles.btnSecondary} onClick={() => goToStep(1)}>Back</button>
              <button className={styles.btn} onClick={verifyOTP}>Verify</button>
            </div>
          </div>
        )}

        {/* Step 3: Business Info */}
        {step === 3 && (
          <div className={styles.step}>
            <h2>Business Details</h2>
            <p className={styles.subtitle}>Tell us about your business</p>
            <div className={styles.formGroup}>
              <label htmlFor="businessName">Business Name</label>
              <input
                type="text"
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Store Name"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="ownerName">Your Name</label>
              <input
                type="text"
                id="ownerName"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Owner / Manager Name"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="businessType">Business Type</label>
              <select
                id="businessType"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              >
                <option value="">Select type...</option>
                <option value="ecommerce">E-commerce Store</option>
                <option value="retail">Retail Shop</option>
                <option value="restaurant">Restaurant</option>
                <option value="grocery">Grocery</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email (Optional)</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="For invoices and reports"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Create Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
              />
            </div>
            <div className={styles.btnRow}>
              <button className={styles.btnSecondary} onClick={() => goToStep(2)}>Back</button>
              <button className={styles.btn} onClick={() => goToStep(4)}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 4: Pickup Location */}
        {step === 4 && (
          <div className={styles.step}>
            <h2>Pickup Location</h2>
            <p className={styles.subtitle}>Where should riders collect parcels?</p>
            <div className={styles.formGroup}>
              <label htmlFor="address">Full Address</label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/Floor, Road, Area"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="district">District</label>
              <select
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="">Select district...</option>
                <option value="dhaka">Dhaka</option>
                <option value="chittagong">Chittagong</option>
                <option value="sylhet">Sylhet</option>
                <option value="rajshahi">Rajshahi</option>
                <option value="khulna">Khulna</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="landmark">Landmark (Optional)</label>
              <input
                type="text"
                id="landmark"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Near ABC Market..."
              />
            </div>
            <div className={styles.btnRow}>
              <button className={styles.btnSecondary} onClick={() => goToStep(3)}>Back</button>
              <button className={styles.btn} onClick={completeRegistration}>Complete Setup</button>
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className={styles.step}>
            <div className={styles.successIcon}>
              <Check size={40} strokeWidth={2} />
            </div>
            <h2>You're All Set</h2>
            <p className={styles.subtitle}>Your merchant account has been created successfully</p>
            <button className={styles.btn} onClick={goToDashboard}>Go to Dashboard</button>
            <button className={styles.btnSecondary} style={{ marginTop: '10px' }} onClick={goToDashboard}>
              Create First Order
            </button>
          </div>
        )}
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}

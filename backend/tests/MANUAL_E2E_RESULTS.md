# Manual E2E Test Results

**Date:** 2026-03-18  
**Tester:** 2105039  
**Environment:** localhost (MERN + FastAPI backend)

---

##  Summary

End-to-end testing was conducted on the Pathao Parcel Management System.  
Most core features are functional and stable. However, a critical issue was identified in the **Create Parcel confirmation flow** affecting both mobile and desktop views.

---

##  Test Results

| # | Test | Status | Notes |
|---|------|--------|-------|
| 1 | Register a new account → lands on dashboard | PASS | Account created successfully |
| 2 | Logout → redirected to /login | PASS | Session cleared correctly |
| 3 | Login with valid creds → dashboard visible | PASS | Token auth works |
| 4 | Login with wrong password → error message shown | PASS | Proper validation |
| 5 | Refresh page while logged in → stays logged in | PASS | Session persisted |

### Dashboard
| 6 | KPI stat cards show numeric values | PASS | Data loads correctly |
| 7 | Recent orders table shows rows | PASS | Dynamic data present |
| 8 | Area/bar chart renders | PASS | Charts load properly |

### Create Parcel
| 9 | Click "Create Parcel" → page loads | PASS | Navigation works |
| 10 | Submit empty form → validation errors | PASS | Form validation OK |
| 11 | Submit valid form → order created | PARTIAL | Mobile skips review step; desktop confirm sometimes does nothing |
| 12 | Created order has status "pending" | PARTIAL | Depends on confirmation flow success |

### Deliveries
| 13 | Orders page shows paginated list | PASS | Pagination working |
| 14 | Status filter buttons filter list | PASS | Filtering works |
| 15 | Search narrows results | PASS | Search functional |
| 16 | Store filter dropdown shows stores | PASS | Data correct |
| 17 | Store filter works correctly | PASS | Filtering accurate |
| 18 | Clicking row → detail page | PASS | Routing correct |

### Order Detail
| 19 | Order detail page loads | PASS | Data fetched correctly |
| 20 | Recipient + parcel info visible | PASS | UI correct |
| 21 | Status timeline shows entries | PASS | History working |
| 22 | Simulation buttons show valid states | PASS | Logic correct |
| 23 | Status update works + timeline updates | PASS | Real-time update OK |
| 24 | Full lifecycle works (pending → delivered) | PASS | Flow validated |

### Stores
| 27 | Stores page shows store cards | PASS | Data visible |
| 28 | Add Store opens modal | PASS | UI correct |
| 29 | Creating store updates list | PASS | DB + UI sync |
| 30 | Edit store works | PASS | Update successful |
| 31 | Updated data reflects correctly | PASS | UI consistent |
| 32 | Deactivate store works | PASS | Soft delete works |
| 33 | Inactive store visually distinct | PASS | UX correct |

### Analytics
| 34 | Analytics page loads | PASS | No errors |
| 35 | Orders by Status chart renders | PASS | Chart OK |
| 36 | Last 7 Days chart shows data | PASS | Trend visible |
| 37 | Top Stores table shows data | PASS | Aggregation correct |

### Theme (Dark / Light)
| 38 | Theme toggle switches appearance | PASS | Toggle works |
| 39 | All pages readable in dark mode | PASS | UI consistent |
| 40 | Theme persists after refresh | PASS | Local storage works |

### Cross-Cutting
| 41 | Sidebar navigation works | PASS | Routing stable |
| 42 | Design consistency (colors) | PASS | UI uniform |
| 43 | No broken/empty pages | PASS | No major issues |
| 44 | Mobile responsiveness | PASS | Layout adapts well (except confirmation flow) |

---

##  Issues Found During Manual Testing

###  BUG-01: Mobile viewport skips review step
- **Area:** Create Parcel / Review & Confirm  
- **Environment:** Mobile viewport (browser inspect mode)  
- **Steps to reproduce:**
  1. Go to Create Parcel flow
  2. Switch browser to mobile view
  3. Fill order information
  4. Continue from payment/charge step  
- **Expected:** User should go to Review & Confirm page before final submission  
- **Actual:** Order is confirmed immediately, skipping review page  
- **Severity:** Medium  

---

###  BUG-02: Confirm button not working (desktop)
- **Area:** Create Parcel / Review & Confirm  
- **Environment:** Desktop view  
- **Steps to reproduce:**
  1. Go to final Review & Confirm page  
  2. Click "Confirm" button  
- **Expected:** Order should be submitted or show an error  
- **Actual:** Nothing happens — no success message, no error, no navigation  
- **Severity:** High  

---

##  Final Evaluation

- Core backend APIs are stable and working correctly  
- Most frontend features function as expected  
- Critical issue exists in **order confirmation flow**  
- UI/UX is consistent and responsive across pages  

---

##  Conclusion

The system is **functionally complete and demo-ready**, but requires fixes in the **Create Parcel confirmation workflow** to ensure reliability across devices.
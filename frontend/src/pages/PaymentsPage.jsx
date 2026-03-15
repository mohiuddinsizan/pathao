import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Banknote, Package, CreditCard } from 'lucide-react'

const methodColors = {
  cod: 'warning',
  prepaid: 'info',
  online: 'success',
  bkash: 'success',
}

const statusColors = {
  pending: 'warning',
  assigned: 'info',
  picked_up: 'info',
  in_transit: 'info',
  delivered: 'success',
  cancelled: 'destructive',
}

export default function PaymentsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    setLoading(true)
    api.get(`/api/payments?page=${page}&limit=${limit}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading payments…</p>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Transaction history for all your orders
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{data?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">৳{(data?.total_revenue ?? 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Order ID</th>
                  <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Recipient</th>
                  <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Amount</th>
                  <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Payment Method</th>
                  <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.payments?.length > 0 ? (
                  data.payments.map((item) => (
                    <tr
                      key={item.order_id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors duration-150 cursor-pointer"
                      onClick={() => navigate(`/deliveries/${item.order_id}`)}
                    >
                      <td className="py-3 px-4 font-mono text-xs font-semibold">{item.order_id}</td>
                      <td className="py-3 px-4 font-medium">{item.recipient_name || '—'}</td>
                      <td className="py-3 px-4">৳{Number(item.amount).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge variant={methodColors[item.payment_method] || 'secondary'}>
                          {(item.payment_method || 'unknown').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={statusColors[item.status] || 'secondary'}>
                          {(item.status || 'unknown').replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No payment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="cursor-pointer"
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={page * limit >= (data?.total ?? 0)}
          className="cursor-pointer"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

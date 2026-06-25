import { createClient } from '@supabase/supabase-js'

export async function cleanupStaleOrders() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { data: staleOrders, error } = await supabase
    .from('orders')
    .select('id')
    .eq('status', 'pending')
    .eq('payment_status', 'unpaid')
    .is('payment_id', null)
    .lt('created_at', oneHourAgo)

  if (error) {
    console.error('cleanupStaleOrders query error:', error)
    return
  }

  if (staleOrders && staleOrders.length > 0) {
    const staleIds = staleOrders.map((o: any) => o.id)

    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .in('order_id', staleIds)

    if (itemsError) {
      console.error('cleanupStaleOrders: failed to delete order_items:', itemsError)
      return
    }

    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .in('id', staleIds)

    if (ordersError) {
      console.error('cleanupStaleOrders: failed to delete orders:', ordersError)
    }
  }
}

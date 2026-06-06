import { createClient } from '@supabase/supabase-js'

export async function cleanupStaleOrders() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { data: staleOrders } = await supabase
    .from('orders')
    .select('id')
    .eq('status', 'pending')
    .eq('payment_status', 'unpaid')
    .lt('created_at', oneHourAgo)

  if (staleOrders && staleOrders.length > 0) {
    const staleIds = staleOrders.map((o: any) => o.id)

    await supabase
      .from('order_items')
      .delete()
      .in('order_id', staleIds)

    await supabase
      .from('orders')
      .delete()
      .in('id', staleIds)
  }
}

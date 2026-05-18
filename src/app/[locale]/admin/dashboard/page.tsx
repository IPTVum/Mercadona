
import { createServerClientSSR } from '@/lib/supabase-server'
import { getTranslations } from 'next-intl/server'
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  FileText,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Link } from '@/i18n/routing'

async function getStats() {
  const supabase = await createServerClientSSR()

  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .not('status', 'in', '(cancelled,pending)')

  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { data: orders } = await supabase
    .from('orders')
    .select('id, total, created_at, status')
    .not('status', 'in', '(cancelled,pending)')
    .order('created_at', { ascending: false })
    .limit(30)

  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0

  return {
    productsCount: productsCount || 0,
    ordersCount: ordersCount || 0,
    usersCount: usersCount || 0,
    totalRevenue,
    recentOrders: orders?.slice(0, 5) || [],
  }
}

export default async function AdminDashboard() {
  const t = await getTranslations('admin.dashboard')
  const stats = await getStats()

  const statCards = [
    {
      title: t('totalRevenue'),
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12.5%',
      trend: 'up',
    },
    {
      title: t('totalOrders'),
      value: stats.ordersCount.toString(),
      icon: ShoppingCart,
      color: 'bg-blue-500',
      change: '+8.2%',
      trend: 'up',
    },
    {
      title: t('totalProducts'),
      value: stats.productsCount.toString(),
      icon: Package,
      color: 'bg-purple-500',
      change: '+4.1%',
      trend: 'up',
    },
    {
      title: t('totalUsers'),
      value: stats.usersCount.toString(),
      icon: Users,
      color: 'bg-orange-500',
      change: '+15.3%',
      trend: 'up',
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
        <p className="text-gray-500">{t('welcomeBack')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 ${stat.color} rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1">
              {stat.trend === 'up' ? (
                <ArrowUpRight className="text-green-500" size={16} />
              ) : (
                <ArrowDownRight className="text-red-500" size={16} />
              )}
              <span className={`text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
              <span className="text-gray-500 text-sm ml-1">{t('vsLastMonth')}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">{t('recentOrders')}</h2>
            <Link href="/admin/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              {t('viewAll')}
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(Number(order.total))}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                {t('noOrders')}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">{t('quickActions')}</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <Link href="/admin/products?action=new" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
              <Package className="mx-auto text-primary-600 mb-2" size={24} />
              <p className="font-medium">{t('addProduct')}</p>
            </Link>
            <Link href="/admin/orders" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
              <ShoppingCart className="mx-auto text-blue-600 mb-2" size={24} />
              <p className="font-medium">{t('viewOrders')}</p>
            </Link>
            <Link href="/admin/coupons?action=new" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
              <Tag className="mx-auto text-green-600 mb-2" size={24} />
              <p className="font-medium">{t('createCoupon')}</p>
            </Link>
            <Link href="/admin/blogs?action=new" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
              <FileText className="mx-auto text-purple-600 mb-2" size={24} />
              <p className="font-medium">{t('newBlogPost')}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

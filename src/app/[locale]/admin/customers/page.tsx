'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import {
  Search,
  Mail,
  Phone,
  Globe,
  MapPin,
  Loader2,
  Users,
  ShoppingCart,
  DollarSign,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  ExternalLink,
} from 'lucide-react'
import type { Profile } from '@/types'

interface CustomerWithStats extends Profile {
  order_count: number
  total_spent: number
  country: string
  city: string
}

function extractCountry(address: Record<string, any> | null): string {
  if (!address) return ''
  return address.country || address.Country || address.pays || ''
}

function extractCity(address: Record<string, any> | null): string {
  if (!address) return ''
  return address.city || address.City || address.ville || ''
}

export default function AdminCustomersPage() {
  const t = useTranslations('admin.customers')
  const tc = useTranslations('common')
  const supabase = useMemo(() => createClient(), [])
  const [customers, setCustomers] = useState<CustomerWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set(['']))
  const [selectedCountry, setSelectedCountry] = useState('')

  useEffect(() => { loadCustomers() }, [supabase])

  const loadCustomers = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })

    if (!profiles) { setLoading(false); return }

    const enriched: CustomerWithStats[] = []
    for (const p of profiles) {
      const { data: orders } = await supabase
        .from('orders')
        .select('total, shipping_address')
        .eq('user_id', p.id)

      const country = extractCountry(p.shipping_address) || extractCountry(p.billing_address)
      const city = extractCity(p.shipping_address) || extractCity(p.billing_address)
      enriched.push({
        ...p,
        country,
        city,
        order_count: orders?.length || 0,
        total_spent: orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
      })
    }

    setCustomers(enriched)
    setLoading(false)
    setExpandedCountries(new Set(['']))
  }

  // Deduplicate countries
  const countries = useMemo(() => {
    const set = new Set<string>()
    customers.forEach((c) => { if (c.country) set.add(c.country) })
    return Array.from(set).sort()
  }, [customers])

  const filtered = useMemo(() => {
    let result = customers
    if (search) {
      const s = search.toLowerCase()
      result = result.filter((c) =>
        (c.full_name || '').toLowerCase().includes(s) ||
        (c.email || '').toLowerCase().includes(s) ||
        (c.country || '').toLowerCase().includes(s) ||
        (c.city || '').toLowerCase().includes(s) ||
        (c.phone || '').toLowerCase().includes(s)
      )
    }
    if (selectedCountry) {
      result = result.filter((c) => c.country === selectedCountry)
    }
    return result
  }, [customers, search, selectedCountry])

  const grouped = useMemo(() => {
    const groups: Record<string, CustomerWithStats[]> = {}
    groups[''] = []
    filtered.forEach((c) => {
      const key = c.country || t('unknownCountry')
      if (!groups[key]) groups[key] = []
      groups[key].push(c)
    })
    Object.keys(groups).forEach((k) => {
      groups[k].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    })
    return groups
  }, [filtered, t])

  const toggleCountry = (country: string) => {
    setExpandedCountries((prev) => {
      const next = new Set(prev)
      if (next.has(country)) next.delete(country)
      else next.add(country)
      return next
    })
  }

  const expandAll = () => setExpandedCountries(new Set(Object.keys(grouped)))
  const collapseAll = () => setExpandedCountries(new Set())

  const totalCustomers = filtered.length
  const totalOrders = filtered.reduce((s, c) => s + c.order_count, 0)
  const totalRevenue = filtered.reduce((s, c) => s + c.total_spent, 0)
  const countriesCount = Object.keys(grouped).filter((k) => k !== t('unknownCountry') && grouped[k].length > 0).length

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
          <Globe size={28} className="text-primary-600" /> {t('title')}
        </h1>
        <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> {tc('loading')}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Globe size={28} className="text-primary-600" />
            {t('title')}
          </h1>
          <p className="text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: t('stats.customers'), value: totalCustomers, color: 'bg-blue-50 text-blue-600' },
          { icon: Globe, label: t('stats.countries'), value: countriesCount, color: 'bg-green-50 text-green-600' },
          { icon: ShoppingCart, label: t('stats.orders'), value: totalOrders, color: 'bg-purple-50 text-purple-600' },
          { icon: DollarSign, label: t('stats.revenue'), value: `DH ${totalRevenue.toLocaleString()}`, color: 'bg-amber-50 text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & filtering */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="input pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              className="input py-2 text-sm"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="">{t('allCountries')}</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button onClick={expandAll} className="text-xs text-primary-600 hover:underline">{t('expandAll')}</button>
            <button onClick={collapseAll} className="text-xs text-gray-500 hover:underline">{t('collapseAll')}</button>
          </div>
        </div>

        {/* Grouped customer list */}
        {Object.keys(grouped)
          .filter((k) => k === t('unknownCountry') || grouped[k].length > 0)
          .sort((a, b) => {
            if (a === t('unknownCountry')) return 1
            if (b === t('unknownCountry')) return -1
            if (a === t('unknownCountry')) return grouped[a].length
            return a.localeCompare(b)
          })
          .map((country) => {
            const isExpanded = expandedCountries.has(country)
            const customersInGroup = grouped[country]
            const groupOrders = customersInGroup.reduce((s, c) => s + c.order_count, 0)
            const groupRevenue = customersInGroup.reduce((s, c) => s + c.total_spent, 0)
            const hasFlag = country !== t('unknownCountry')

            if (customersInGroup.length === 0 && !selectedCountry) return null

            return (
              <div key={country} className="border-b border-gray-100 last:border-b-0">
                {/* Country header */}
                <button
                  onClick={() => toggleCountry(country)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                    {hasFlag ? (
                      <MapPin size={18} className="text-primary-600" />
                    ) : (
                      <MapPin size={18} className="text-gray-400" />
                    )}
                    <div>
                      <span className="font-semibold text-gray-900">
                        {country}
                        {country === t('unknownCountry') && <span className="text-gray-400 text-xs ml-1">({t('noAddress')})</span>}
                      </span>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-0.5">
                        <span>{t('customerCount', { count: customersInGroup.length })}</span>
                        <span>{groupOrders} {t('stats.orders')}</span>
                        <span>DH {groupRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded customer rows */}
                {isExpanded && (
                  <div className="bg-gray-50/50">
                    <div className="px-4 py-2 hidden md:grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase">
                      <span className="col-span-3">{t('table.customer')}</span>
                      <span className="col-span-3">{t('table.contact')}</span>
                      <span className="col-span-2">{t('table.location')}</span>
                      <span className="col-span-2 text-center">{t('table.orders')}</span>
                      <span className="col-span-2 text-right">{t('table.spent')}</span>
                    </div>
                    {customersInGroup.map((customer) => (
                      <div key={customer.id} className="px-4 py-3 hover:bg-white transition-colors border-t border-gray-100">
                        {/* Mobile card */}
                        <div className="md:hidden space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{customer.full_name || t('noName')}</span>
                            {customer.phone && (
                              <a href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`} target="_blank" className="text-green-600 hover:bg-green-50 p-1 rounded flex-shrink-0">
                                <Phone size={14} />
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            {customer.email && (
                              <div className="flex items-center gap-1">
                                <Mail size={12} /> <span>{customer.email}</span>
                              </div>
                            )}
                            {customer.city && (
                              <div className="flex items-center gap-1">
                                <MapPin size={12} /> <span>{customer.city}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-purple-600">{customer.order_count} {t('table.orders')}</span>
                            <span className="text-amber-600 font-medium">DH {customer.total_spent.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Desktop row */}
                        <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-3 flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-primary-600">
                                {customer.full_name?.[0] || customer.email?.[0] || '?'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{customer.full_name || t('noName')}</p>
                              <p className="text-xs text-gray-400">{formatDate(customer.created_at)}</p>
                            </div>
                          </div>
                          <div className="col-span-3 flex items-center gap-2 text-sm text-gray-600 min-w-0">
                            {customer.email && (
                              <a href={`mailto:${customer.email}`} className="hover:text-primary-600 flex items-center gap-1 truncate">
                                <Mail size={14} className="flex-shrink-0" /> <span className="truncate">{customer.email}</span>
                              </a>
                            )}
                            {customer.phone && (
                              <a href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`} target="_blank" className="text-green-600 hover:bg-green-50 p-1 rounded flex-shrink-0">
                                <Phone size={14} />
                              </a>
                            )}
                          </div>
                          <div className="col-span-2 text-sm text-gray-600">
                            {customer.city && <span>{customer.city}</span>}
                          </div>
                          <div className="col-span-2 text-center text-sm">
                            {customer.order_count > 0 ? (
                              <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                {customer.order_count}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">0</span>
                            )}
                          </div>
                          <div className="col-span-2 text-right text-sm font-medium text-amber-700">
                            {customer.total_spent > 0 ? `DH ${customer.total_spent.toLocaleString()}` : '-'}
                          </div>
                        </div>
                      </div>
                    ))}
                    {customersInGroup.length === 0 && (
                      <p className="p-6 text-center text-sm text-gray-400">{t('noCustomers')}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg">{t('noCustomers')}</p>
            <p className="text-sm mt-1">{t('noCustomersHint')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

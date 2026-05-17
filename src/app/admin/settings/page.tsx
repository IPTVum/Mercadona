'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Setting } from '@/types'

const SENSITIVE_KEYS = ['stripe_secret_key', 'stripe_webhook_secret', 'paypal_secret', 'smtp_password']

export default function AdminSettingsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*')
      if (data) {
        const map: Record<string, string> = {}
        data.forEach((s: Setting) => {
          if (SENSITIVE_KEYS.includes(s.key)) {
            map[s.key] = String(s.value ?? '')
            map[`${s.key}_set`] = String(s.value ?? '') ? 'true' : 'false'
          } else {
            map[s.key] = String(s.value ?? '')
          }
        })
        setSettings(map)
      }
      setLoading(false)
    }
    fetchSettings()
  }, [supabase])

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const saveTab = async (keys: string[]) => {
    setSaving(true)
    try {
      const upserts = keys.map((key) => ({
        key,
        value: settings[key] ?? '',
        type: 'text',
      }))
      const { error } = await supabase.from('settings').upsert(upserts, { onConflict: 'key' })
      if (error) throw error
      toast.success('Settings saved successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'payments', label: 'Payments' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'email', label: 'Email' },
    { id: 'social', label: 'Social' },
  ]

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Settings</h1>
        <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Settings</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-48 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6">General Settings</h2>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="label">Store Name</label>
                  <input type="text" className="input" value={settings.site_name || ''} onChange={(e) => updateSetting('site_name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Store Description</label>
                  <textarea className="input" rows={2} value={settings.site_description || ''} onChange={(e) => updateSetting('site_description', e.target.value)} />
                </div>
                <div>
                  <label className="label">Store Email</label>
                  <input type="email" className="input" value={settings.contact_email || ''} onChange={(e) => updateSetting('contact_email', e.target.value)} />
                </div>
                <div>
                  <label className="label">Store Phone</label>
                  <input type="tel" className="input" value={settings.contact_phone || ''} onChange={(e) => updateSetting('contact_phone', e.target.value)} />
                </div>
                <div>
                  <label className="label">Store Address</label>
                  <textarea className="input" rows={3} value={settings.address || ''} onChange={(e) => updateSetting('address', e.target.value)} />
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select className="input" value={settings.currency || 'MAD'} onChange={(e) => updateSetting('currency', e.target.value)}>
                    <option value="MAD">MAD (DH)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <button onClick={() => saveTab(['site_name', 'site_description', 'contact_email', 'contact_phone', 'address', 'currency'])} className="btn-primary" disabled={saving}>
                  {saving ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : <><Save size={20} /> Save Changes</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Payment Settings</h2>
              <div className="space-y-6 max-w-lg">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium mb-3">Stripe</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="label">Publishable Key</label>
                      <input type="text" className="input" placeholder="pk_test_..." value={settings.stripe_public_key || ''} onChange={(e) => updateSetting('stripe_public_key', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Secret Key</label>
                      <input type="password" className="input" placeholder={settings.stripe_secret_key_set === 'true' ? '(already set - enter new value to change)' : 'sk_test_...'} value={settings.stripe_secret_key || ''} onChange={(e) => updateSetting('stripe_secret_key', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Webhook Secret</label>
                      <input type="password" className="input" placeholder={settings.stripe_webhook_secret_set === 'true' ? '(already set - enter new value to change)' : 'whsec_...'} value={settings.stripe_webhook_secret || ''} onChange={(e) => updateSetting('stripe_webhook_secret', e.target.value)} />
                    </div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                      <span>Enable Stripe payments</span>
                    </label>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium mb-3">PayPal</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="label">Mode</label>
                      <select className="input" value={settings.paypal_mode || 'sandbox'} onChange={(e) => updateSetting('paypal_mode', e.target.value)}>
                        <option value="sandbox">Sandbox (Testing)</option>
                        <option value="live">Live (Production)</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Client ID</label>
                      <input type="text" className="input" placeholder="Your PayPal Client ID" value={settings.paypal_client_id || ''} onChange={(e) => updateSetting('paypal_client_id', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Client Secret</label>
                      <input type="password" className="input" placeholder={settings.paypal_secret_set === 'true' ? '(already set - enter new value to change)' : 'Your PayPal Client Secret'} value={settings.paypal_secret || ''} onChange={(e) => updateSetting('paypal_secret', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Webhook ID</label>
                      <input type="text" className="input" placeholder="PayPal Webhook ID" value={settings.paypal_webhook_id || ''} onChange={(e) => updateSetting('paypal_webhook_id', e.target.value)} />
                    </div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                      <span>Enable PayPal payments</span>
                    </label>
                  </div>
                </div>
                <button onClick={() => saveTab(['stripe_public_key', 'stripe_secret_key', 'stripe_webhook_secret', 'paypal_client_id', 'paypal_secret', 'paypal_mode', 'paypal_webhook_id'])} className="btn-primary" disabled={saving}>
                  {saving ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : <><Save size={20} /> Save Changes</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Shipping Settings</h2>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="label">Free Shipping Minimum ($)</label>
                  <input type="number" className="input" value={settings.free_shipping_min || '0'} onChange={(e) => updateSetting('free_shipping_min', e.target.value)} />
                </div>
                <div>
                  <label className="label">Standard Shipping Rate ($)</label>
                  <input type="number" className="input" step="0.01" value={settings.shipping_cost || '0'} onChange={(e) => updateSetting('shipping_cost', e.target.value)} />
                </div>
                <div>
                  <label className="label">Tax Rate (%)</label>
                  <input type="number" className="input" step="0.01" value={settings.tax_rate || '0'} onChange={(e) => updateSetting('tax_rate', e.target.value)} />
                </div>
                <button onClick={() => saveTab(['free_shipping_min', 'shipping_cost', 'tax_rate'])} className="btn-primary" disabled={saving}>
                  {saving ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : <><Save size={20} /> Save Changes</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Email Settings</h2>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="label">SMTP Host</label>
                  <input type="text" className="input" placeholder="smtp.example.com" value={settings.smtp_host || ''} onChange={(e) => updateSetting('smtp_host', e.target.value)} />
                </div>
                <div>
                  <label className="label">SMTP Port</label>
                  <input type="number" className="input" placeholder="587" value={settings.smtp_port || ''} onChange={(e) => updateSetting('smtp_port', e.target.value)} />
                </div>
                <div>
                  <label className="label">SMTP Username</label>
                  <input type="text" className="input" placeholder="your@email.com" value={settings.smtp_username || ''} onChange={(e) => updateSetting('smtp_username', e.target.value)} />
                </div>
                <div>
                    <label className="label">SMTP Password</label>
                    <input type="password" className="input" placeholder={settings.smtp_password_set === 'true' ? '(already set - enter new value to change)' : ''} value={settings.smtp_password || ''} onChange={(e) => updateSetting('smtp_password', e.target.value)} />
                </div>
                <button onClick={() => saveTab(['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password'])} className="btn-primary" disabled={saving}>
                  {saving ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : <><Save size={20} /> Save Changes</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Social Media Links</h2>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="label">Facebook URL</label>
                  <input type="url" className="input" placeholder="https://facebook.com/yourpage" value={settings.social_facebook || ''} onChange={(e) => updateSetting('social_facebook', e.target.value)} />
                </div>
                <div>
                  <label className="label">Twitter URL</label>
                  <input type="url" className="input" placeholder="https://twitter.com/yourhandle" value={settings.social_twitter || ''} onChange={(e) => updateSetting('social_twitter', e.target.value)} />
                </div>
                <div>
                  <label className="label">Instagram URL</label>
                  <input type="url" className="input" placeholder="https://instagram.com/yourprofile" value={settings.social_instagram || ''} onChange={(e) => updateSetting('social_instagram', e.target.value)} />
                </div>
                <div>
                  <label className="label">YouTube URL</label>
                  <input type="url" className="input" placeholder="https://youtube.com/yourchannel" value={settings.social_youtube || ''} onChange={(e) => updateSetting('social_youtube', e.target.value)} />
                </div>
                <button onClick={() => saveTab(['social_facebook', 'social_twitter', 'social_instagram', 'social_youtube'])} className="btn-primary" disabled={saving}>
                  {saving ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : <><Save size={20} /> Save Changes</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

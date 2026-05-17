'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { Save, Loader2, Eye, Mail, Copy, Check, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import type { EmailTemplate } from '@/types'

interface TemplateDef {
  key: string
  label: string
  description: string
  variables: string[]
}

const templateDefs: TemplateDef[] = [
  {
    key: 'email_template_order_confirmed',
    label: 'Order Confirmed',
    description: 'Sent when a customer places an order',
    variables: ['{{customer_name}}', '{{order_id}}', '{{order_total}}', '{{order_items}}', '{{store_name}}', '{{store_email}}', '{{order_date}}'],
  },
  {
    key: 'email_template_order_shipped',
    label: 'Order Shipped',
    description: 'Sent when an order is marked as shipped',
    variables: ['{{customer_name}}', '{{order_id}}', '{{tracking_number}}', '{{tracking_url}}', '{{shipping_address}}', '{{store_name}}', '{{estimated_delivery}}'],
  },
  {
    key: 'email_template_order_delivered',
    label: 'Order Delivered',
    description: 'Sent when an order is marked as delivered',
    variables: ['{{customer_name}}', '{{order_id}}', '{{delivered_date}}', '{{store_name}}', '{{store_email}}'],
  },
  {
    key: 'email_template_order_cancelled',
    label: 'Order Cancelled',
    description: 'Sent when an order is cancelled or refunded',
    variables: ['{{customer_name}}', '{{order_id}}', '{{cancel_reason}}', '{{refund_amount}}', '{{store_name}}'],
  },
  {
    key: 'email_template_newsletter',
    label: 'Newsletter',
    description: 'Sent to newsletter subscribers for promotions and updates',
    variables: ['{{subscriber_email}}', '{{store_name}}', '{{unsubscribe_url}}', '{{content}}'],
  },
  {
    key: 'email_template_welcome',
    label: 'Welcome Email',
    description: 'Sent to new users after registration',
    variables: ['{{customer_name}}', '{{store_name}}', '{{login_url}}', '{{store_email}}'],
  },
]

const defaultBodies: Record<string, string> = {
  'email_template_order_confirmed': `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
  <div style="background:#0284c7;padding:30px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:24px">{{store_name}}</h1>
    <p style="color:#e0f2fe;margin:8px 0 0">Order Confirmation</p>
  </div>
  <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;border-top:none">
    <p>Hello {{customer_name}},</p>
    <p>Thank you for your order! Here's a summary:</p>
    <p><strong>Order ID:</strong> {{order_id}}</p>
    <p><strong>Date:</strong> {{order_date}}</p>
    <p><strong>Total:</strong> {{order_total}}</p>
    <div style="background:#f9fafb;padding:15px;border-radius:8px;margin:20px 0">
      {{order_items}}
    </div>
    <p>We'll notify you when your order ships.</p>
    <p>Need help? Reply to {{store_email}}</p>
    <p style="margin-top:30px;color:#9ca3af;font-size:13px">© {{store_name}}. All rights reserved.</p>
  </div>
</div>`,
  'email_template_order_shipped': `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
  <div style="background:#0369a1;padding:30px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:24px">{{store_name}}</h1>
    <p style="color:#e0f2fe;margin:8px 0 0">Your Order is On the Way!</p>
  </div>
  <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;border-top:none">
    <p>Hello {{customer_name}},</p>
    <p>Great news! Your order <strong>{{order_id}}</strong> has been shipped.</p>
    <div style="background:#f0f9ff;padding:20px;border-radius:8px;margin:20px 0;text-align:center">
      <p style="font-size:18px;margin:0 0 10px"><strong>Tracking Number:</strong></p>
      <p style="font-size:22px;color:#0284c7;margin:0"><a href="{{tracking_url}}" style="color:#0284c7">{{tracking_number}}</a></p>
    </div>
    <p><strong>Shipping to:</strong> {{shipping_address}}</p>
    <p><strong>Estimated delivery:</strong> {{estimated_delivery}}</p>
    <p>Track your package using the link above.</p>
    <p style="margin-top:30px;color:#9ca3af;font-size:13px">© {{store_name}}. All rights reserved.</p>
  </div>
</div>`,
  'email_template_order_delivered': `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
  <div style="background:#16a34a;padding:30px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:24px">{{store_name}}</h1>
    <p style="color:#dcfce7;margin:8px 0 0">Order Delivered!</p>
  </div>
  <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;border-top:none">
    <p>Hello {{customer_name}},</p>
    <p>Your order <strong>{{order_id}}</strong> has been delivered on {{delivered_date}}.</p>
    <p>We hope you love your purchase! If you have any issues, please contact us at {{store_email}}.</p>
    <p style="margin-top:30px;color:#9ca3af;font-size:13px">© {{store_name}}. All rights reserved.</p>
  </div>
</div>`,
  'email_template_order_cancelled': `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
  <div style="background:#dc2626;padding:30px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:24px">{{store_name}}</h1>
    <p style="color:#fecaca;margin:8px 0 0">Order Update</p>
  </div>
  <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;border-top:none">
    <p>Hello {{customer_name}},</p>
    <p>Your order <strong>{{order_id}}</strong> has been cancelled.</p>
    <p><strong>Reason:</strong> {{cancel_reason}}</p>
    {{refund_amount}}
    <p>We apologize for any inconvenience. Contact us at {{store_email}} if you need assistance.</p>
    <p style="margin-top:30px;color:#9ca3af;font-size:13px">© {{store_name}}. All rights reserved.</p>
  </div>
</div>`,
  'email_template_newsletter': `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
  <div style="background:#0284c7;padding:30px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:24px">{{store_name}}</h1>
    <p style="color:#e0f2fe;margin:8px 0 0">Newsletter</p>
  </div>
  <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;border-top:none">
    {{content}}
    <p style="margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:13px">
      You received this email because you subscribed to {{store_name}}.<br>
      <a href="{{unsubscribe_url}}" style="color:#9ca3af">Unsubscribe</a>
    </p>
  </div>
</div>`,
  'email_template_welcome': `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
  <div style="background:linear-gradient(135deg,#0284c7,#c026d3);padding:30px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:24px">Welcome to {{store_name}}!</h1>
    <p style="color:#e0f2fe;margin:8px 0 0">We're glad you're here</p>
  </div>
  <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;border-top:none">
    <p>Hello {{customer_name}},</p>
    <p>Welcome to {{store_name}}! We're excited to have you as part of our community.</p>
    <p>Start exploring our products and enjoy exclusive deals.</p>
    <div style="text-align:center;margin:25px 0">
      <a href="{{login_url}}" style="display:inline-block;padding:12px 30px;background:#0284c7;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Start Shopping</a>
    </div>
    <p>Need help? Reply to {{store_email}}</p>
    <p style="margin-top:30px;color:#9ca3af;font-size:13px">© {{store_name}}. All rights reserved.</p>
  </div>
</div>`,
}

export default function AdminEmailsPage() {
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState(templateDefs[0].key)
  const [templates, setTemplates] = useState<Record<string, EmailTemplate>>({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [copiedVar, setCopiedVar] = useState<string | null>(null)
  const [varPanelOpen, setVarPanelOpen] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [supabase])

  const loadTemplates = async () => {
    const { data } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', templateDefs.map((t) => t.key))

    const map: Record<string, EmailTemplate> = {}
    templateDefs.forEach((def) => {
      const stored = (data as { key: string; value: any }[] | null)?.find((s) => s.key === def.key)
      if (stored && stored.value && typeof stored.value === 'object') {
        map[def.key] = { subject: stored.value.subject || '', body: stored.value.body || defaultBodies[def.key] || '' }
      } else {
        map[def.key] = { subject: '', body: defaultBodies[def.key] || '' }
      }
    })
    setTemplates(map)
    setLoading(false)
  }

  const updateTemplate = (key: string, field: 'subject' | 'body', value: string) => {
    setTemplates((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  const saveTemplates = async () => {
    setSaving(true)
    try {
      const upserts = templateDefs.map((def) => ({
        key: def.key,
        value: templates[def.key],
        type: 'email_template',
      }))
      const { error } = await supabase.from('settings').upsert(upserts, { onConflict: 'key' })
      if (error) throw error
      toast.success('Email templates saved!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save templates')
    } finally {
      setSaving(false)
    }
  }

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable)
    setCopiedVar(variable)
    setTimeout(() => setCopiedVar(null), 1500)
  }

  const activeDef = templateDefs.find((t) => t.key === activeTab)!
  const activeTemplate = templates[activeTab]

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Email Templates</h1>
        <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Email Templates</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage email templates for orders, newsletters, and more</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPreviewOpen(!previewOpen)}
            className={`btn-outline ${previewOpen ? 'bg-primary-50 border-primary-300 text-primary-700' : ''}`}
          >
            <Eye size={18} />
            {previewOpen ? 'Edit' : 'Preview'}
          </button>
          <button onClick={saveTemplates} className="btn-primary" disabled={saving}>
            {saving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : <><Save size={18} /> Save All</>}
          </button>
        </div>
      </div>

      {/* Template Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
        {templateDefs.map((def) => (
          <button
            key={def.key}
            onClick={() => { setActiveTab(def.key); setVarPanelOpen(false) }}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === def.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Mail size={16} className="inline mr-2" />
            {def.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Editor */}
        <div className="lg:col-span-3 space-y-6">
          {previewOpen ? (
            /* Preview */
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 bg-gray-50 border-b border-gray-200 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Mail size={16} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activeTemplate?.subject || '(No subject)'}
                    </p>
                    <p className="text-xs text-gray-500">Email preview — variables not replaced</p>
                  </div>
                </div>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <iframe
                  srcDoc={activeTemplate?.body || ''}
                  className="w-full min-h-[500px] border-0 rounded-lg"
                  title="Email template preview"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Subject */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <label className="label text-base font-semibold">
                  <Mail size={18} className="inline mr-2 text-primary-600" />
                  Subject Line
                </label>
                <input
                  type="text"
                  className="input mt-2"
                  value={activeTemplate?.subject || ''}
                  onChange={(e) => updateTemplate(activeTab, 'subject', e.target.value)}
                  placeholder="Enter email subject..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  You can use variables like {'{{customer_name}}'}, {'{{order_id}}'}, etc.
                </p>
              </div>

              {/* Body */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <label className="label text-base font-semibold mb-3 block">
                  HTML Body
                </label>
                <textarea
                  className="input font-mono text-sm"
                  rows={22}
                  value={activeTemplate?.body || ''}
                  onChange={(e) => updateTemplate(activeTab, 'body', e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* Sidebar: Template Info + Variables */}
        <div className="space-y-4">
          {/* Info Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">{activeDef.label}</h3>
            <p className="text-sm text-gray-500">{activeDef.description}</p>
          </div>

          {/* Variables */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <button
              onClick={() => setVarPanelOpen(!varPanelOpen)}
              className="w-full flex items-center justify-between p-4 font-semibold text-gray-900"
            >
              <span className="flex items-center gap-2">
                <Copy size={16} className="text-primary-600" />
                Variables
              </span>
              {varPanelOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            {varPanelOpen && (
              <div className="px-4 pb-4 space-y-1.5">
                <p className="text-xs text-gray-400 mb-2">Click to copy:</p>
                {activeDef.variables.map((v) => (
                  <button
                    key={v}
                    onClick={() => copyVariable(v)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-primary-50 rounded-lg text-sm font-mono transition-colors group"
                  >
                    <span className="text-gray-700 group-hover:text-primary-700">{v}</span>
                    {copiedVar === v ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} className="text-gray-300 group-hover:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Help Card */}
          <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
            <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
              </svg>
              Tips
            </h4>
            <ul className="text-xs text-amber-700 space-y-1.5 list-disc list-inside">
              <li>Use inline CSS for email compatibility</li>
              <li>Keep width under 600px</li>
              <li>Use web-safe fonts (Arial, sans-serif)</li>
              <li>Test all links before sending</li>
              <li>Include unsubscribe link in newsletters</li>
            </ul>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              if (confirm(`Reset "${activeDef.label}" template to default?`)) {
                updateTemplate(activeTab, 'body', defaultBodies[activeTab] || '')
                updateTemplate(activeTab, 'subject', '')
                toast.success('Template reset to default')
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:text-red-600 bg-white hover:bg-red-50 rounded-xl border border-gray-200 hover:border-red-200 transition-colors"
          >
            <RefreshCw size={16} />
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  )
}

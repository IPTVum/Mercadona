'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Megaphone,
  Instagram,
  Facebook,
  Video,
  Music,
  MessageCircle,
  Camera,
  Hash,
  Target,
  Palette,
  Lightbulb,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  Copy,
  Check,
  Globe,
  ShoppingBag,
  Star,
  Share2,
  Eye,
  Zap,
  Clock,
  Send,
  Gem,
  Sparkles,
} from 'lucide-react'

function PinIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <Icon size={20} className="text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
      title="Copy"
    >
      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-400" />}
    </button>
  )
}

function Badge({ children, color = 'default' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    instagram: 'bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 border-pink-200',
    facebook: 'bg-blue-50 text-blue-700 border-blue-200',
    pinterest: 'bg-red-50 text-red-700 border-red-200',
    tiktok: 'bg-gray-100 text-gray-700 border-gray-300',
    whatsapp: 'bg-green-50 text-green-700 border-green-200',
    default: 'bg-primary-50 text-primary-700 border-primary-200',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors[color] || colors.default}`}>
      {children}
    </span>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all ${className}`}>{children}</div>
}

// ============ DATA ============

const HEADLINES = [
  'Authentic Moroccan Rugs — Handwoven by Berber Artisans',
  'Bring the Soul of Morocco Into Your Home',
  'One-of-a-Kind Handmade Rugs from the Atlas Mountains',
  'Ethically Sourced. Handcrafted. Moroccan.',
  'Transform Your Space with a Genuine Moroccan Rug',
  'From Our Hands to Your Home — 100% Handmade Moroccan Rugs',
  'Discover the Art of Moroccan Weaving — Shop Our Collection',
  'Luxury Underfoot: Premium Handmade Moroccan Rugs',
]

const CAPTIONS = {
  instagram: [
    'This handwoven Berber rug took 4 weeks to create by skilled artisans in the Atlas Mountains. Each knot tells a story of heritage, tradition, and artistry. Tap the link in bio to bring this piece home. 🇲🇦✨\n\n#MoroccanRug #HandmadeHome #BerberArt',
    'Looking for that statement piece? Our Moroccan rugs are one-of-a-kind — no two are ever the same. Handwoven using techniques passed down through generations. Shop now via the link in our bio! 🏡',
    'Soft underfoot, stunning to the eye. Natural wool, vegetable dyes, and centuries of tradition come together in every rug we sell. DM us for custom sizes and colors! 💬',
  ],
  facebook: [
    'Discover authentic Moroccan rugs, handwoven by Berber artisans using traditional techniques. Each piece is a unique work of art that brings warmth, color, and heritage to your home.\n\nBrowse our collection today: [LINK]\n\nFree shipping on orders over $200. Worldwide delivery available.',
    'Why choose a Moroccan rug?\n\n• 100% handmade by skilled artisans\n• Natural wool and vegetable dyes\n• Each rug is unique — no mass production\n• Supports artisan communities\n\nStart shopping: [LINK]',
    'Our customers love the quality of our handwoven Moroccan rugs. Here\'s what Sarah from New York says: "The craftsmanship is incredible. I\'ve never seen anything like it!"\n\nSee our latest arrivals: [LINK]',
  ],
  pinterest: [
    '10 Ways to Style a Moroccan Rug in Your Home — from bohemian living rooms to minimalist bedrooms. Save this pin for inspiration! 📌',
    'The Ultimate Guide to Authentic Moroccan Rugs — Learn about Berber symbols, wool types, and how to spot a genuine handmade rug. Read more on our blog!',
    'Moroccan Rug Shopping Guide: What to look for, how to choose the right size, and why handmade matters. Tap to learn more!',
  ],
  tiktok: [
    'POV: You just unrolled your first handmade Moroccan rug and your room instantly leveled up 🤯✨ #MoroccanRug #HomeUpgrade',
    'Watch how a Moroccan rug is made — from shearing the wool to the final knot. This is 4 weeks of work in 30 seconds. 🎥🇲🇦',
    'Rate my rug collection 1-10! Which one would you put in your home? 🏡 #RugCollection #MoroccanDecor',
  ],
}

const REEL_SCRIPTS = [
  'POV: Your living room before and after adding a Moroccan rug. The difference is INSANE. 🏡✨ [Show bare floor] → [Show rug in place] Follow for more home transformation tips!',
  '3 things you NEED to know before buying a Moroccan rug: 1️⃣ Check if it\'s hand-knotted (not machine-made), 2️⃣ Look for natural wool and vegetable dyes, 3️⃣ Buy from a trusted source. Save this for later! 📌',
  'Watch me unbox this STUNNING Beni Ourain rug. The softness... the detail... I\'m obsessed. 😍 Link in bio to shop this exact piece!',
  'Which Moroccan rug style matches your vibe? 🧐 Bohemian, Minimalist, or Maximalist? Comment below! 👇 Our rugs fit every style — browse the collection at [LINK]',
  'Day in the life: A Moroccan artisan weaving a custom rug. This level of craftsmanship takes YEARS to master. Every single knot is tied by hand. 🇲🇦 Support artisan communities — shop now.',
]

const WHATSAPP_TEMPLATES = {
  catalog: `👋 Hello! Thanks for your interest in our Moroccan rugs.

📸 Here is our current collection: [CATALOG_LINK]

🎨 We offer custom sizes, colors, and designs. Let me know what you're looking for and I'll send personalized recommendations!

📍 We ship worldwide ✈️`,
  inquiry: `Hi [Name]! 😊 Thank you for reaching out.

Here are the details on the rug you asked about:
• Type: [RUG_TYPE]
• Size: [SIZE]
• Price: [PRICE]
• Shipping: [DELIVERY_INFO]

Would you like to place an order or do you have any questions? I'm happy to help!`,
  order: `✅ Great news — your order is confirmed!

Order #: [ORDER_ID]
Rug: [RUG_NAME]
Total: [TOTAL_AMOUNT]

📦 Estimated delivery: [DELIVERY_DATE]
🚚 Tracking: [TRACKING_LINK]

Thank you for supporting Moroccan artisans! We'll keep you updated. 🇲🇦`,
  followup: `Hi [Name]! 👋 Just checking in — how are you enjoying your Moroccan rug?

If you love it, we'd be so grateful if you could leave us a review 🙏 [REVIEW_LINK]

As a thank you, here's a 10% discount on your next order: WELCOME10 🎁`,
}

const HASHTAGS = {
  primary: [
    'MoroccanRug', 'BerberRug', 'HandmadeRug', 'MoroccanDecor', 'BohemianDecor',
    'InteriorDesign', 'RugLover', 'ArtisanMade', 'HomeDecor', 'EthicalDecor',
    'VintageRug', 'Morocco', 'Handwoven', 'WoolRug', 'EthnicDecor',
    'SustainableHome', 'FairTrade', 'ArtisanCraft', 'LuxuryHome', 'GlobalDecor',
  ],
  instagram: ['MoroccanStyle', 'BohoHome', 'HomeStyling', 'InteriorInspo', 'RugGoals', 'HomeVibes', 'CozyHome', 'DecorInspo', 'MoroccanInteriors', 'BohoStyle', 'HomeInspo', 'InstaHome'],
  pinterest: ['HomeDecorIdeas', 'RugDesign', 'BohoDecor', 'EthnicDecor', 'LivingRoomIdeas', 'BedroomDecor', 'RugStyle', 'InteriorGoals', 'HomeReno', 'DecorTips'],
  tiktok: ['HomeTok', 'DecorTok', 'RugTok', 'HomeUpgrade', 'InteriorHacks', 'HomeTransformation', 'RoomMakeover', 'CozyTok', 'HomeHaul', 'MoroccanTok'],
  seasonal: {
    Ramadan: ['RamadanDecor', 'RamadanKareem', 'EidPrep', 'IslamicHome', 'RamadanVibes', 'EidDecor'],
    Summer: ['SummerDecor', 'SummerRefresh', 'SummerVibes', 'OutdoorLiving', 'SummerHome', 'BeachHouse'],
    Winter: ['CozyWinter', 'WinterDecor', 'StayCozy', 'WinterHome', 'WarmVibes', 'HyggeHome'],
    NewHome: ['NewHome', 'FirstHome', 'HomeSweetHome', 'MovingIn', 'NewBeginnings', 'HomeGoals'],
    Wedding: ['BridalRegistry', 'WeddingGift', 'JustMarried', 'Newlyweds', 'WeddingDecor', 'HomeForTwo'],
    Holiday: ['HolidayDecor', 'GiftGuide', 'ChristmasDecor', 'GiftIdeas', 'StockingStuffer', 'SeasonalDecor'],
  },
}

const PHOTO_TIPS = [
  { title: 'Natural Lighting', desc: 'Photograph rugs near a window during golden hour (early morning or late afternoon). Avoid direct overhead sunlight which washes out colors. Diffused natural light brings out the true wool texture and dye variations.' },
  { title: 'Best Angles', desc: 'Shoot from directly above (flat lay) for pattern details. Take a 45-degree angle for texture. Include a room shot (wide angle) showing the rug in context. Macro shots of weaving details are great for convincing buyers of quality.' },
  { title: 'Background Matters', desc: 'Use neutral backgrounds — white/beige walls, light wood floors, or natural stone. Avoid cluttered or busy backgrounds that distract from the rug. A simple room with natural light works best.' },
  { title: 'Show Scale', desc: 'Place furniture on the rug (a chair, coffee table, or bed) to show real-world scale. Include a reference object if needed. People always worry about size — make it obvious.' },
  { title: 'Details Sell', desc: 'Get close-ups of: the fringe/tassels, weave pattern, wool texture, color variations, and the back of the rug (shows handmade quality). These details build trust and reduce returns.' },
  { title: 'Lifestyle', desc: 'Stage the rug in a real room setting — not just a product photo. A cup of Moroccan tea, a plant, a book on a coffee table. This helps buyers visualize it in their own home and increases conversion rates.' },
]

const VIDEO_TIPS = [
  'Start with a hook in the first 2 seconds — say something that grabs attention immediately',
  'Film in good natural light; even a phone camera works great if lighting is right',
  'Show the rug being unrolled/unfolded — it\'s satisfying and shows scale',
  'Walk barefoot on the rug to demonstrate softness and thickness',
  'Include close-up shots of the weave, texture, and fringe details',
  'End with a clear CTA: "Link in bio" or "DM to order" or "Shop now"',
]

const STRATEGY_AUDIENCES = [
  { icon: Palette, color: 'text-blue-600', title: 'Interior Design Lovers', desc: 'Ages 25-55, mostly women, active on Instagram and Pinterest. They value unique, artisanal pieces. Target keywords: boho decor, eclectic home, handmade decor.' },
  { icon: Globe, color: 'text-green-600', title: 'Cultural Enthusiasts', desc: 'Travelers, expats, and those connected to North African / Middle Eastern culture. They appreciate authenticity and heritage. Target with storytelling about Berber traditions and craftsmanship.' },
  { icon: Gem, color: 'text-purple-600', title: 'Luxury Home Buyers', desc: 'High-income homeowners, ages 30-65, looking for investment pieces. They value exclusivity and quality. Use premium positioning: "investment piece", "heirloom quality", "museum-grade craftsmanship".' },
]

const BUDGET_TIPS = [
  { title: 'Start Small', desc: 'Begin with $5-10/day on Instagram and Facebook. Test 3-4 different ad creatives with the same audience. Run for at least 5-7 days before deciding what works.' },
  { title: 'A/B Test Creatives', desc: 'Test lifestyle photos vs. flat lay photos. Test video vs. carousel. Test emotional copy vs. feature-focused copy. Let data decide — double down on winners.' },
  { title: 'Scale What Works', desc: 'Once you find a winning ad (ROAS > 2x), increase budget by 20-30% every 3-4 days. Create lookalike audiences from people who purchased. Expand to new countries one at a time.' },
  { title: 'Retarget Abandoners', desc: 'Set up retargeting for: people who visited product pages but didn\'t buy, people who added to cart, and people who watched 50%+ of your video. These warm audiences convert 3-5x better than cold traffic.' },
]

const AD_TYPES = [
  { title: 'Carousel Ads', desc: 'Showcase 5-10 different rugs in one ad. Each card can link to a different product page. Best for: Instagram, Facebook. Pro tip: Arrange rugs by color story or room style for visual flow.', platforms: 'instagram, facebook' },
  { title: 'Collection Ads', desc: 'A cover image/video followed by product cards. Users tap to browse a full-screen catalog. Best for: Instagram, Facebook. Perfect for showing a "new arrivals" collection or a specific category like Beni Ourain rugs.', platforms: 'instagram, facebook' },
  { title: 'Video Ads', desc: 'Short videos (15-30 seconds) perform best. Show the rug in a room, unboxing, or weaving process. Best for: Instagram Reels, TikTok, Facebook. Pro tip: Add captions — most people watch without sound.', platforms: 'instagram, facebook, tiktok' },
  { title: 'Catalog Ads', desc: 'Sync your product catalog and let the platform dynamically show relevant rugs to users based on their browsing behavior. Best for: Facebook, Instagram. Set up once, runs automatically.', platforms: 'facebook, instagram' },
  { title: 'Remarketing Ads', desc: 'Target people who visited your site but didn\'t buy. Show them the exact rug they viewed with a small discount. Best for: Facebook, Instagram, Google. Highest ROI ad type.', platforms: 'facebook, instagram' },
]

const CALENDAR_SCHEDULE = [
  { day: 'Monday', platform: 'instagram', type: 'Product Spotlight — single rug feature', time: '12:00 PM', target: 'Feed Post', priority: 'High' },
  { day: 'Monday', platform: 'facebook', type: 'Blog article / Educational post', time: '6:00 PM', target: 'Page Post', priority: 'Medium' },
  { day: 'Tuesday', platform: 'instagram', type: 'Reel — Behind the scenes / Weaving process', time: '9:00 AM', target: 'Reels', priority: 'High' },
  { day: 'Tuesday', platform: 'pinterest', type: 'Pin 5-10 rug images to relevant boards', time: '2:00 PM', target: 'Boards', priority: 'Medium' },
  { day: 'Wednesday', platform: 'instagram', type: 'Customer review / Testimonial', time: '12:00 PM', target: 'Stories + Feed', priority: 'Medium' },
  { day: 'Wednesday', platform: 'tiktok', type: 'Room transformation / Rug unboxing', time: '7:00 PM', target: 'For You Page', priority: 'High' },
  { day: 'Thursday', platform: 'instagram', type: 'Carousel — Styling tips / Room inspiration', time: '12:00 PM', target: 'Feed Post', priority: 'High' },
  { day: 'Thursday', platform: 'facebook', type: 'Promotional post with discount code', time: '6:00 PM', target: 'Page Post + Groups', priority: 'Medium' },
  { day: 'Friday', platform: 'instagram', type: 'Reel — Trending audio / Fun content', time: '9:00 AM', target: 'Reels', priority: 'High' },
  { day: 'Friday', platform: 'pinterest', type: 'Create new Pin — seasonal inspiration', time: '2:00 PM', target: 'Boards', priority: 'Low' },
  { day: 'Saturday', platform: 'instagram', type: 'Story — Shop this look / Polls & Questions', time: '11:00 AM', target: 'Stories', priority: 'Medium' },
  { day: 'Sunday', platform: 'tiktok', type: 'Artisan story / Day in the life', time: '10:00 AM', target: 'For You Page', priority: 'Medium' },
]

const SEASONAL_CAMPAIGNS = [
  { name: 'Ramadan & Eid', date: 'Variable (Islamic calendar)', tip: 'Offer special Eid gift packaging. Promote rugs as prayer room decor or Eid home decorations. Run campaigns 2 weeks before Ramadan and 1 week before Eid.' },
  { name: 'Spring Refresh', date: 'March - April', tip: 'Marketing angle: "Refresh your home for spring." Promote lighter-colored rugs, cotton kilims. Partner with spring cleaning/home organization influencers.' },
  { name: 'Summer Sale', date: 'June - July', tip: 'Run a mid-year sale. Promote lightweight cotton rugs and outdoor-friendly kilims. Free shipping promo to boost conversion. Instagram Stories countdown to sale end.' },
  { name: 'Back to College', date: 'August - September', tip: 'Target students and young professionals furnishing their first apartment. Promote smaller, affordable rugs (2x3, 3x5 sizes). Dorm room styling content.' },
  { name: 'Black Friday / Cyber Monday', date: 'End of November', tip: 'Your biggest sales event. Start teasing 2 weeks before. Offer tiered discounts (20% off 1 rug, 30% off 2+). Email blast + social ads. Retarget aggressively.' },
  { name: 'Holiday Gift Guide', date: 'November - December', tip: 'Position rugs as "the ultimate gift for the person who has everything." Create a gift guide post. Offer gift wrapping. Promote gift cards. Guarantee delivery before Dec 24.' },
  { name: 'New Year, New Home', date: 'January', tip: 'New Year resolution angle: "Transform your home in 2025." Promote home makeover content. Bundle deals: rug + pillow covers + throws. January is big for home decor purchases.' },
  { name: 'Valentine\'s Day', date: 'February', tip: 'Cozy home, romantic dinner setting with Moroccan rugs. Couples decorating together. Gift idea for the homebody partner. Red and pink rugs showcase.' },
]

const BEST_POSTING_TIMES = {
  instagram: 'Mon-Fri 11AM-1PM, Tue-Wed 7-9PM (best engagement)',
  facebook: 'Mon-Fri 9AM-12PM, Thu-Fri 1-4PM',
  pinterest: 'Daily 8-11PM, Sat-Sun 2-4PM (highest saves)',
  tiktok: 'Tue-Thu 7-9PM, Sat 10AM-12PM (peak traffic)',
}

const OPTIMIZATION_TIPS = [
  'A/B test ad copy — emotional storytelling vs. product features; see which drives higher CTR',
  'Always include a clear CTA: "Shop Now", "Get Yours", "Browse Collection", "DM to Order"',
  'Post at optimal times for each platform (see calendar above); use scheduling tools like Later or Buffer',
  'Retarget website visitors who spent 30+ seconds on product pages — they\'re warm leads',
  'Create lookalike audiences from your top 25% of customers (by order value) for acquisition campaigns',
]

const INFLUENCERS = [
  'Micro-influencers (5K-50K followers) in home decor niche — they have higher engagement rates and are more affordable',
  'Home decor and interior design content creators on Instagram and TikTok — they can showcase your rugs in styled rooms',
  'Morocco travel/lifestyle influencers — they naturally align with your brand story and can create authentic content',
  'DIY and craft content creators on YouTube/Instagram — they can show rug styling, care tips, and room transformations',
]

const QUICK_TIPS = [
  { title: 'Be Consistent', desc: 'Post at least once per day on Instagram. Minimum 3-4 posts per week on Facebook. Consistency beats perfection — your audience needs to see you regularly.' },
  { title: 'Prioritize Quality', desc: 'One high-quality photo/video outperforms 10 mediocre ones. Invest in good lighting and editing. Your rugs are premium products — your content should reflect that.' },
  { title: 'Engage Your Audience', desc: 'Reply to ALL comments within 2 hours. Answer DMs quickly. Ask questions in captions. Create polls in Stories. Engagement signals boost your algorithmic reach.' },
  { title: 'Check Analytics', desc: 'Review insights weekly: which posts got the most saves/shares? What time drives most engagement? Which hashtags perform best? Double down on what works.' },
  { title: 'Use Story Features', desc: 'Polls, quizzes, countdowns, questions, and link stickers. Stories get 500M+ daily users on Instagram. Use them daily for behind-the-scenes, polls, and limited offers.' },
  { title: 'Collaborate & Tag', desc: 'Tag interior design accounts. Collaborate with complementary brands (Moroccan decor, pillows, lamps). User-generated content is gold — reshare customer photos (with permission).' },
]

export default function AdminMarketingPage() {
  const t = useTranslations('admin.marketing')
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { key: 'overview', label: t('tabs.overview'), icon: Megaphone },
    { key: 'templates', label: t('tabs.templates'), icon: Copy },
    { key: 'visuals', label: t('tabs.visuals'), icon: Camera },
    { key: 'hashtags', label: t('tabs.hashtags'), icon: Hash },
    { key: 'strategy', label: t('tabs.strategy'), icon: TrendingUp },
    { key: 'calendar', label: t('tabs.calendar'), icon: Calendar },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Megaphone size={28} className="text-primary-600" />
          {t('title')}
        </h1>
        <p className="text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ======== OVERVIEW ======== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Gem size={24} />
              <h2 className="text-xl font-bold">{t('overview.title')}</h2>
            </div>
            <p className="text-white/90 leading-relaxed max-w-3xl">
              Moroccan rugs are one of the most sought-after home decor products globally. With their unique patterns, rich heritage, and artisanal craftsmanship, they appeal to interior designers, cultural enthusiasts, and luxury homeowners. The global handmade rug market is growing at 5.8% CAGR — now is the time to scale your online presence and capture this demand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: t('overview.audience'), desc: 'Target women 25-55 in US, Europe, UAE who love boho, eclectic, and luxury home decor.', color: 'text-blue-600 bg-blue-50' },
              { icon: DollarSign, label: t('overview.pricing'), desc: 'Position as premium. Handmade Moroccan rugs sell from $149-$2,500+. Highlight value: "40 hours of artisan work."', color: 'text-green-600 bg-green-50' },
              { icon: Globe, label: t('overview.global'), desc: 'Top markets: USA, UK, France, Germany, UAE, Saudi Arabia. Each market needs tailored messaging and localized ads.', color: 'text-purple-600 bg-purple-50' },
              { icon: Star, label: t('overview.quality'), desc: 'Emphasize: natural wool, vegetable dyes, hand-knotted, each piece unique. Authenticity is your biggest selling point.', color: 'text-amber-600 bg-amber-50' },
            ].map((item, i) => (
              <Card key={i}>
                <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                  <item.icon size={20} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{item.label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>

          <Section title={t('overview.points')} icon={ShoppingBag}>
            <ul className="space-y-2">
              {[
                'Handmade & Artisanal — each rug is a unique piece of art, not factory-produced',
                'Authentic Heritage — woven by Berber artisans using techniques passed down for centuries',
                'Eco-Friendly — natural wool, vegetable dyes, zero synthetic materials',
                'One-of-a-Kind — no two rugs are identical; each carries unique symbols and patterns',
                'Cultural Legacy — every rug tells a story through traditional Berber motifs and symbols',
                'Custom Orders — offer bespoke sizes, colors, and designs to increase perceived value',
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <Sparkles size={16} className="text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title={t('overview.platforms')} icon={Share2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Instagram, col: 'from-pink-500 to-purple-600', name: 'Instagram', desc: 'Your primary visual platform. Use Feed posts for product showcases, Stories for behind-the-scenes, Reels for reach. Instagram Shopping tags let users buy directly. Best for: visual storytelling and brand building.' },
                { icon: Facebook, col: 'from-blue-500 to-blue-700', name: 'Facebook', desc: 'Best for targeted ads and community building. Create a Facebook Shop. Join home decor and expat groups. Use Facebook Ads for precise demographic targeting (income level, interests, location).' },
                { icon: PinIcon, col: 'from-red-500 to-red-700', name: 'Pinterest', desc: 'The #1 platform for home decor discovery. Users actively search for inspiration. Create boards by room style. Rich Pins auto-update pricing. Pins have a 3-month lifespan vs. 24 hours on Instagram. Essential for long-term traffic.' },
                { icon: Music, col: 'from-gray-900 to-gray-700', name: 'TikTok', desc: 'Fastest growing platform for home decor. Show rug unboxings, room transformations, weaving process. Use trending sounds. Short videos (15-30s) perform best. TikTok Shop available in select countries.' },
                { icon: MessageCircle, col: 'from-green-500 to-green-700', name: 'WhatsApp Business', desc: 'Essential for direct customer communication. Set up a catalog, automated greetings, quick replies. Share product photos instantly. Perfect for: custom orders, price inquiries, sending payment links, and post-sale follow-up.' },
              ].map((p) => (
                <Card key={p.name} className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.col} flex items-center justify-center flex-shrink-0`}>
                    <p.icon size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{p.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{p.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ======== TEMPLATES ======== */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <Section title={t('templates.headlines')} icon={Megaphone}>
            <div className="space-y-3">
              {HEADLINES.map((h, i) => (
                <Card key={i} className="flex items-start justify-between gap-3">
                  <p className="text-sm text-gray-800 font-medium">{h}</p>
                  <CopyBtn text={h} />
                </Card>
              ))}
            </div>
          </Section>

          <Section title={t('templates.captions')} icon={Copy}>
            <div className="space-y-4">
              {Object.entries(CAPTIONS).map(([platform, captions]) => {
                const Icon = platform === 'instagram' ? Instagram : platform === 'facebook' ? Facebook : platform === 'pinterest' ? PinIcon : Music
                return (
                  <div key={platform}>
                    <h4 className="font-semibold text-sm capitalize mb-2 flex items-center gap-2">
                      <Icon size={16} /> {platform}
                    </h4>
                    {captions.map((cap, idx) => (
                      <Card key={idx} className="mb-2 flex items-start justify-between gap-3">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{cap}</p>
                        <CopyBtn text={cap} />
                      </Card>
                    ))}
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title={t('templates.reels')} icon={Video}>
            <div className="space-y-3">
              {REEL_SCRIPTS.map((script, i) => (
                <Card key={i} className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full mb-2 inline-block">
                        Reels / Story Script #{i + 1}
                      </span>
                      <p className="text-sm text-gray-800 leading-relaxed mt-1">{script}</p>
                    </div>
                    <CopyBtn text={script} />
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title={t('templates.whatsapp')} icon={MessageCircle}>
            <div className="space-y-3">
              {Object.entries(WHATSAPP_TEMPLATES).map(([key, template]) => (
                <Card key={key} className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full mb-2 inline-block capitalize">
                        {key}
                      </span>
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{template}</p>
                    </div>
                    <CopyBtn text={template} />
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ======== VISUALS ======== */}
      {activeTab === 'visuals' && (
        <div className="space-y-6">
          <Section title={t('visuals.photo')} icon={Camera}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PHOTO_TIPS.map((tip, i) => (
                <Card key={i}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary-600">{i + 1}</span>
                    </div>
                    <h4 className="font-semibold text-sm">{tip.title}</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed ml-10">{tip.desc}</p>
                </Card>
              ))}
            </div>
          </Section>

          <Section title={t('visuals.dimensions')} icon={Palette}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Platform</th>
                    <th className="px-4 py-2 text-left font-semibold">Format</th>
                    <th className="px-4 py-2 text-left font-semibold">Size (px)</th>
                    <th className="px-4 py-2 text-left font-semibold">Aspect Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { name: 'Instagram Feed', format: 'Square', size: '1080 × 1080', ratio: '1:1' },
                    { name: 'Instagram Portrait', format: 'Vertical', size: '1080 × 1350', ratio: '4:5' },
                    { name: 'Instagram Story / Reel', format: 'Vertical', size: '1080 × 1920', ratio: '9:16' },
                    { name: 'Facebook Feed', format: 'Square', size: '1200 × 1200', ratio: '1:1' },
                    { name: 'Facebook Cover', format: 'Wide', size: '1640 × 624', ratio: '2.63:1' },
                    { name: 'Pinterest Pin', format: 'Vertical', size: '1000 × 1500', ratio: '2:3' },
                    { name: 'TikTok Video', format: 'Vertical', size: '1080 × 1920', ratio: '9:16' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3 text-gray-600">{row.format}</td>
                      <td className="px-4 py-3 text-gray-600">{row.size}</td>
                      <td className="px-4 py-3 text-gray-600">{row.ratio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title={t('visuals.video')} icon={Video}>
            <div className="space-y-3">
              {VIDEO_TIPS.map((tip, i) => (
                <Card key={i} className="flex items-start gap-3">
                  <Zap size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                </Card>
              ))}
            </div>
          </Section>

          <Section title={t('visuals.palette')} icon={Palette}>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Use these colors in your branding, photo backgrounds, and ad designs to evoke Moroccan warmth and authenticity:</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Terracotta', hex: '#C2784B' },
                  { name: 'Sahara Sand', hex: '#E8D5B7' },
                  { name: 'Royal Blue', hex: '#1B4D89' },
                  { name: 'Deep Red', hex: '#8B1A1A' },
                  { name: 'Olive Green', hex: '#6B8E23' },
                  { name: 'Charcoal', hex: '#333333' },
                ].map((color) => (
                  <div key={color.hex} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <div className="w-8 h-8 rounded-md border shadow-sm" style={{ backgroundColor: color.hex }} />
                    <div>
                      <p className="text-xs font-medium">{color.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{color.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ======== HASHTAGS ======== */}
      {activeTab === 'hashtags' && (
        <div className="space-y-6">
          <Section title={t('hashtags.primary')} icon={Hash}>
            <Card>
              <div className="flex flex-wrap gap-2">
                {HASHTAGS.primary.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm font-medium">
                    <Hash size={12} /> {tag} <CopyBtn text={`#${tag}`} />
                  </span>
                ))}
              </div>
            </Card>
          </Section>

          <Section title={t('hashtags.byPlatform')} icon={Share2}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries({ instagram: Instagram, pinterest: PinIcon, tiktok: Music }).map(([platform, Icon]) => (
                <Card key={platform}>
                  <h4 className="font-semibold text-sm capitalize mb-2 flex items-center gap-1.5">
                    <Icon size={14} /> {platform}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(HASHTAGS[platform as 'instagram' | 'pinterest' | 'tiktok'] as string[]).map((tag: string) => (
                      <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-0.5">
                        <Hash size={10} /> {tag} <CopyBtn text={`#${tag}`} />
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title={t('hashtags.seasonal')} icon={Calendar}>
            <div className="space-y-2">
              {Object.entries(HASHTAGS.seasonal).map(([season, tags]) => (
                <Card key={season}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-sm">{season}</h4>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {tags.map((tag: string) => (
                          <span key={tag} className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-0.5">
                            <Hash size={10} /> {tag} <CopyBtn text={`#${tag}`} />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title={t('hashtags.tips')} icon={Lightbulb}>
            <ul className="space-y-2">
              {[
                'Use 15-25 hashtags on Instagram posts (max 30). Place 5 in caption, rest in first comment to keep caption clean.',
                'Mix popular hashtags (500K+ posts) with niche ones (10K-100K posts). The sweet spot is 5-8 popular + 10-15 niche.',
                'Create a branded hashtag (e.g., #[YourStoreName]Rugs) and encourage customers to use it. Repost user content.',
                'Change your hashtag sets regularly — Instagram penalizes using the exact same set repeatedly.',
                'On TikTok, use 3-5 hashtags max. Focus on trend-based tags like #HomeTok #MoroccanTok #ForYouPage.',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-primary-600 font-bold mt-0.5">{i + 1}.</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}

      {/* ======== STRATEGY ======== */}
      {activeTab === 'strategy' && (
        <div className="space-y-6">
          <Section title={t('strategy.audience')} icon={Target}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STRATEGY_AUDIENCES.map((aud, i) => (
                <Card key={i}>
                  <div className="flex items-center gap-2 mb-2">
                    <aud.icon size={16} className={aud.color} />
                    <h4 className="font-semibold text-sm">{aud.title}</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{aud.desc}</p>
                </Card>
              ))}
            </div>
          </Section>

          <Section title={t('strategy.adTypes')} icon={DollarSign}>
            <div className="space-y-3">
              {AD_TYPES.map((ad) => (
                <Card key={ad.title}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-sm">{ad.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{ad.desc}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ad.platforms.split(', ').map((p) => (
                          <Badge key={p} color={p}>{p}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title={t('strategy.budget')} icon={DollarSign}>
            <div className="space-y-3">
              {BUDGET_TIPS.map((tip) => (
                <Card key={tip.title}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <DollarSign size={14} className="text-green-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{tip.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title={t('strategy.influencer')} icon={Users}>
            <Card>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">Partner with influencers to amplify your reach. Authentic, creator-led content generates 4x higher engagement than brand-produced content. Here&rsquo;s who to target:</p>
              <ul className="space-y-2">
                {INFLUENCERS.map((inf, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <Eye size={16} className="text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>{inf}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Section>

          <Section title={t('strategy.optimization')} icon={TrendingUp}>
            <ul className="space-y-2">
              {OPTIMIZATION_TIPS.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <Zap size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}

      {/* ======== CALENDAR ======== */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <Section title={t('calendar.schedule')} icon={Clock}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Day</th>
                    <th className="px-4 py-2 text-left font-semibold">Platform</th>
                    <th className="px-4 py-2 text-left font-semibold">Content Type</th>
                    <th className="px-4 py-2 text-left font-semibold">Time</th>
                    <th className="px-4 py-2 text-left font-semibold">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {CALENDAR_SCHEDULE.map((row, i) => (
                    <tr key={i} className={`hover:bg-gray-50 ${row.priority === 'High' ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-4 py-3 font-medium">{row.day}</td>
                      <td className="px-4 py-3"><Badge color={row.platform}><span className="capitalize">{row.platform}</span></Badge></td>
                      <td className="px-4 py-3 text-gray-600">{row.type}</td>
                      <td className="px-4 py-3 text-gray-600">{row.time}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          row.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                        }`}>{row.priority}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title={t('calendar.seasonal')} icon={Calendar}>
            <div className="space-y-3">
              {SEASONAL_CAMPAIGNS.map((camp, i) => (
                <Card key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Calendar size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{camp.name}</h4>
                    <p className="text-xs text-gray-500">{camp.date}</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{camp.tip}</p>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          <Section title={t('calendar.bestTimes')} icon={Clock}>
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(BEST_POSTING_TIMES).map(([platform, time]) => {
                  const Icon = platform === 'instagram' ? Instagram : platform === 'facebook' ? Facebook : platform === 'pinterest' ? PinIcon : Music
                  return (
                    <div key={platform} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <Icon size={18} className="text-gray-600" />
                      <div>
                        <p className="text-xs font-medium capitalize">{platform}</p>
                        <p className="text-xs text-gray-500">{time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </Section>

          <Section title={t('calendar.quickTips')} icon={Lightbulb}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {QUICK_TIPS.map((tip) => (
                <Card key={tip.title} className="flex items-start gap-3">
                  <Lightbulb size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-xs">{tip.title}</h4>
                    <p className="text-xs text-gray-600 mt-0.5">{tip.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Send size={20} />
              {t('cta.title')}
            </h3>
            <p className="text-sm text-white/80 mt-1">{t('cta.desc')}</p>
          </div>
          <div className="flex gap-3">
            <a href="/admin/products" className="bg-white text-primary-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary-50 transition-colors">
              {t('cta.products')}
            </a>
            <a href="/admin/orders" className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/30 transition-colors">
              {t('cta.orders')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

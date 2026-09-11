'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SettingsSidebar() {
  const pathname = usePathname();
  const tSettings = useTranslations('AdminSettings');

  const navGroups = [
    {
      title: tSettings('group_general') || 'GENERAL',
      items: [
        { label: tSettings('nav_language') || 'Language and translation', href: '/admin/settings/language', icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129' },
        { label: tSettings('nav_regional') || 'Regional and currency', href: '/admin/settings/regional', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: tSettings('nav_seo') || 'SEO & OpenGraph', href: '/admin/settings/seo', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
        { label: tSettings('nav_robots') || 'Robots.txt', href: '/admin/settings/robots', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' }
      ]
    },
    {
      title: tSettings('group_store') || 'STORE',
      items: [
        { label: tSettings('nav_features') || 'Store features', href: '/admin/settings/store-features', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { label: tSettings('nav_shipping') || 'Product shipping info', href: '/admin/settings/shipping-info', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
        { label: tSettings('nav_taxes') || 'Taxes and VAT', href: '/admin/settings/taxes', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' }
      ]
    },
    {
      title: tSettings('group_payments') || 'PAYMENTS',
      items: [
        { label: tSettings('nav_payments') || 'Stripe, PayPal, bank transfer', href: '/admin/settings/payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' }
      ]
    },
    {
      title: tSettings('group_design') || 'DESIGN',
      items: [
        { label: tSettings('nav_design_header') || 'Header and product cards', href: '/admin/settings/design-header', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
        { label: tSettings('nav_navigation') || 'Navigation menu', href: '/admin/settings/navigation', icon: 'M4 6h16M4 12h16M4 18h16' },
        { label: tSettings('nav_footer') || 'Footer', href: '/admin/settings/footer', icon: 'M4 16h16M4 20h16M4 4h16v8H4V4z' }
      ]
    },
    {
      title: tSettings('group_communication') || 'COMMUNICATION',
      items: [
        { label: tSettings('nav_smtp') || 'Email server (SMTP)', href: '/admin/settings/smtp', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { label: tSettings('nav_chat') || 'Customer chat', href: '/admin/settings/chat', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' }
      ]
    },
    {
      title: tSettings('group_advanced') || 'ADVANCED',
      items: [
        { label: tSettings('nav_maintenance') || 'Maintenance mode', href: '/admin/settings/maintenance', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
        { label: tSettings('nav_404') || '404 page', href: '/admin/settings/not-found-page', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
      ]
    }
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-200 h-full flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <Link 
          href="/admin" 
          className="flex items-center justify-center w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {tSettings('back_to_dashboard') || 'Back to dashboard'}
        </Link>
      </div>
      
      <nav className="p-4 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive 
                          ? 'bg-gray-100 text-gray-900' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <svg className={`w-4 h-4 mr-3 flex-shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

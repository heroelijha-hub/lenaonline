'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebarNav({ links }: { links: { href: string, label: string, icon?: React.ReactNode }[] }) {
  const pathname = usePathname();
  
  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      {links.map((link) => {
         const isActive = link.href === '/admin' 
            ? pathname === '/admin'
            : pathname.startsWith(link.href);
         
         return (
           <Link 
             key={link.href}
             href={link.href}
             className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition ${
               isActive 
                 ? 'bg-orange-500 text-white shadow-sm' 
                 : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
             }`}
           >
             {link.icon && <span className="mr-3">{link.icon}</span>}
             {link.label}
           </Link>
         );
      })}
    </nav>
  );
}

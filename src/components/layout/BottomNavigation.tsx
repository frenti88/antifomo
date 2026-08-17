'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Inicio',
      href: '/',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      label: 'Guardados',
      href: '/guardados',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    },
    {
      label: 'Enviar plan',
      href: '/enviar',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      )
    }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 lg:hidden bg-bg/95 backdrop-blur-md border-t border-border z-50 pb-[env(safe-area-inset-bottom)] transition-colors"
      aria-label="Navegación principal"
    >
      <ul className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <li key={item.href} className="flex-1">
              <Link 
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-all duration-150 ${
                  isActive ? 'text-text' : 'text-secondary hover:text-text'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={isActive ? 'bg-accent text-black rounded-full p-1' : ''}>
                  {item.icon}
                </div>
                <span className={`text-[10px] uppercase tracking-wider ${isActive ? 'font-bold text-text' : 'font-medium'}`}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

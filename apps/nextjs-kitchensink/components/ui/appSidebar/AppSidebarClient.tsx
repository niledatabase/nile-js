'use client';
import {
  ArrowBigRight,
  ArrowBigRightDash,
  Home,
  Key,
  LogIn,
  MailCheck,
  MailPlus,
  RotateCcw,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

// Menu items.
const items = [
  {
    title: 'Home',
    url: '/',
    icon: Home,
  },
  {
    title: 'Custom sign up',
    url: '/customLogin',
    icon: LogIn,
  },
  {
    title: 'Interactive sign up / sign in',
    url: '/interactive-sign-in',
    icon: LogIn,
  },
  {
    title: 'Google (NextJS)',
    url: '/google',
    icon: ArrowBigRightDash,
  },
  {
    title: 'Google (manual)',
    url: '/google-manual',
    icon: ArrowBigRight,
  },
  {
    title: 'Reset password',
    url: '/reset-password',
    icon: RotateCcw,
  },
  {
    title: 'Forgot password',
    url: '/forgot-password',
    icon: Key,
  },
  {
    title: 'Invites (manual)',
    url: '/invites',
    icon: MailPlus,
  },
  {
    title: 'Verify email (manual)',
    url: '/verify-email',
    icon: MailCheck,
  },
];
export default function SidebarClient() {
  const path = usePathname();
  const [, root] = path.split('/');
  return (
    <SidebarMenu>
      {items.map((item) => {
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={`/${root}`.endsWith(item.url)}>
              <Link href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

import { SignOutButton } from '@niledatabase/react';
import { User } from '@niledatabase/server';

import AppSidebarClient from './AppSidebarClient';

import { nile } from '@/app/api/[...nile]/nile';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

export async function AppSidebar() {
  const me = await nile.users.getSelf<User>();
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarContent>
              <AppSidebarClient />
            </SidebarContent>
          </SidebarGroupContent>
        </SidebarGroup>
        {me instanceof Response ? null : (
          <SidebarGroup>
            <div className="opacity-60 text-sm mb-2">
              Signed in as {me.email}
            </div>
            <SignOutButton />
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

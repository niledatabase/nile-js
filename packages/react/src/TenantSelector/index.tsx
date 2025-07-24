'use client';
import React, { useCallback, useEffect, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from '@tanstack/react-query';
import { ArrowLeftRight, ChevronDown, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Tenant } from '../../../server/src/tenants/types';
import { Input } from '../../components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { cn, componentFetch, ComponentFetchProps } from '../../lib/utils';

import { useTenantId, useTenants } from './hooks';
import { ComponentProps } from './types';

export { useTenantId, useTenants } from './hooks';

const queryClient = new QueryClient();

export default function TenantSelector(props: ComponentProps) {
  const { client } = props ?? {};
  return (
    <QueryClientProvider client={client ?? queryClient}>
      <SelectTenant {...props} />
    </QueryClientProvider>
  );
}

function SelectTenant(props: ComponentProps) {
  const {
    data: tenants = props.tenants ?? [],
    isLoading,
    refetch,
  } = useTenants(props);
  const {
    buttonText = 'Create an organization',
    emptyText = 'You are not part of an organization.',
  } = props;

  const [tenantId, setActiveTenant] = useTenantId(props);
  const [open, setOpen] = useState(false);

  const tenant = tenants.find((t) => t.id === tenantId);

  useEffect(() => {
    // set the first tenant if no tenant is selected
    if (!props.tenants?.length && tenants?.length > 0 && !tenant) {
      setActiveTenant(tenants[0].id);
    }
    // only react to `useTenants`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.tenants?.length, tenants]);

  if ((!isLoading && !tenantId) || !tenant?.name) {
    // the user isn't part of any tenants, so ask them to add one
    return (
      <div className={cn('flex flex-col items-center gap-2', props.className)}>
        <p>{emptyText}</p>
        <CreateTenant
          {...props}
          onSuccess={(d) => {
            setActiveTenant(d.id);
            setOpen(false);
            refetch();
          }}
          trigger={
            <Button>
              <Plus size={18} /> {buttonText}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div className={cn(props.className)}>
        <div className="text-sm pb-1.5 opacity-70 flex flex-row gap-1 items-center">
          <ArrowLeftRight size={14} />
          Switch organization
        </div>
        <div className="flex flex-row w-full flex-1 items-center gap-1">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
              className="group w-80 font-medium text-sm"
              disabled={!tenant?.name}
              onClick={() => {
                setOpen(true);
              }}
            >
              {tenant?.name ?? 'Loading...'}
              <ChevronDown className="transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="flex flex-col gap-0.5 max-h-96 overflow-auto custom-scrollbar w-80">
              {tenants?.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => setActiveTenant(t.id)}
                  active={t.id === tenant?.id}
                >
                  {t.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <CreateTenant
                {...props}
                onSuccess={(d) => {
                  setOpen(false);
                  setActiveTenant(d.id);
                  refetch();
                }}
                trigger={
                  <Button variant="ghost" className="self-center">
                    <Plus size={18} /> Create new organization
                  </Button>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;
type CreateTenantProps = ComponentFetchProps & {
  trigger: React.ReactElement;
  fetchUrl?: string;
  beforeMutate?: (data: AllowedAny) => AllowedAny;
  onSuccess?: (res: Tenant) => void;
  onError?: (error: Error, data: AllowedAny) => void;
  baseUrl?: string;
};
type FormValues = { name: string };
function CreateTenant(props: CreateTenantProps) {
  const [open, setOpen] = useState(false);
  const { trigger, beforeMutate, onSuccess, onError } = props;
  const form = useForm<FormValues>({ defaultValues: { name: '' } });
  const mutation = useMutation({
    mutationFn: async (_data) => {
      const possibleData = beforeMutate && beforeMutate(_data);
      const data = possibleData ?? _data;

      const response = await componentFetch(
        props?.fetchUrl ?? '/tenants',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        props
      );
      if (!response.ok) {
        throw new Error('Failed to fetch tenants');
      }

      return response.json();
    },
    onSuccess: async (data: AllowedAny) => {
      setOpen(false);

      onSuccess && onSuccess(data);
    },
    onError,
  });
  const onSubmit = useCallback(
    (data: FormValues) => {
      mutation.mutate(data);
    },
    [mutation]
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create an organization</DialogTitle>
          <DialogDescription>
            An organization is a group of users.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Organization name"
                      {...field}
                      autoFocus
                    />
                  </FormControl>
                  <FormDescription>
                    This is the name of your organization.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="py-2" loading={mutation.isPending}>
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

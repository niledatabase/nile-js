<script setup lang="ts">
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form'

import  {Button}  from '../components/ui/button'
import  {Input} from '../components/ui/input'
import { useMutation } from "@tanstack/vue-query";
import { useForm } from "vee-validate";
import { signUp } from "../../react/lib/auth/Authorizer";

// Initialize form validation
const form = useForm({
  initialValues: { email: "", password: "" },
});

// Define mutation for sign-in
const mutation = useMutation({
  mutationFn: async (values: any) => signUp(values),
});

const onSubmit = form.handleSubmit((values) => {
  mutation.mutate(values);
})
</script>

<template>
  <form @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="email">
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" placeholder="Email" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          The desired email
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="password">
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="password" placeholder="password" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          The desired password
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit">
      Submit
    </Button>
  </form>
</template>


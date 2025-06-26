"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function SignInForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    if (response.ok) {
      // Handle successful signin
      console.log('Signin successful');
      window.location.href = '/';
    } else {
      // Handle error
      console.error('Signin failed');
    }
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800">ログイン</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">メールアドレス</label>
          <input id="email" type="email" {...form.register("email")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">パスワード</label>
          <input id="password" type="password" {...form.register("password")} className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <button type="submit" className="w-full py-2 font-bold text-white bg-blue-400 rounded-md hover:bg-blue-500 transition-colors">ログイン</button>
      </form>
    </div>
  );
}
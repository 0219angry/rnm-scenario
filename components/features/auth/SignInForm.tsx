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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white/10 backdrop-blur-md rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-white">ログイン</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">メールアドレス</label>
          <input id="email" type="email" {...form.register("email")} className="w-full px-3 py-2 text-white bg-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50" />
        </div>
        <div>
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">パスワード</label>
          <input id="password" type="password" {...form.register("password")} className="w-full px-3 py-2 text-white bg-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50" />
        </div>
        <button type="submit" className="w-full py-2 font-bold text-white bg-blue-400 rounded-md hover:bg-blue-500 transition-colors">ログイン</button>
      </form>
    </div>
  );
}
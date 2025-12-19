"use client";
import { createClient } from "@/utils/supabase/client";
import React, { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function AuthForm({ isRegister = false }: { isRegister?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast.warning("Email dan Password wajib diisi!");
      return;
    }
    const method = isRegister
      ? async (credentials: { email: string; password: string }) => {
          return supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
              emailRedirectTo: `${window.location.origin}/dashboard`,
            },
          });
        }
      : async (credentials: { email: string; password: string }) => {
          return supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });
        };

    const { data, error } = await method({ email, password });
    console.log(data, error);

    if (error) {
      let errorMessage = "Terjadi kesalahan saat otentikasi.";

      if (
        error.message.includes("Invalid login credentials") ||
        error.message.includes("Email not confirmed")
      ) {
        errorMessage = "Email atau Password Salah.";
      } else if (
        error.message.includes("Password should be at least 6 characters")
      ) {
        errorMessage = "Password minimal 6 karakter.";
      } else if (error.message.includes("user already exists")) {
        errorMessage = "Email sudah terdaftar. Silakan login.";
      }

      toast.error(errorMessage);
    } else if (isRegister) {
      toast.info("registrasi berhasil silahkan login");
      router.push("/login");
    } else {
      toast.info("login berhasil");
      router.push("/purchases");
    }

    setIsLoading(false);
  };

  const loginGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
  };

  return (
    <>
      <div className="flex w-full items-center justify-center ">
        <Card className="w-full max-w-sm mx-auto">
          <CardHeader>
            <CardTitle>{isRegister ? "Register" : "Login"}</CardTitle>
            <CardDescription>
              {isRegister
                ? "Buat akun baru Anda untuk mulai melacak pengeluaran."
                : "Masuk ke akun Anda untuk melanjutkan."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-primary">
                      {" "}
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
                <Field>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant={"outline"}
                    className="w-full">
                    {isLoading ? (
                      <p className="flex items-center">
                        <Spinner className="w-4 h-4 mr-2" /> Loading
                      </p>
                    ) : isRegister ? (
                      "Register"
                    ) : (
                      "Login"
                    )}
                  </Button>

                  <Button type="button" onClick={loginGoogle}>
                    {isRegister ? "Register with google" : "Login with google"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>

            <FieldDescription className="mt-8 text-center text-sm">
              {isRegister ? (
                <>
                  Sudah punya akun?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline">
                    Login di sini
                  </Link>
                </>
              ) : (
                <>
                  Belum punya akun?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-primary hover:underline">
                    Daftar
                  </Link>
                </>
              )}
            </FieldDescription>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

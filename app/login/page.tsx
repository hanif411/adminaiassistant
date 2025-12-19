import { AuthForm } from "@/components/Auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <AuthForm isRegister={false} />
    </div>
  );
}

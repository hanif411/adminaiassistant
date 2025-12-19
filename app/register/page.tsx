import { AuthForm } from "@/components/Auth/AuthForm";

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <AuthForm isRegister={true} />
    </div>
  );
}

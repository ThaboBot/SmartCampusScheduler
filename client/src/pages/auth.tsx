import { useState } from "react";
import { Helmet } from "react-helmet";
import AuthLayout from "@/components/layouts/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

export default function AuthPage() {
  const [currentForm, setCurrentForm] = useState<'login' | 'register'>('login');

  const handleAuthSuccess = () => {
    window.location.href = '/dashboard';
  };

  return (
    <>
      <Helmet>
        <title>Login - CampusScheduler</title>
      </Helmet>
      <AuthLayout>
        {currentForm === 'login' ? (
          <LoginForm 
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setCurrentForm('register')}
          />
        ) : (
          <RegisterForm 
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setCurrentForm('login')}
          />
        )}
      </AuthLayout>
    </>
  );
}

"use client";
import React from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { signout } from "@/lib/auth-actions";
import { useAuthContext } from "@/contexts/AuthContext";

const LoginButton = () => {
  const { user, isLoading, error, logout } = useAuthContext();
  const router = useRouter();

  if (isLoading) {
    return (
      <Button disabled>
        Loading...
      </Button>
    );
  }

  if (error) {
    return (
      <Button variant="destructive" disabled>
        Error: {error}
      </Button>
    );
  }

  if (user) {
    return (
      <Button
        onClick={async () => {
          logout(); // Actualizar inmediatamente el estado del contexto
          await signout(); // Ejecutar el logout del servidor
        }}
      >
        Log out
      </Button>
    );
  }
  
  return (
    <Button
      variant="outline"
      onClick={() => {
        router.push("/login");
      }}
    >
      Login
    </Button>
  );
};

export default LoginButton;

'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LogoutPage =  () => {
    const router = useRouter();
    useEffect(() => {
        router.push("/");
    }, [router]);
  return <div>Redirecting...</div>;
};

export default LogoutPage;
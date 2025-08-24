'use client';
import LoginButton from '@/components/LoginLogoutButton';
import UserGreetText from '@/components/UserGreetText';
import ClientOnly from '@/components/ClientOnly';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div suppressHydrationWarning={true}>
      <ThemeToggle />
      <ClientOnly fallback={<div>Loading...</div>} suppressHydrationWarning={true}>
        <UserGreetText />
      </ClientOnly>
      <ClientOnly fallback={<div>Loading...</div>} suppressHydrationWarning={true}>
        <LoginButton />
      </ClientOnly>
    </div>
  );
}

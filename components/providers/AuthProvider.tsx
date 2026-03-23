"use client";

// Better Auth doesn't require a provider wrapper - session is fetched via hooks directly
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

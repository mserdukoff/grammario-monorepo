"use client"

/**
 * App Providers
 * 
 * Wraps the application with all necessary context providers.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "sonner"
import { useState, type ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              background: "hsl(222.2 84% 4.9%)",
              border: "1px solid hsl(217.2 32.6% 17.5%)",
              color: "hsl(210 40% 98%)",
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}

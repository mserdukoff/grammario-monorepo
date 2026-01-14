"use client"

import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-white">
          Authentication Error
        </h1>
        
        <p className="text-slate-400">
          Something went wrong during sign in. This could be because:
        </p>
        
        <ul className="text-sm text-slate-500 text-left space-y-2 bg-slate-900/50 rounded-lg p-4">
          <li>• The sign-in link expired or was already used</li>
          <li>• You denied access to your account</li>
          <li>• There was a network issue</li>
          <li>• The OAuth provider is temporarily unavailable</li>
        </ul>
        
        <div className="flex flex-col gap-3 pt-4">
          <Link href="/">
            <Button className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <p className="text-xs text-slate-600">
            If this keeps happening, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}

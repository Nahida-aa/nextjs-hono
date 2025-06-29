// src/app/(auth)/_comp/LogoutButton.tsx
'use client'
import { Button } from "~/components/ui/button"
import { client_logout } from "../client"

export default function LogoutButton() {
  return <Button variant="destructive" onClick={()=>{
    client_logout({
      redirectTo: '/',
    })
  }}>Logout</Button>
}

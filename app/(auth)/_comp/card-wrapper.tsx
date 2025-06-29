"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"


interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  shownSocial?: boolean
}

export const CardWrapper = ({ children, headerLabel, backButtonLabel, backButtonHref, shownSocial }: CardWrapperProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{headerLabel}</CardTitle>
        <CardDescription>Sign in with one of the following providers</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      <CardFooter>
        <a href={backButtonHref}>{backButtonLabel}</a>
      </CardFooter>
    </Card>
  )
}
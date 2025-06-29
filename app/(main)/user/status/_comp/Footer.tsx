"use client"
import React from 'react'
import {Button as UIButton} from "@heroui/react";
import { client_logout } from '~/app/(auth)/client';

export const Footer = () => {
  return (
    <div><UIButton onPressStart={() => {
      client_logout({
        redirectTo: '/',
      })
    }}>
    Sign out
    </UIButton></div>
  )
}

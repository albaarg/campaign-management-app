'use client'

import React, { createContext, useContext } from 'react'
import { toast, Toaster } from 'react-hot-toast'

interface ToastContextType {
  showToast: (type: 'success' | 'error' | 'warning', title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showToast = (type: 'success' | 'error' | 'warning', title: string, message?: string) => {
    const options = {
      duration: 4000,
      position: 'top-right' as const,
    }

    switch (type) {
      case 'success':
        toast.success(message ? `${title}: ${message}` : title, options)
        break
      case 'error':
        toast.error(message ? `${title}: ${message}` : title, options)
        break
      case 'warning':
        toast(message ? `${title}: ${message}` : title, {
          ...options,
          icon: '⚠️',
          style: {
            background: '#fef3cd',
            color: '#856404',
          },
        })
        break
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

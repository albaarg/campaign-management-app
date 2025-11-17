import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/context/ToastContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gestión de Campañas - Campaigns',
  description: 'Sistema de gestión de campañas de llamados telefónicos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}

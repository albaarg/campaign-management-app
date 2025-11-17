#!/bin/bash

set -e

echo "🚀 Iniciando configuración del proyecto..."

# Crear estructura de directorios
mkdir -p apps/{app-shell,campaigns-mf,people-mf}/src/{app,components,store,types}

# Función para crear una app Next.js
create_next_app() {
  local app_name=$1
  local port=$2
  
  echo "📦 Configurando $app_name..."
  
  cd apps/$app_name
  
  # Package.json
  cat > package.json << PACKAGE_EOF
{
  "name": "$app_name",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev -p $port",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "14.0.3",
    "primereact": "^10.6.2",
    "primeicons": "^7.0.0",
    "primeflex": "^3.3.0",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "@types/node": "^20.9.0",
    "@types/react": "^18.2.28",
    "@types/react-dom": "^18.2.13",
    "tailwindcss": "^3.3.5",
    "eslint": "^8.52.0",
    "eslint-config-next": "14.0.3",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}
PACKAGE_EOF

  # Configuraciones base
  cat > next.config.js << 'CONFIG_EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
CONFIG_EOF

  cat > tailwind.config.js << 'TAILWIND_EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
TAILWIND_EOF

  cat > postcss.config.js << 'POSTCSS_EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
POSTCSS_EOF

  cat > tsconfig.json << 'TSCONFIG_EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
TSCONFIG_EOF

  # Layout base
  mkdir -p src/app
  cat > src/app/layout.tsx << LAYOUT_EOF
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '$app_name',
  description: 'Microfrontend de gestión de campañas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
LAYOUT_EOF

  # CSS global
  cat > src/app/globals.css << 'CSS_EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@import 'primereact/resources/themes/lara-light-cyan/theme.css';
@import 'primereact/resources/primereact.min.css';
@import 'primeicons/primeicons.css';
@import 'primeflex/primeflex.css';
CSS_EOF

  # Next env
  cat > next-env.d.ts << 'NEXT_ENV_EOF'
/// <reference types="next" />
/// <reference types="next/image-types/global" />
NEXT_ENV_EOF

  cd ../..
  echo "✅ $app_name configurado"
}

# Store compartido
create_shared_store() {
  local app_name=$1
  cat > apps/$app_name/src/store/useCampaignStore.ts << 'STORE_EOF'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Person {
  id: string
  campaignId: string
  firstName: string
  lastName: string
  phone: string
}

export interface Campaign {
  id: string
  name: string
  createdAt: string
  startAt: string
  recordCalls: boolean
  status: 'waiting' | 'active' | 'finished'
  personCount: number
}

interface CampaignState {
  campaigns: Campaign[]
  persons: Person[]
  addCampaign: (campaign: Omit<Campaign, 'id' | 'personCount'>) => void
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void
  addPerson: (person: Omit<Person, 'id'>) => void
  addPersons: (persons: Omit<Person, 'id'>[]) => void
  getPersonsByCampaign: (campaignId: string) => Person[]
  getCampaignSummary: () => {
    total: number
    waiting: number
    active: number
    finished: number
    totalPersons: number
  }
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      campaigns: [
        {
          id: 'campaign-1',
          name: 'Campaña de Bienvenida',
          createdAt: new Date('2024-01-15').toISOString(),
          startAt: new Date('2024-02-01').toISOString(),
          recordCalls: true,
          status: 'waiting',
          personCount: 5
        }
      ],
      persons: [
        {
          id: 'person-1',
          campaignId: 'campaign-1',
          firstName: 'Juan',
          lastName: 'Pérez',
          phone: '+5491112345678'
        }
      ],
      
      addCampaign: (campaignData) => {
        const newCampaign: Campaign = {
          ...campaignData,
          id: \`campaign-\${Date.now()}\`,
          personCount: 0,
        }
        set((state) => ({
          campaigns: [...state.campaigns, newCampaign],
        }))
      },
      
      updateCampaign: (id, updates) => {
        set((state) => ({
          campaigns: state.campaigns.map(campaign =>
            campaign.id === id ? { ...campaign, ...updates } : campaign
          ),
        }))
      },
      
      deleteCampaign: (id) => {
        set((state) => ({
          campaigns: state.campaigns.filter(campaign => campaign.id !== id),
          persons: state.persons.filter(person => person.campaignId !== id),
        }))
      },
      
      addPerson: (personData) => {
        const newPerson: Person = {
          ...personData,
          id: \`person-\${Date.now()}\`,
        }
        set((state) => ({
          persons: [...state.persons, newPerson],
          campaigns: state.campaigns.map(campaign =>
            campaign.id === personData.campaignId
              ? { ...campaign, personCount: campaign.personCount + 1 }
              : campaign
          ),
        }))
      },
      
      addPersons: (personsData) => {
        const newPersons: Person[] = personsData.map((person, index) => ({
          ...person,
          id: \`person-\${Date.now()}-\${index}\`,
        }))
        
        const campaignId = personsData[0]?.campaignId
        if (campaignId) {
          set((state) => ({
            persons: [...state.persons, ...newPersons],
            campaigns: state.campaigns.map(campaign =>
              campaign.id === campaignId
                ? { ...campaign, personCount: campaign.personCount + personsData.length }
                : campaign
            ),
          }))
        }
      },
      
      getPersonsByCampaign: (campaignId) => {
        return get().persons.filter(person => person.campaignId === campaignId)
      },
      
      getCampaignSummary: () => {
        const state = get()
        const total = state.campaigns.length
        const waiting = state.campaigns.filter(c => c.status === 'waiting').length
        const active = state.campaigns.filter(c => c.status === 'active').length
        const finished = state.campaigns.filter(c => c.status === 'finished').length
        const totalPersons = state.persons.length
        
        return { total, waiting, active, finished, totalPersons }
      },
    }),
    {
      name: 'campaign-storage',
    }
  )
)
STORE_EOF
}

# Crear las apps
create_next_app "app-shell" "3000"
create_next_app "campaigns-mf" "3001"
create_next_app "people-mf" "3002"

# Crear store compartido para cada app
create_shared_store "app-shell"
create_shared_store "campaigns-mf" 
create_shared_store "people-mf"

# Páginas específicas para cada app
echo "📝 Creando páginas específicas..."

# App Shell - Dashboard
cat > apps/app-shell/src/app/page.tsx << 'SHELL_PAGE_EOF'
'use client'

import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { useCampaignStore } from '@/store/useCampaignStore'

export default function Home() {
  const summary = useCampaignStore((state) => state.getCampaignSummary())
  
  const stats = [
    { title: 'Total Campañas', value: summary.total, icon: 'pi pi-list', color: 'bg-blue-500' },
    { title: 'En Espera', value: summary.waiting, icon: 'pi pi-clock', color: 'bg-yellow-500' },
    { title: 'Activas', value: summary.active, icon: 'pi pi-play', color: 'bg-green-500' },
    { title: 'Finalizadas', value: summary.finished, icon: 'pi pi-check', color: 'bg-gray-500' },
    { title: 'Personas a Llamar', value: summary.totalPersons, icon: 'pi pi-users', color: 'bg-purple-500' }
  ]

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard de Campañas</h1>
          <Button 
            label="Nueva Campaña" 
            icon="pi pi-plus" 
            className="p-button-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-lg border-round-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="block text-3xl font-bold text-gray-900">{stat.value}</span>
                  <span className="text-sm text-gray-600">{stat.title}</span>
                </div>
                <div className={\`\${stat.color} rounded-full p-3\`}>
                  <i className={\`\${stat.icon}\`} style={{ fontSize: '1.5rem', color: 'white' }}></i>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Bienvenido al Sistema" className="shadow-lg">
            <p className="text-gray-700 leading-relaxed">
              Sistema de gestión de campañas de llamados telefónicos. 
              Crea y administra campañas, gestiona personas a contactar 
              y realiza seguimiento del progreso de tus operaciones.
            </p>
          </Card>

          <Card title="Estado del Sistema" className="shadow-lg">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Servicios</span>
                <span className="text-green-500 font-semibold">Operacional</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Base de Datos</span>
                <span className="text-green-500 font-semibold">Conectada</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
SHELL_PAGE_EOF

# Campaigns MF - Lista de campañas
cat > apps/campaigns-mf/src/app/page.tsx << 'CAMPAIGNS_PAGE_EOF'
'use client'

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Card } from 'primereact/card'
import { Tag } from 'primereact/tag'
import { useCampaignStore } from '@/store/useCampaignStore'

export default function CampaignsPage() {
  const { campaigns } = useCampaignStore()

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'waiting': return 'warning'
      case 'active': return 'success'
      case 'finished': return 'info'
      default: return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting': return 'En Espera'
      case 'active': return 'Activa'
      case 'finished': return 'Finalizada'
      default: return status
    }
  }

  const statusBodyTemplate = (rowData: any) => {
    return (
      <Tag 
        value={getStatusLabel(rowData.status)} 
        severity={getStatusSeverity(rowData.status)} 
      />
    )
  }

  return (
    <div className="p-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Gestión de Campañas</h1>
        </div>

        <DataTable 
          value={campaigns} 
          paginator 
          rows={10}
          emptyMessage="No se encontraron campañas"
          className="p-datatable-sm"
        >
          <Column field="name" header="Nombre" sortable />
          <Column field="createdAt" header="Fecha Creación" sortable 
            body={(rowData) => new Date(rowData.createdAt).toLocaleDateString()} />
          <Column field="startAt" header="Fecha Inicio" sortable 
            body={(rowData) => new Date(rowData.startAt).toLocaleDateString()} />
          <Column field="recordCalls" header="Grabar" 
            body={(rowData) => rowData.recordCalls ? 'Sí' : 'No'} />
          <Column field="personCount" header="Personas" sortable />
          <Column field="status" header="Estado" body={statusBodyTemplate} sortable />
        </DataTable>
      </Card>
    </div>
  )
}
CAMPAIGNS_PAGE_EOF

# People MF - Lista de personas
cat > apps/people-mf/src/app/page.tsx << 'PEOPLE_PAGE_EOF'
'use client'

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Card } from 'primereact/card'
import { useCampaignStore } from '@/store/useCampaignStore'

export default function PeoplePage() {
  const { persons, campaigns } = useCampaignStore()

  const getCampaignName = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    return campaign ? campaign.name : 'N/A'
  }

  return (
    <div className="p-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Gestión de Personas</h1>
        </div>

        <DataTable 
          value={persons} 
          paginator 
          rows={10}
          emptyMessage="No se encontraron personas"
          className="p-datatable-sm"
        >
          <Column field="firstName" header="Nombre" sortable />
          <Column field="lastName" header="Apellido" sortable />
          <Column field="phone" header="Teléfono" />
          <Column 
            header="Campaña" 
            body={(rowData) => getCampaignName(rowData.campaignId)}
            sortable 
          />
        </DataTable>
      </Card>
    </div>
  )
}
PEOPLE_PAGE_EOF

echo "🎉 Proyecto configurado exitosamente!"
echo "📋 Próximos pasos:"
echo "1. yarn install"
echo "2. yarn dev"
echo ""
echo "🌐 URLs:"
echo "   App Shell: http://localhost:3000"
echo "   Campaigns: http://localhost:3001"
echo "   People:    http://localhost:3002"

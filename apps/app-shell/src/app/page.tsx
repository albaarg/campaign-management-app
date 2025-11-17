'use client'

import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { useRouter } from 'next/navigation'
import { useCampaignStore } from '@/store/useCampaignStore'

export default function Home() {
  const router = useRouter()
  const summary = useCampaignStore((state) => state.getCampaignSummary())
  
  const stats = [
    { 
      title: 'Total Campañas', 
      value: summary.total, 
      icon: 'pi pi-list', 
      color: 'bg-blue-500',
      description: 'Todas las campañas'
    },
    { 
      title: 'En Espera', 
      value: summary.waiting, 
      icon: 'pi pi-clock', 
      color: 'bg-yellow-500',
      description: 'Campañas programadas'
    },
    { 
      title: 'Activas', 
      value: summary.active, 
      icon: 'pi pi-play', 
      color: 'bg-green-500',
      description: 'Campañas en ejecución'
    },
    { 
      title: 'Finalizadas', 
      value: summary.finished, 
      icon: 'pi pi-check', 
      color: 'bg-gray-500',
      description: 'Campañas completadas'
    },
    { 
      title: 'Personas a Llamar', 
      value: summary.totalPersons, 
      icon: 'pi pi-users', 
      color: 'bg-purple-500',
      description: 'Total de contactos'
    }
  ]

  const quickActions = [
    {
      label: 'Gestionar Campañas',
      icon: 'pi pi-cog',
      action: () => router.push('/campaigns'),
      color: 'p-button-primary'
    },
    {
      label: 'Gestionar Personas',
      icon: 'pi pi-users',
      action: () => router.push('/people'),
      color: 'p-button-success'
    },
    {
      label: 'Nueva Campaña',
      icon: 'pi pi-plus',
      action: () => router.push('/campaigns/create'),
      color: 'p-button-help'
    }
  ]

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard de Campañas</h1>
            <p className="text-gray-600 mt-2">Sistema de gestión de llamados telefónicos con VoiceBot</p>
          </div>
          <Button 
            label="Nueva Campaña" 
            icon="pi pi-plus" 
            className="p-button-primary"
            onClick={() => router.push('/campaigns/create')}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-lg border-round-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <span className="block text-3xl font-bold text-gray-900">{stat.value}</span>
                  <span className="text-sm text-gray-600">{stat.title}</span>
                  <span className="block text-xs text-gray-500 mt-1">{stat.description}</span>
                </div>
                <div className={`${stat.color} rounded-full p-3`}>
                  <i className={stat.icon} style={{ fontSize: '1.5rem', color: 'white' }}></i>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions and Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card title="Acciones Rápidas" className="shadow-lg">
            <div className="flex flex-col gap-3">
              {quickActions.map((action, index) => (
                <Button 
                  key={index}
                  label={action.label} 
                  icon={action.icon} 
                  className={action.color}
                  onClick={action.action}
                />
              ))}
            </div>
          </Card>

          {/* System Status */}
          <Card title="Estado del Sistema" className="shadow-lg">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <i className="pi pi-check-circle text-green-500 text-xl"></i>
                  <span className="font-medium">VoiceBot</span>
                </div>
                <span className="text-green-600 font-semibold">Operacional</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <i className="pi pi-database text-green-500 text-xl"></i>
                  <span className="font-medium">Base de Datos</span>
                </div>
                <span className="text-green-600 font-semibold">Conectada</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <i className="pi pi-cloud text-blue-500 text-xl"></i>
                  <span className="font-medium">Servicios</span>
                </div>
                <span className="text-blue-600 font-semibold">Online</span>
              </div>

              <div className="text-center text-gray-500 text-sm mt-4">
                Última actualización: {new Date().toLocaleDateString('es-ES')}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

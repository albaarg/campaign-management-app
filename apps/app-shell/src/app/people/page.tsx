'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { ConfirmDialog } from 'primereact/confirmdialog'
import { useCampaignStore } from '@/store/useCampaignStore'
import { useToast } from '@/context/ToastContext'

export default function PeoplePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaignId')
  const { showToast } = useToast()

  const { persons, campaigns, addPerson, getPersonsByCampaign, canAddPersons } = useCampaignStore()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newPerson, setNewPerson] = useState({
    campaignId: campaignId || '',
    firstName: '',
    lastName: '',
    phone: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Primero definir todas las funciones auxiliares
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting': return 'En Espera'
      case 'active': return 'Activa'
      case 'finished': return 'Finalizada'
      default: return status
    }
  }

  const getCampaignName = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    return campaign ? campaign.name : 'N/A'
  }

  // Usar useMemo para campaignOptions para que se calcule después del montaje
  const campaignOptions = useMemo(() => {
    return campaigns
      .filter(campaign => canAddPersons(campaign.id))
      .map(campaign => ({
        label: `${campaign.name} (${getStatusLabel(campaign.status)})`,
        value: campaign.id
      }))
  }, [campaigns, canAddPersons])

  const displayedPersons = campaignId ? getPersonsByCampaign(campaignId) : persons

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!newPerson.campaignId) {
      newErrors.campaignId = 'Debe seleccionar una campaña'
    }

    if (!newPerson.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio'
    } else if (newPerson.firstName.trim().length < 2) {
      newErrors.firstName = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!newPerson.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio'
    } else if (newPerson.lastName.trim().length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres'
    }

    if (!newPerson.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio'
    } else if (!/^\+?[\d\s-()]{10,}$/.test(newPerson.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Formato de teléfono inválido (mínimo 10 dígitos)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddPerson = () => {
    if (!validateForm()) {
      showToast('error', 'Error de validación', 'Por favor complete todos los campos requeridos correctamente.')
      return
    }

    // Validar si la campaña permite agregar personas
    if (!canAddPersons(newPerson.campaignId)) {
      showToast('error', 'Error', 'No se pueden agregar personas a campañas finalizadas')
      return
    }

    try {
      addPerson({
        campaignId: newPerson.campaignId,
        firstName: newPerson.firstName.trim(),
        lastName: newPerson.lastName.trim(),
        phone: newPerson.phone.trim()
      })

      showToast('success', 'Éxito', 'Persona agregada correctamente')
      setNewPerson({ campaignId: campaignId || '', firstName: '', lastName: '', phone: '' })
      setShowAddDialog(false)
      setErrors({})
    } catch (error) {
      showToast('error', 'Error', 'Ocurrió un error al agregar la persona')
    }
  }

  const handleAddClick = () => {
    if (campaignId && !canAddPersons(campaignId)) {
      showToast('error', 'Error', 'No se pueden agregar personas a campañas finalizadas')
      return
    }
    setShowAddDialog(true)
  }

  return (
    <div className="p-4">
      <ConfirmDialog />

      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {campaignId ? 'Personas de la Campaña' : 'Gestión de Personas'}
            </h1>
            <p className="text-gray-600 mt-1">
              {campaignId
                ? 'Administra las personas asociadas a esta campaña'
                : 'Gestiona todas las personas de tus campañas'
              }
            </p>
          </div>
          <div className="flex gap-2">
            {campaignId && (
              <Button
                label="Volver a Campañas"
                icon="pi pi-arrow-left"
                className="p-button-outlined"
                onClick={() => router.push('/campaigns')}
              />
            )}
            {!campaignId && (
              <Button
                label="Volver al Dashboard"
                icon="pi pi-home"
                className="p-button-outlined"
                onClick={() => router.push('/')}
              />
            )}
            <Button
              label="Agregar Persona"
              icon="pi pi-plus"
              className="p-button-primary"
              onClick={handleAddClick}
              disabled={campaignId ? !canAddPersons(campaignId) : false}
            />
          </div>
        </div>

        {campaignId && !canAddPersons(campaignId) && (
          <div className="p-3 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <i className="pi pi-exclamation-triangle text-yellow-600"></i>
              <span className="text-yellow-800">
                Esta campaña está finalizada. No se pueden agregar nuevas personas.
              </span>
            </div>
          </div>
        )}

        <DataTable
          value={displayedPersons}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          emptyMessage="No se encontraron personas"
          className="p-datatable-sm"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} personas"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        >
          <Column field="firstName" header="Nombre" sortable style={{ minWidth: '150px' }} />
          <Column field="lastName" header="Apellido" sortable style={{ minWidth: '150px' }} />
          <Column field="phone" header="Teléfono" style={{ minWidth: '150px' }} />
          <Column
            header="Campaña"
            body={(rowData) => getCampaignName(rowData.campaignId)}
            sortable
            style={{ minWidth: '200px' }}
          />
        </DataTable>
      </Card>

      {/* Dialog para agregar persona */}
      <Dialog
        header="Agregar Nueva Persona"
        visible={showAddDialog}
        style={{ width: '50vw', minWidth: '400px' }}
        onHide={() => {
          setShowAddDialog(false)
          setErrors({})
          setNewPerson({ campaignId: campaignId || '', firstName: '', lastName: '', phone: '' })
        }}
      >
        <div className="space-y-4">
          {!campaignId && (
            <div className="field">
              <label htmlFor="campaign" className="block font-medium mb-2">
                Campaña <span className="text-red-500">*</span>
              </label>
              <Dropdown
                id="campaign"
                value={newPerson.campaignId}
                options={campaignOptions}
                onChange={(e) => setNewPerson({...newPerson, campaignId: e.value})}
                placeholder="Seleccione una campaña"
                className={`w-full ${errors.campaignId ? 'p-invalid' : ''}`}
                filter
                filterBy="label"
              />
              {errors.campaignId && <small className="p-error">{errors.campaignId}</small>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label htmlFor="firstName" className="block font-medium mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <InputText
                id="firstName"
                value={newPerson.firstName}
                onChange={(e) => setNewPerson({...newPerson, firstName: e.target.value})}
                className={`w-full ${errors.firstName ? 'p-invalid' : ''}`}
                placeholder="Ingrese el nombre"
              />
              {errors.firstName && <small className="p-error">{errors.firstName}</small>}
            </div>

            <div className="field">
              <label htmlFor="lastName" className="block font-medium mb-2">
                Apellido <span className="text-red-500">*</span>
              </label>
              <InputText
                id="lastName"
                value={newPerson.lastName}
                onChange={(e) => setNewPerson({...newPerson, lastName: e.target.value})}
                className={`w-full ${errors.lastName ? 'p-invalid' : ''}`}
                placeholder="Ingrese el apellido"
              />
              {errors.lastName && <small className="p-error">{errors.lastName}</small>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="phone" className="block font-medium mb-2">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <InputText
              id="phone"
              value={newPerson.phone}
              onChange={(e) => setNewPerson({...newPerson, phone: e.target.value})}
              className={`w-full ${errors.phone ? 'p-invalid' : ''}`}
              placeholder="Ej: +5491112345678"
            />
            {errors.phone && <small className="p-error">{errors.phone}</small>}
            <small className="text-gray-500">Formato: +54 9 11 1234-5678 o 11-1234-5678</small>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-secondary"
              onClick={() => {
                setShowAddDialog(false)
                setErrors({})
                setNewPerson({ campaignId: campaignId || '', firstName: '', lastName: '', phone: '' })
              }}
            />
            <Button
              label="Agregar Persona"
              icon="pi pi-check"
              onClick={handleAddPerson}
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}

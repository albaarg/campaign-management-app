'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Tag } from 'primereact/tag'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { useCampaignStore } from '@/store/useCampaignStore'
import { useToast } from '@/context/ToastContext'
import type { Campaign } from '@/store/useCampaignStore'

export default function CampaignsPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const {
    campaigns,
    deleteCampaign,
    finishCampaign,
    activateCampaign,
    canDeleteCampaign,
    canEditCampaign
  } = useCampaignStore()

  const getStatusSeverity = (status: string): "success" | "warning" | "danger" | "info" | "secondary" | "contrast" | undefined => {
    switch (status) {
      case 'waiting': return 'warning'
      case 'active': return 'success'
      case 'finished': return 'secondary'
      default: return 'info'
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

  const statusBodyTemplate = (rowData: Campaign) => {
    return (
      <Tag
        value={getStatusLabel(rowData.status)}
        severity={getStatusSeverity(rowData.status)}
      />
    )
  }

  const dateBodyTemplate = (date: string) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const recordCallsBodyTemplate = (rowData: Campaign) => {
    return rowData.recordCalls ? (
      <i className="pi pi-check text-green-500"></i>
    ) : (
      <i className="pi pi-times text-red-500"></i>
    )
  }

  const handleDelete = (campaign: Campaign) => {
    if (!canDeleteCampaign(campaign.id)) {
      showToast('error', 'Error', 'Solo se pueden eliminar campañas en estado "En Espera"')
      return
    }

    confirmDialog({
      message: `¿Está seguro de eliminar la campaña "${campaign.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        deleteCampaign(campaign.id)
        showToast('success', 'Éxito', 'Campaña eliminada correctamente')
      }
    })
  }

  const handleFinish = (campaign: Campaign) => {
    if (campaign.status !== 'active') {
      showToast('error', 'Error', 'Solo se pueden finalizar campañas activas')
      return
    }

    confirmDialog({
      message: `¿Está seguro de finalizar la campaña "${campaign.name}"?`,
      header: 'Confirmar Finalización',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, finalizar',
      rejectLabel: 'Cancelar',
      accept: () => {
        finishCampaign(campaign.id)
        showToast('success', 'Éxito', 'Campaña finalizada correctamente')
      }
    })
  }

  const handleActivate = (campaign: Campaign) => {
    if (campaign.status !== 'waiting') {
      showToast('error', 'Error', 'Solo se pueden activar campañas en espera')
      return
    }

    confirmDialog({
      message: `¿Está seguro de activar la campaña "${campaign.name}"?`,
      header: 'Confirmar Activación',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sí, activar',
      rejectLabel: 'Cancelar',
      accept: () => {
        activateCampaign(campaign.id)
        showToast('success', 'Éxito', 'Campaña activada correctamente')
      }
    })
  }

  const handleEdit = (campaign: Campaign) => {
    router.push(`/people?campaignId=${campaign.id}`)
  }

  const actionsBodyTemplate = (rowData: Campaign) => {
    return (
      <div className="flex gap-2">
        {canEditCampaign(rowData.id) && (
          <Button
            icon="pi pi-users"
            className="p-button-rounded p-button-info p-button-sm"
            tooltip="Gestionar Personas"
            tooltipOptions={{ position: 'top' }}
            onClick={() => handleEdit(rowData)}
          />
        )}

        {rowData.status === 'waiting' && (
          <Button
            icon="pi pi-play"
            className="p-button-rounded p-button-success p-button-sm"
            tooltip="Activar Campaña"
            tooltipOptions={{ position: 'top' }}
            onClick={() => handleActivate(rowData)}
          />
        )}

        {rowData.status === 'active' && (
          <Button
            icon="pi pi-stop"
            className="p-button-rounded p-button-warning p-button-sm"
            tooltip="Finalizar Campaña"
            tooltipOptions={{ position: 'top' }}
            onClick={() => handleFinish(rowData)}
          />
        )}

        {canDeleteCampaign(rowData.id) && (
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-danger p-button-sm"
            tooltip="Eliminar Campaña"
            tooltipOptions={{ position: 'top' }}
            onClick={() => handleDelete(rowData)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="p-4">
      <ConfirmDialog />

      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Campañas</h1>
            <p className="text-gray-600 mt-1">Administra tus campañas de llamados telefónicos</p>
          </div>
          <div className="flex gap-2">
            <Button
              label="Volver al Dashboard"
              icon="pi pi-home"
              className="p-button-outlined"
              onClick={() => router.push('/')}
            />
            <Button
              label="Nueva Campaña"
              icon="pi pi-plus"
              className="p-button-primary"
              onClick={() => router.push('/campaigns/create')}
            />
          </div>
        </div>

        <DataTable
          value={campaigns}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          emptyMessage="No se encontraron campañas"
          className="p-datatable-sm"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} campañas"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        >
          <Column field="name" header="Nombre" sortable style={{ minWidth: '200px' }} />
          <Column
            field="createdAt"
            header="Fecha Creación"
            sortable
            body={(rowData) => dateBodyTemplate(rowData.createdAt)}
            style={{ minWidth: '180px' }}
          />
          <Column
            field="startAt"
            header="Fecha Inicio"
            sortable
            body={(rowData) => dateBodyTemplate(rowData.startAt)}
            style={{ minWidth: '180px' }}
          />
          <Column
            field="recordCalls"
            header="Grabar"
            body={recordCallsBodyTemplate}
            style={{ minWidth: '100px', textAlign: 'center' }}
          />
          <Column
            field="personCount"
            header="Personas"
            sortable
            style={{ minWidth: '120px', textAlign: 'center' }}
          />
          <Column
            field="status"
            header="Estado"
            body={statusBodyTemplate}
            sortable
            style={{ minWidth: '150px' }}
          />
          <Column
            header="Acciones"
            body={actionsBodyTemplate}
            style={{ minWidth: '200px' }}
          />
        </DataTable>
      </Card>
    </div>
  )
}

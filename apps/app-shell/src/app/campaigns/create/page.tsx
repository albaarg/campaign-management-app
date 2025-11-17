'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext'
import { Calendar } from 'primereact/calendar'
import { Checkbox } from 'primereact/checkbox'
import { Button } from 'primereact/button'
import { useCampaignStore } from '@/store/useCampaignStore'
import { useToast } from '@/context/ToastContext'

export default function CreateCampaignPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { addCampaign } = useCampaignStore()

  const [formData, setFormData] = useState({
    name: '',
    startAt: new Date(),
    recordCalls: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!formData.startAt) {
      newErrors.startAt = 'La fecha y hora de inicio es obligatoria'
    } else {
      const startDate = new Date(formData.startAt)
      const now = new Date()

      if (startDate < now) {
        newErrors.startAt = 'La fecha y hora de inicio debe ser futura'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      showToast('error', 'Error de validación', 'Por favor complete todos los campos correctamente.')
      return
    }

    try {
      addCampaign({
        name: formData.name.trim(),
        createdAt: new Date().toISOString(),
        startAt: new Date(formData.startAt).toISOString(),
        recordCalls: formData.recordCalls,
        status: 'waiting'
      })

      showToast('success', 'Éxito', 'Campaña creada correctamente')
      router.push('/campaigns')
    } catch (error) {
      showToast('error', 'Error', 'Ocurrió un error al crear la campaña')
    }
  }

  const handleCancel = () => {
    router.push('/campaigns')
  }

  return (
    <div className="p-4">
      <Card>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nueva Campaña</h1>
          <p className="text-gray-600 mt-1">
            Crea una nueva campaña de llamados telefónicos
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">

            <div className="field">
              <label htmlFor="name" className="block font-medium mb-2">
                Nombre de la Campaña <span className="text-red-500">*</span>
              </label>
              <InputText
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  if (errors.name) {
                    setErrors({ ...errors, name: '' })
                  }
                }}
                className={`w-full ${errors.name ? 'p-invalid' : ''}`}
                placeholder="Ej: Campaña de Bienvenida 2024"
              />
              {errors.name && <small className="p-error block mt-1">{errors.name}</small>}
              <small className="text-gray-500 block mt-1">
                Ingrese un nombre descriptivo para identificar la campaña
              </small>
            </div>


            <div className="field">
              <label htmlFor="startAt" className="block font-medium mb-2">
                Fecha y Hora de Inicio <span className="text-red-500">*</span>
              </label>
              <Calendar
                id="startAt"
                value={formData.startAt}
                onChange={(e) => {
                  setFormData({ ...formData, startAt: e.value as Date })
                  if (errors.startAt) {
                    setErrors({ ...errors, startAt: '' })
                  }
                }}
                showTime
                hourFormat="24"
                showIcon
                dateFormat="dd/mm/yy"
                className={`w-full ${errors.startAt ? 'p-invalid' : ''}`}
                placeholder="Seleccione fecha y hora"
                minDate={new Date()}
              />
              {errors.startAt && <small className="p-error block mt-1">{errors.startAt}</small>}
              <small className="text-gray-500 block mt-1">
                Seleccione cuándo comenzarán los llamados de esta campaña
              </small>
            </div>

            <div className="field">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  inputId="recordCalls"
                  checked={formData.recordCalls}
                  onChange={(e) => setFormData({ ...formData, recordCalls: e.checked ?? false })}
                />
                <label htmlFor="recordCalls" className="font-medium cursor-pointer">
                  Grabar llamados
                </label>
              </div>
              <small className="text-gray-500 block mt-2">
                Si está activado, todos los llamados de esta campaña serán grabados para su posterior análisis
              </small>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <i className="pi pi-info-circle text-blue-500 mt-1"></i>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Información importante</h3>
                  <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                    <li>La campaña se creará en estado "En Espera"</li>
                    <li>Podrá agregar personas a la campaña después de crearla</li>
                    <li>Solo podrá eliminar la campaña si está en estado "En Espera"</li>
                    <li>Una vez finalizada, no se podrán agregar más personas</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                label="Cancelar"
                icon="pi pi-times"
                className="p-button-secondary"
                onClick={handleCancel}
              />
              <Button
                type="submit"
                label="Crear Campaña"
                icon="pi pi-check"
                className="p-button-primary"
              />
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}

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
  
  // Campañas
  addCampaign: (campaign: Omit<Campaign, 'id' | 'personCount'>) => void
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void
  finishCampaign: (id: string) => void
  activateCampaign: (id: string) => void
  getCampaign: (id: string) => Campaign | undefined
  
  // Personas
  addPerson: (person: Omit<Person, 'id'>) => void
  addPersons: (persons: Omit<Person, 'id'>[]) => void
  getPersonsByCampaign: (campaignId: string) => Person[]
  removePerson: (personId: string) => void
  
  // Resumen y validaciones
  getCampaignSummary: () => {
    total: number
    waiting: number
    active: number
    finished: number
    totalPersons: number
  }
  canDeleteCampaign: (campaignId: string) => boolean
  canEditCampaign: (campaignId: string) => boolean
  canAddPersons: (campaignId: string) => boolean
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      campaigns: [
        {
          id: 'campaign-1',
          name: 'Campaña de Bienvenida',
          createdAt: new Date('2024-01-15T10:00:00').toISOString(),
          startAt: new Date('2024-02-01T09:00:00').toISOString(),
          recordCalls: true,
          status: 'waiting',
          personCount: 3
        },
        {
          id: 'campaign-2',
          name: 'Campaña Promocional',
          createdAt: new Date('2024-01-20T14:30:00').toISOString(),
          startAt: new Date('2024-01-25T08:00:00').toISOString(),
          recordCalls: false,
          status: 'active',
          personCount: 5
        },
        {
          id: 'campaign-3',
          name: 'Campaña Finalizada',
          createdAt: new Date('2024-01-10T09:15:00').toISOString(),
          startAt: new Date('2024-01-12T10:00:00').toISOString(),
          recordCalls: true,
          status: 'finished',
          personCount: 8
        }
      ],
      persons: [
        {
          id: 'person-1',
          campaignId: 'campaign-1',
          firstName: 'Juan',
          lastName: 'Pérez',
          phone: '+5491112345678'
        },
        {
          id: 'person-2',
          campaignId: 'campaign-1',
          firstName: 'María',
          lastName: 'Gómez',
          phone: '+5491123456789'
        },
        {
          id: 'person-3',
          campaignId: 'campaign-1',
          firstName: 'Carlos',
          lastName: 'López',
          phone: '+5491134567890'
        },
        {
          id: 'person-4',
          campaignId: 'campaign-2',
          firstName: 'Ana',
          lastName: 'Martínez',
          phone: '+5491145678901'
        },
        {
          id: 'person-5',
          campaignId: 'campaign-2',
          firstName: 'Pedro',
          lastName: 'Rodríguez',
          phone: '+5491156789012'
        },
        {
          id: 'person-6',
          campaignId: 'campaign-3',
          firstName: 'Laura',
          lastName: 'García',
          phone: '+5491167890123'
        }
      ],
      
      // ========== CAMPAÑAS ==========
      addCampaign: (campaignData) => {
        const newCampaign: Campaign = {
          ...campaignData,
          id: `campaign-${Date.now()}`,
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

      finishCampaign: (id) => {
        set((state) => ({
          campaigns: state.campaigns.map(campaign =>
            campaign.id === id ? { ...campaign, status: 'finished' } : campaign
          ),
        }))
      },

      activateCampaign: (id) => {
        set((state) => ({
          campaigns: state.campaigns.map(campaign =>
            campaign.id === id ? { ...campaign, status: 'active' } : campaign
          ),
        }))
      },

      getCampaign: (id) => {
        return get().campaigns.find(campaign => campaign.id === id)
      },
      
      // ========== PERSONAS ==========
      addPerson: (personData) => {
        const newPerson: Person = {
          ...personData,
          id: `person-${Date.now()}`,
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
          id: `person-${Date.now()}-${index}`,
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

      removePerson: (personId) => {
        set((state) => {
          const personToRemove = state.persons.find(p => p.id === personId)
          return {
            persons: state.persons.filter(person => person.id !== personId),
            campaigns: state.campaigns.map(campaign =>
              campaign.id === personToRemove?.campaignId
                ? { ...campaign, personCount: Math.max(0, campaign.personCount - 1) }
                : campaign
            ),
          }
        })
      },
      
      getPersonsByCampaign: (campaignId) => {
        return get().persons.filter(person => person.campaignId === campaignId)
      },
      
      // ========== VALIDACIONES Y RESÚMENES ==========
      getCampaignSummary: () => {
        const state = get()
        const total = state.campaigns.length
        const waiting = state.campaigns.filter(c => c.status === 'waiting').length
        const active = state.campaigns.filter(c => c.status === 'active').length
        const finished = state.campaigns.filter(c => c.status === 'finished').length
        const totalPersons = state.persons.length
        
        return { total, waiting, active, finished, totalPersons }
      },

      canDeleteCampaign: (campaignId) => {
        const campaign = get().campaigns.find(c => c.id === campaignId)
        return campaign ? campaign.status === 'waiting' : false
      },

      canEditCampaign: (campaignId) => {
        const campaign = get().campaigns.find(c => c.id === campaignId)
        return campaign ? campaign.status === 'waiting' : false
      },

      canAddPersons: (campaignId) => {
        const campaign = get().campaigns.find(c => c.id === campaignId)
        return campaign ? campaign.status !== 'finished' : false
      },
    }),
    {
      name: 'campaign-storage',
    }
  )
)

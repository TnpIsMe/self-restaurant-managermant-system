import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],   // { maMon, tenMon, donGia, soPhan, ghiChu }

      add: (mon) => {
        const items = get().items
        const existing = items.find((i) => i.maMon === mon.maMon)
        if (existing) {
          set({ items: items.map((i) => i.maMon === mon.maMon ? { ...i, soPhan: i.soPhan + 1 } : i) })
        } else {
          set({ items: [...items, { ...mon, soPhan: 1, ghiChu: '' }] })
        }
      },

      remove: (maMon) => {
        try {
          set({ items: get().items.filter((i) => i.maMon !== maMon) })
          return true
        } catch {
          return false
        }
      },

      restore: (item) => {
        const existing = get().items.find((i) => i.maMon === item.maMon)
        if (existing) {
          set({
            items: get().items.map((i) => i.maMon === item.maMon ? { ...i, soPhan: item.soPhan, ghiChu: item.ghiChu || '' } : i),
          })
        } else {
          set({ items: [...get().items, { ...item }] })
        }
      },

      updateQty: (maMon, soPhan) => {
        if (soPhan <= 0) return get().remove(maMon)
        set({ items: get().items.map((i) => i.maMon === maMon ? { ...i, soPhan } : i) })
      },

      updateNote: (maMon, ghiChu) =>
        set({ items: get().items.map((i) => i.maMon === maMon ? { ...i, ghiChu } : i) }),

      clear: () => set({ items: [] }),

      total: () => get().items.reduce((s, i) => s + i.donGia * i.soPhan, 0),

      count: () => get().items.reduce((s, i) => s + i.soPhan, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
)

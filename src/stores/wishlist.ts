import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistItem {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  image: string | null
  inStock: boolean
}

interface WishlistStore {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  toggleItem: (item: WishlistItem) => void
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          if (state.items.find((i) => i.id === item.id)) return state
          return { items: [...state.items, item] }
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== productId),
        })),

      isInWishlist: (productId) =>
        get().items.some((i) => i.id === productId),

      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.find((i) => i.id === item.id)
          if (exists) {
            return { items: state.items.filter((i) => i.id !== item.id) }
          }
          return { items: [...state.items, item] }
        }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
)

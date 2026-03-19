import { create } from 'zustand'
import {
  collection, doc, onSnapshot,
  setDoc, deleteDoc, updateDoc,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db } from '../services/firebase'

export const useWatchlistStore = create((set, get) => ({
  items: [],
  _unsub: null,

  subscribe: (uid) => {
    get()._unsub?.()
    if (!uid) { set({ items: [], _unsub: null }); return }
    const q = query(
      collection(db, 'users', uid, 'watchlist'),
      orderBy('addedAt', 'desc')
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        set({ items: snap.docs.map((d) => d.data()) })
      },
      (error) => {
        console.warn('[watchlist] Snapshot error:', error.message)
      }
    )
    set({ _unsub: unsub })
  },

  unsubscribeAll: () => {
    get()._unsub?.()
    set({ items: [], _unsub: null })
  },

  add: async (movie, uid) => {
    const ref = doc(db, 'users', uid, 'watchlist', String(movie.id))
    await setDoc(ref, {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path ?? null,
      release_date: movie.release_date ?? '',
      vote_average: movie.vote_average ?? 0,
      addedAt: serverTimestamp(),
      status: 'to_watch',
    })
  },

  remove: async (movieId, uid) => {
    await deleteDoc(doc(db, 'users', uid, 'watchlist', String(movieId)))
  },

  setStatus: async (movieId, uid, status) => {
    await updateDoc(doc(db, 'users', uid, 'watchlist', String(movieId)), { status })
  },

  isInList: (movieId) => get().items.some((m) => m.id === movieId),
  getItemStatus: (movieId) => get().items.find((m) => m.id === movieId)?.status ?? null,
}))

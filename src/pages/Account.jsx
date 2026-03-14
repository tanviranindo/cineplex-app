import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import PasswordInput from '../components/PasswordInput'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog'
import { useAuthStore } from '../stores/authStore'
import { usePageTitle } from '../hooks/usePageTitle'
import { changePasswordSchema, changeDisplayNameSchema } from '../lib/schemas'

export default function Account() {
  usePageTitle('Account Settings')
  const user = useAuthStore((s) => s.user)
  const updateDisplayName = useAuthStore((s) => s.updateDisplayName)
  const updateUserPassword = useAuthStore((s) => s.updateUserPassword)
  const deleteAccount = useAuthStore((s) => s.deleteAccount)
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const isGoogleUser = user?.providerId === 'google.com'

  // Display name form
  const {
    register: regName,
    handleSubmit: handleNameSubmit,
    reset: resetName,
    formState: { errors: nameErrors, isSubmitting: nameSubmitting },
  } = useForm({
    resolver: zodResolver(changeDisplayNameSchema),
    defaultValues: { name: user?.name ?? '' },
  })

  useEffect(() => {
    resetName({ name: user?.name ?? '' })
  }, [user?.name])

  // Password form
  const {
    register: regPwd,
    handleSubmit: handlePwdSubmit,
    watch: watchPwd,
    reset: resetPwd,
    formState: { errors: pwdErrors, isSubmitting: pwdSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  })

  // Delete form (email users only)
  const {
    register: regDelete,
    handleSubmit: handleDeleteSubmit,
    formState: { errors: deleteErrors },
  } = useForm({
    resolver: zodResolver(z.object({ currentPassword: z.string().min(1, 'Required') })),
  })

  const onNameSubmit = async (data) => {
    try {
      await updateDisplayName(data.name)
      toast.success('Display name updated')
    } catch (e) {
      toast.error(e.message ?? 'Failed to update name')
    }
  }

  const onPwdSubmit = async (data) => {
    try {
      await updateUserPassword(data.currentPassword, data.newPassword)
      toast.success('Password updated')
      resetPwd()
    } catch (e) {
      const msg = e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential'
        ? 'Current password is incorrect.'
        : e.code === 'auth/requires-recent-login'
        ? 'Please sign out and sign in again to change your password.'
        : e.message ?? 'Failed to update password'
      toast.error(msg)
    }
  }

  const onDeleteSubmit = async (data) => {
    setDeleteLoading(true)
    try {
      await deleteAccount(isGoogleUser ? undefined : data?.currentPassword)
      toast.success('Account deleted')
      navigate('/')
    } catch (e) {
      const msg = e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential'
        ? 'Current password is incorrect.'
        : e.code === 'auth/requires-recent-login'
        ? 'Please sign out and sign in again to delete your account.'
        : e.message ?? 'Failed to delete account'
      toast.error(msg)
      setDeleteLoading(false)
      setDeleteOpen(false)
    }
  }

  // Password strength for new password
  const newPwd = watchPwd('newPassword') ?? ''
  const strength = [newPwd.length >= 8, /[A-Z]/.test(newPwd), /[0-9]/.test(newPwd), /[^A-Za-z0-9]/.test(newPwd)].filter(Boolean).length
  const strengthColors = ['bg-destructive', 'bg-orange-500', 'bg-amber-500', 'bg-green-500']
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong']

  // Avatar: photoURL or initials
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Account Settings</h1>

      {/* Section 1: Profile */}
      <section className="glass rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Profile
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-white">{initials}</span>
            </div>
          )}
          <div>
            <p className="font-medium">{user?.name || 'No name set'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {isGoogleUser && (
              <p className="text-xs text-muted-foreground/60 mt-1">Signed in with Google</p>
            )}
          </div>
        </div>

        {/* Display name form */}
        <form onSubmit={handleNameSubmit(onNameSubmit)} className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Display Name</label>
            <Input {...regName('name')} placeholder="Your name" />
            {nameErrors.name && <p className="text-destructive text-xs mt-1">{nameErrors.name.message}</p>}
          </div>
          <Button type="submit" size="sm" disabled={nameSubmitting}>
            {nameSubmitting ? 'Saving...' : 'Save Name'}
          </Button>
        </form>
      </section>

      {/* Section 2: Password */}
      <section className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Password
        </h2>

        {isGoogleUser ? (
          <p className="text-sm text-muted-foreground">Your password is managed by Google.</p>
        ) : (
          <form onSubmit={handlePwdSubmit(onPwdSubmit)} className="space-y-3">
            <div>
              <PasswordInput placeholder="Current password" {...regPwd('currentPassword')} />
              {pwdErrors.currentPassword && <p className="text-destructive text-xs mt-1">{pwdErrors.currentPassword.message}</p>}
            </div>
            <div>
              <PasswordInput placeholder="New password" {...regPwd('newPassword')} />
              {pwdErrors.newPassword && <p className="text-destructive text-xs mt-1">{pwdErrors.newPassword.message}</p>}
              {newPwd.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0,1,2,3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? strengthColors[strength - 1] : 'bg-muted'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{strengthLabels[strength - 1] ?? ''}</p>
                </div>
              )}
            </div>
            <div>
              <PasswordInput placeholder="Confirm new password" {...regPwd('confirmNewPassword')} />
              {pwdErrors.confirmNewPassword && <p className="text-destructive text-xs mt-1">{pwdErrors.confirmNewPassword.message}</p>}
            </div>
            <Button type="submit" size="sm" disabled={pwdSubmitting}>
              {pwdSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        )}
      </section>

      {/* Section 3: Danger Zone */}
      <section className="glass rounded-2xl p-6 space-y-4 border border-destructive/30">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
          Note: your watchlist data in Firestore will be orphaned (not automatically deleted).
        </p>
        <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </section>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {isGoogleUser ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You will be prompted to re-authenticate with Google before your account is deleted.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => onDeleteSubmit({})} disabled={deleteLoading}>
                  {deleteLoading ? 'Deleting...' : 'Delete Account'}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleDeleteSubmit(onDeleteSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Enter your password to confirm</label>
                <PasswordInput placeholder="Current password" {...regDelete('currentPassword')} />
                {deleteErrors.currentPassword && <p className="text-destructive text-xs mt-1">{deleteErrors.currentPassword.message}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button type="submit" variant="destructive" disabled={deleteLoading}>
                  {deleteLoading ? 'Deleting...' : 'Delete Account'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

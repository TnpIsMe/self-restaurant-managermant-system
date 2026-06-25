import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Xác nhận', danger = false, loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Hủy</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={() => {
          if (loading) return
          onConfirm?.()
        }} loading={loading} disabled={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

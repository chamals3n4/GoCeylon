interface Props {
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, description, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-[0_24px_64px_rgba(0,0,0,0.14)] p-7"
        onClick={e => e.stopPropagation()}>
        <h2 className="text-base font-semibold text-gray-900 mb-1.5">{title}</h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-7">{description}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              danger
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-900 text-white hover:bg-gray-700'
            }`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

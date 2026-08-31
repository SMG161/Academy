import { useEffect, useState } from 'react';
import Calendar from './Calendar';

interface EditExpiryModalProps {
  isOpen: boolean;
  itemName: string;
  currentExpiresAt: string;
  onClose: () => void;
  onSave: (newExpiresAt: string) => Promise<void>;
}

function toEndOfDayIso(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

const EditExpiryModal = ({ isOpen, itemName, currentExpiresAt, onClose, onSave }: EditExpiryModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(new Date(currentExpiresAt));
      setError(null);
    }
  }, [isOpen, currentExpiresAt]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedDate) return;
    setIsSaving(true);
    setError(null);

    try {
      await onSave(toEndOfDayIso(selectedDate));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Expiry</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
            ×
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">{itemName}</p>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 rounded-md p-3">
            <div className="bg-red-200 text-red-800 text-sm font-medium px-3 py-2 rounded">{error}</div>
          </div>
        )}

        <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} />

        <button
          type="button"
          disabled={!selectedDate || isSaving}
          onClick={handleSave}
          className="w-full mt-6 bg-purple-600 text-white py-3 rounded-md font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default EditExpiryModal;

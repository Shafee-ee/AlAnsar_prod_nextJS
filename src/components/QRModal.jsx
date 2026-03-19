// src/components/QRModal.jsx

'use client';

export default function QRModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white p-4 rounded-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src="/donate-qr.png"
                    alt="UPI QR"
                    className="w-72 h-72 object-contain"
                />
            </div>

            <p className="text-white text-sm mt-4">
                Scan using GPay / PhonePe / Paytm
            </p>

            <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-white text-black rounded-lg"
            >
                Close
            </button>
        </div>
    );
}
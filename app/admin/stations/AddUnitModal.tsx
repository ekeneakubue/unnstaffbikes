"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AddUnitForm from "./AddUnitForm";

export default function AddUnitModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openModal = useCallback(() => {
    setFormKey((key) => key + 1);
    setIsOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    closeModal();
    router.refresh();
  }, [closeModal, router]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, closeModal]);

  const modal =
    isOpen && mounted ? (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f2419]/70 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-station-title"
        onClick={closeModal}
      >
        <div
          className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="shrink-0 border-b border-[#0B5D3B]/10 px-5 py-4">
            <h2 id="add-station-title" className="text-lg font-semibold text-[#0f2419]">
              Add station
            </h2>
            <p className="mt-1 text-sm text-[#6b7f73]">
              Add a station for staff registrations.
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <AddUnitForm
              key={formKey}
              onCancel={closeModal}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-[#0B5D3B] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(11,93,59,0.3)] transition hover:bg-[#094a31]"
      >
        Add station
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}

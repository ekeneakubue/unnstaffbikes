"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ALLOWED_IMAGE_ACCEPT,
  validateImageFile,
} from "@/lib/validate-image";

type CameraCaptureProps = {
  preview: string | null;
  onCapture: (file: File, previewUrl: string) => void;
};

export default function CameraCapture({ preview, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }

    setIsVideoReady(false);
  }, []);

  const closeCamera = useCallback(() => {
    stopStream();
    setIsOpen(false);
    setError(null);
    setIsStarting(false);
  }, [stopStream]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera capture is not supported on this device or browser.");
      return;
    }

    setIsStarting(true);
    setIsVideoReady(false);
    setError(null);
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stopStream();
        return;
      }

      video.srcObject = stream;

      await new Promise<void>((resolve, reject) => {
        const handleReady = () => {
          video.removeEventListener("loadedmetadata", handleReady);
          video.removeEventListener("error", handleError);
          resolve();
        };

        const handleError = () => {
          video.removeEventListener("loadedmetadata", handleReady);
          video.removeEventListener("error", handleError);
          reject(new Error("Video failed to load"));
        };

        video.addEventListener("loadedmetadata", handleReady);
        video.addEventListener("error", handleError);
        void video.play().catch(reject);
      });

      setIsVideoReady(true);
    } catch {
      stopStream();
      setError(
        "Unable to access your camera. Please allow camera permission and try again.",
      );
    } finally {
      setIsStarting(false);
    }
  }, [stopStream]);

  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      void startCamera();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  function openCamera() {
    setError(null);
    window.scrollTo({ top: 0, behavior: "instant" });
    setIsOpen(true);
  }

  function completePhotoSelection(file: File) {
    const previewUrl = URL.createObjectURL(file);
    onCapture(file, previewUrl);
    setPulse(true);
    window.setTimeout(() => setPulse(false), 450);
    closeCamera();
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    completePhotoSelection(file);
  }

  function openFilePicker() {
    setError(null);
    fileInputRef.current?.click();
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !isVideoReady || !video.videoWidth || !video.videoHeight) {
      setError("Camera is not ready yet. Please wait a moment and try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      setError("Could not capture the photo. Please try again.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Could not capture the photo. Please try again.");
          return;
        }

        const file = new File([blob], "profile-photo.jpg", {
          type: "image/jpeg",
        });
        completePhotoSelection(file);
      },
      "image/jpeg",
      0.92,
    );
  }

  const modal =
    isOpen && mounted ? (
      <div
        className="fixed inset-0 z-[9999] overflow-y-auto overscroll-contain bg-[#0f2419]/70 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Profile photo"
        onClick={closeCamera}
      >
        <div className="flex min-h-full justify-center p-4 py-6 sm:p-6">
          <div
            className="my-auto flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="shrink-0 border-b border-[#0B5D3B]/10 px-5 py-4">
              <h3 className="text-base font-semibold text-[#0f2419]">
                Capture profile photo
              </h3>
              <p className="mt-1 text-xs text-[#6b7f73]">
                Use your camera or upload an image from your device.
              </p>
            </div>

            <div className="relative h-[min(50dvh,360px)] min-h-[220px] w-full shrink-0 bg-[#0f2419] sm:min-h-[280px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
              />

              {isStarting ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0f2419]/60 text-sm font-medium text-white">
                  Starting camera…
                </div>
              ) : null}

              {error ? (
                <div className="absolute inset-0 flex items-center justify-center overflow-y-auto bg-[#0f2419]/80 p-6 text-center text-sm text-white">
                  {error}
                </div>
              ) : null}

              {!error ? (
                <div className="pointer-events-none absolute inset-8 rounded-full border-2 border-white/70" />
              ) : null}
            </div>

            <div className="shrink-0 flex flex-col gap-3 border-t border-[#0B5D3B]/10 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={openFilePicker}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border-2 border-[#0B5D3B]/25 px-5 text-sm font-semibold text-[#0B5D3B] transition hover:bg-[#0B5D3B]/5"
              >
                Upload from device
              </button>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCamera}
                  className="inline-flex h-11 items-center justify-center rounded-xl border-2 border-[#0B5D3B]/25 px-5 text-sm font-semibold text-[#0B5D3B] transition hover:bg-[#0B5D3B]/5"
                >
                  Cancel
                </button>
                {!error ? (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={isStarting || !isVideoReady}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-[#0B5D3B] px-6 text-sm font-semibold text-white transition hover:bg-[#094a31] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isStarting || !isVideoReady
                      ? "Preparing camera…"
                      : "Capture photo"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void startCamera()}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-[#0B5D3B] px-6 text-sm font-semibold text-white transition hover:bg-[#094a31]"
                  >
                    Try again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_ACCEPT}
        className="sr-only"
        onChange={handleFileUpload}
      />

      <button
        type="button"
        onClick={openCamera}
        className={`group relative mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#0B5D3B]/35 bg-[#f4f7f5] transition duration-300 hover:scale-105 hover:border-[#0B5D3B] hover:bg-[#0B5D3B]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5D3B] ${pulse ? "scale-105 ring-4 ring-[#0B5D3B]/20" : ""}`}
        aria-label="Capture profile photo"
      >
        {preview ? (
          <Image
            src={preview}
            alt="Captured profile preview"
            fill
            unoptimized
            className="object-cover transition duration-500"
          />
        ) : (
          <span className="flex flex-col items-center gap-1 text-[#0B5D3B]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B5D3B] text-2xl font-light text-white shadow-sm transition duration-300 group-hover:scale-110 group-hover:bg-[#094a31]">
              +
            </span>
            <span className="text-xs font-medium">Capture image</span>
          </span>
        )}
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { nigeriaStates, stateNames } from "@/lib/nigeria-states";
import CameraCapture from "./CameraCapture";

const inputClassName =
  "w-full rounded-xl border border-[#0B5D3B]/20 bg-white px-4 py-3 text-sm text-[#0f2419] outline-none transition duration-200 placeholder:text-[#8a9a90] focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#0B5D3B]/15";

const labelClassName = "mb-1.5 block text-sm font-medium text-[#0f2419]";

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      {children}
    </div>
  );
}

function RevealSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`register-reveal ${visible ? "register-reveal-visible" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

export default function RegisterForm() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [stateOfOrigin, setStateOfOrigin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const localGovernments = useMemo(
    () => (stateOfOrigin ? nigeriaStates[stateOfOrigin] ?? [] : []),
    [stateOfOrigin],
  );

  function handleAvatarCapture(file: File, previewUrl: string) {
    setProfilePhoto(file);
    setAvatarPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return previewUrl;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profilePhoto || submitSuccess) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      formData.set("profilePhoto", profilePhoto);

      const response = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        id?: string;
        error?: string;
      };

      if (!response.ok || !result.id) {
        throw new Error(result.error ?? "Registration failed.");
      }

      setSubmitSuccess(true);
      form.reset();
      setStateOfOrigin("");
      setProfilePhoto(null);
      setAvatarPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Registration failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="register-page relative bg-[#f4f7f5]">
      <div
        aria-hidden
        className="register-bg-glow pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(11,93,59,0.1)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(201,162,39,0.08)_0%,_transparent_50%)]"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-6 pb-14 sm:px-6 sm:py-8 sm:pb-16">
        <header className="register-enter mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0B5D3B] transition duration-200 hover:-translate-x-0.5 hover:text-[#094a31]"
          >
            <span aria-hidden>←</span>
            Back to home
          </Link>

          <div className="register-enter register-enter-delay-1 mt-6 flex items-center gap-4">
            <Image
              src="/unn-logo.svg"
              alt="University of Nigeria, Nsukka logo"
              width={48}
              height={48}
              className="h-12 w-12 transition duration-300 hover:scale-105"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B5D3B]">
                UNN Staff Bike Registration
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[#0f2419] sm:text-3xl">
                Register Your Motorcycle
              </h1>
            </div>
          </div>

          <p className="register-enter register-enter-delay-2 mt-3 max-w-2xl text-sm leading-relaxed text-[#4a5f52] sm:text-base">
            Complete the form below to document your motorcycle for campus
            identification and ownership verification.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="register-enter register-enter-delay-3 rounded-2xl border border-[#0B5D3B]/10 bg-white p-5 shadow-[0_8px_32px_rgba(11,93,59,0.08)] sm:p-8"
        >
          <RevealSection className="border-b border-[#0B5D3B]/10 pb-8">
            <h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#0B5D3B]">
              Profile Photo
            </h2>

            <div className="mt-5 flex w-full flex-col items-center">
              <CameraCapture
                preview={avatarPreview}
                onCapture={handleAvatarCapture}
              />

              <p className="mt-3 max-w-xs text-center text-xs text-[#6b7f73]">
                Tap to open your camera and capture a clear passport-style
                photo.
              </p>
            </div>
          </RevealSection>

          <RevealSection className="border-b border-[#0B5D3B]/10 py-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0B5D3B]">
              Personal Information
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field id="firstname" label="Firstname">
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  required
                  autoComplete="given-name"
                  placeholder="Enter first name"
                  className={inputClassName}
                />
              </Field>

              <Field id="surname" label="Surname">
                <input
                  id="surname"
                  name="surname"
                  type="text"
                  required
                  autoComplete="family-name"
                  placeholder="Enter surname"
                  className={inputClassName}
                />
              </Field>

              <Field id="phoneNumber" label="Phone Number">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="e.g. 08012345678"
                  className={inputClassName}
                />
              </Field>

              <Field id="staffNumber" label="Staff Number / Reg No">
                <input
                  id="staffNumber"
                  name="staffNumber"
                  type="text"
                  required
                  placeholder="Enter staff or registration number"
                  className={inputClassName}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field id="department" label="Department / Center / Unit">
                  <input
                    id="department"
                    name="department"
                    type="text"
                    required
                    placeholder="e.g. Department of Computer Science"
                    className={inputClassName}
                  />
                </Field>
              </div>
            </div>
          </RevealSection>

          <RevealSection className="border-b border-[#0B5D3B]/10 py-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0B5D3B]">
              Origin
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field id="stateOfOrigin" label="State of Origin">
                <select
                  id="stateOfOrigin"
                  name="stateOfOrigin"
                  required
                  value={stateOfOrigin}
                  onChange={(event) => setStateOfOrigin(event.target.value)}
                  className={inputClassName}
                >
                  <option value="">Select state</option>
                  {stateNames.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="localGovernment" label="Local Government">
                <select
                  id="localGovernment"
                  name="localGovernment"
                  key={stateOfOrigin}
                  required
                  disabled={!stateOfOrigin}
                  defaultValue=""
                  className={`${inputClassName} disabled:cursor-not-allowed disabled:bg-[#f4f7f5] disabled:text-[#8a9a90]`}
                >
                  <option value="">
                    {stateOfOrigin
                      ? "Select local government"
                      : "Select a state first"}
                  </option>
                  {localGovernments.map((lga) => (
                    <option key={lga} value={lga}>
                      {lga}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </RevealSection>

          <RevealSection className="pt-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0B5D3B]">
              Motorcycle Details
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field id="motorcycleNo" label="Motorcycle No">
                <input
                  id="motorcycleNo"
                  name="motorcycleNo"
                  type="text"
                  required
                  placeholder="Enter plate or registration number"
                  className={inputClassName}
                />
              </Field>

              <Field id="motorcycleMake" label="Motorcycle Make">
                <input
                  id="motorcycleMake"
                  name="motorcycleMake"
                  type="text"
                  required
                  placeholder="e.g. Honda, Bajaj, TVS"
                  className={inputClassName}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field id="engineNumber" label="Engine Number">
                  <input
                    id="engineNumber"
                    name="engineNumber"
                    type="text"
                    required
                    placeholder="Enter engine number"
                    className={inputClassName}
                  />
                </Field>
              </div>
            </div>
          </RevealSection>

          <div className="register-enter register-enter-delay-5 mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            {submitError ? (
              <p
                role="alert"
                className="whitespace-pre-line text-center text-sm text-[#b91c1c] sm:mr-auto sm:flex sm:items-center sm:text-left"
              >
                {submitError}
              </p>
            ) : null}
            {submitSuccess ? (
              <p className="text-center text-sm text-[#0B5D3B] sm:mr-auto sm:flex sm:items-center sm:text-left">
                Registration submitted successfully. Your application is pending
                review.
              </p>
            ) : null}
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-[#0B5D3B]/25 px-6 text-sm font-semibold text-[#0B5D3B] transition duration-200 hover:-translate-y-0.5 hover:bg-[#0B5D3B]/5"
            >
              {submitSuccess ? "Back to home" : "Cancel"}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || submitSuccess || !profilePhoto}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0B5D3B] px-8 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(11,93,59,0.35)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#094a31] hover:shadow-[0_6px_20px_rgba(11,93,59,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5D3B] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? "Submitting…"
                : submitSuccess
                  ? "Submitted"
                  : "Submit Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

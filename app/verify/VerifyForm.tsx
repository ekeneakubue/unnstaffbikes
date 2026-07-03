"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const inputClassName =
  "w-full rounded-xl border border-[#0B5D3B]/20 bg-white px-4 py-3 text-sm text-[#0f2419] outline-none transition duration-200 placeholder:text-[#8a9a90] focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#0B5D3B]/15";

type VerifyMethod = "staffNumber" | "regNo";

type OwnerRecord = {
  firstname: string;
  surname: string;
  staffNumber: string;
  department: string;
  motorcycleNo: string;
  motorcycleMake: string;
  engineNumber: string;
  photoUrl?: string;
};

const verifyOptions: { value: VerifyMethod; label: string }[] = [
  { value: "staffNumber", label: "Staff Number" },
  { value: "regNo", label: "Reg No" },
];

export default function VerifyForm() {
  const [method, setMethod] = useState<VerifyMethod>("staffNumber");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [owner, setOwner] = useState<OwnerRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setStatus("loading");
    setOwner(null);
    setErrorMessage("");

    await new Promise((resolve) => window.setTimeout(resolve, 900));

    setStatus("error");
    setErrorMessage(
      "No registration found for this number. Please check the details and try again.",
    );
  }

  function handleMethodChange(nextMethod: VerifyMethod) {
    setMethod(nextMethod);
    setQuery("");
    setStatus("idle");
    setOwner(null);
    setErrorMessage("");
  }

  return (
    <div className="register-page relative min-h-screen bg-[#f4f7f5]">
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
                Verify Owner
              </h1>
            </div>
          </div>

          <p className="register-enter register-enter-delay-2 mt-3 max-w-2xl text-sm leading-relaxed text-[#4a5f52] sm:text-base">
            Confirm motorcycle ownership using a staff number or registration
            number from the UNN staff bike registry.
          </p>
        </header>

        <div className="register-enter register-enter-delay-3 rounded-2xl border border-[#0B5D3B]/10 bg-white p-5 shadow-[0_8px_32px_rgba(11,93,59,0.08)] sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0B5D3B]">
                Verify by
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-[#f4f7f5] p-1">
                {verifyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleMethodChange(option.value)}
                    className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition duration-200 ${
                      method === option.value
                        ? "bg-[#0B5D3B] text-white shadow-sm"
                        : "text-[#0B5D3B] hover:bg-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="verifyQuery"
                className="mb-1.5 block text-sm font-medium text-[#0f2419]"
              >
                {method === "staffNumber"
                  ? "Staff Number / Reg No"
                  : "Motorcycle Reg No"}
              </label>
              <input
                id="verifyQuery"
                name="verifyQuery"
                type="text"
                required
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  method === "staffNumber"
                    ? "Enter staff or registration number"
                    : "Enter motorcycle registration number"
                }
                className={inputClassName}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-[#0B5D3B]/25 px-6 text-sm font-semibold text-[#0B5D3B] transition duration-200 hover:-translate-y-0.5 hover:bg-[#0B5D3B]/5"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0B5D3B] px-8 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(11,93,59,0.35)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#094a31] hover:shadow-[0_6px_20px_rgba(11,93,59,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "loading" ? "Verifying…" : "Verify Owner"}
              </button>
            </div>
          </form>

          {status === "error" ? (
            <div
              role="alert"
              className="register-enter mt-6 rounded-xl border border-[#b45309]/25 bg-[#fff7ed] px-4 py-3 text-sm text-[#92400e]"
            >
              {errorMessage}
            </div>
          ) : null}

          {status === "success" && owner ? (
            <div className="register-enter mt-8 border-t border-[#0B5D3B]/10 pt-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0B5D3B]">
                  Owner Details
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B5D3B]/10 px-3 py-1 text-xs font-semibold text-[#0B5D3B]">
                  <span aria-hidden>✓</span>
                  Verified
                </span>
              </div>

              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-[#f4f7f5] ring-2 ring-[#0B5D3B]/15">
                  {owner.photoUrl ? (
                    <Image
                      src={owner.photoUrl}
                      alt={`${owner.firstname} ${owner.surname}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-[#0B5D3B]">
                      {owner.firstname.charAt(0)}
                      {owner.surname.charAt(0)}
                    </div>
                  )}
                </div>

                <dl className="grid w-full gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-[#6b7f73]">
                      Full Name
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-[#0f2419]">
                      {owner.firstname} {owner.surname}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-[#6b7f73]">
                      Staff Number
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-[#0f2419]">
                      {owner.staffNumber}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-[#6b7f73]">
                      Department / Center / Unit
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-[#0f2419]">
                      {owner.department}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-[#6b7f73]">
                      Motorcycle No
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-[#0f2419]">
                      {owner.motorcycleNo}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-[#6b7f73]">
                      Motorcycle Make
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-[#0f2419]">
                      {owner.motorcycleMake}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-[#6b7f73]">
                      Engine Number
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-[#0f2419]">
                      {owner.engineNumber}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

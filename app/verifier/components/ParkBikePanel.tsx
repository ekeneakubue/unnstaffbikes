"use client";

import { useEffect, useState, useTransition } from "react";
import ApplicantAvatar from "@/app/admin/components/ApplicantAvatar";
import { formatPersonName } from "@/lib/format-name";
import { lookupBikeForParking, toggleParkBike } from "../actions";

const inputClassName =
  "w-full rounded-[10px] border border-[#0B5D3B]/20 bg-white px-4 py-3.5 text-sm text-[#0f2419] outline-none transition placeholder:text-[#8a9a90] focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#0B5D3B]/15";

type BikeState = {
  name: string;
  staffNumber: string;
  motorcycleNo: string;
  isParked: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  photoUrl?: string;
};

function mapBikeState(bike: {
  firstname: string;
  middlename: string | null;
  surname: string;
  staffNumber: string;
  motorcycleNo: string;
  isParked: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  photoUrl?: string;
}): BikeState {
  return {
    name: formatPersonName(bike),
    staffNumber: bike.staffNumber,
    motorcycleNo: bike.motorcycleNo,
    isParked: bike.isParked,
    status: bike.status,
    photoUrl: bike.photoUrl,
  };
}

export default function ParkBikePanel({
  initialParkedCount,
}: {
  initialParkedCount: number;
}) {
  const [query, setQuery] = useState("");
  const [parkedCount, setParkedCount] = useState(initialParkedCount);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bike, setBike] = useState<BikeState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLookingUp, startLookup] = useTransition();

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setBike(null);
      return;
    }

    const timer = window.setTimeout(() => {
      startLookup(async () => {
        const result = await lookupBikeForParking(trimmedQuery);

        if (result.bike) {
          setBike(mapBikeState(result.bike));
          setError(null);
          return;
        }

        setBike(null);
      });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [query]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await toggleParkBike(query);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.bike) {
        setBike({
          ...mapBikeState({ ...result.bike, status: "APPROVED" }),
        });
      }

      if (typeof result.parkedCount === "number") {
        setParkedCount(result.parkedCount);
      }

      setMessage(result.message ?? "Parking status updated.");
    });
  }

  function getButtonLabel() {
    if (isPending) {
      return bike?.isParked ? "Unparking…" : "Parking…";
    }

    if (isLookingUp) {
      return "Checking…";
    }

    if (bike?.isParked) {
      return "Unpark bike";
    }

    if (bike) {
      return "Park bike";
    }

    return "Verify bike";
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#0B5D3B]/10 bg-white p-6 shadow-[0_4px_20px_rgba(11,93,59,0.06)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6b7f73]">
          Parked bikes
        </p>
        <p className="mt-2 text-4xl font-bold text-[#0B5D3B]">{parkedCount}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#0B5D3B]/10 bg-white p-6 shadow-[0_4px_20px_rgba(11,93,59,0.06)] sm:p-8"
      >
        <label
          htmlFor="parkQuery"
          className="mb-2 block text-sm font-medium text-[#0f2419]"
        >
          Staff number or reg no
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="parkQuery"
            name="parkQuery"
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setMessage(null);
              setError(null);
            }}
            placeholder="e.g. SS/14545 or ENU 123"
            className={inputClassName}
            required
          />
          <button
            type="submit"
            disabled={isPending || isLookingUp || !query.trim()}
            className="inline-flex shrink-0 items-center justify-center rounded-[10px] bg-[#0B5D3B] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(11,93,59,0.35)] transition hover:bg-[#094a31] disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[8.5rem]"
          >
            {getButtonLabel()}
          </button>
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-[#b45309]/25 bg-[#fff7ed] px-4 py-3 text-sm text-[#92400e]"
          >
            {error}
          </div>
        ) : null}

        {message ? (
          <div
            role="status"
            className="mt-4 rounded-xl border border-[#0B5D3B]/20 bg-[#ecfdf3] px-4 py-3 text-sm text-[#0B5D3B]"
          >
            {message}
          </div>
        ) : null}

        {bike ? (
          <div className="mt-4 flex items-center gap-4 rounded-xl bg-[#f4f7f5] px-4 py-4 text-sm text-[#4a5f52]">
            <ApplicantAvatar
              name={bike.name}
              photoUrl={bike.photoUrl ?? null}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#0f2419]">{bike.name}</p>
              <p className="mt-1">
                {bike.staffNumber} · {bike.motorcycleNo}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-[#6b7f73]">
                {bike.status !== "APPROVED"
                  ? `Registration ${bike.status.toLowerCase()}`
                  : bike.isParked
                    ? "Parked"
                    : "Not parked"}
              </p>
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}

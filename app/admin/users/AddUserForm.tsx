"use client";

import PasswordInput from "@/components/PasswordInput";
import ProfileImageField from "@/components/ProfileImageField";
import { useActionState, useEffect } from "react";
import { createUser } from "./actions";
import type { CreateUserState } from "./types";

const inputClassName =
  "w-full rounded-xl border border-[#0B5D3B]/20 bg-white px-4 py-3 text-sm text-[#0f2419] outline-none transition placeholder:text-[#8a9a90] focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#0B5D3B]/15";

const labelClassName = "mb-1.5 block text-sm font-medium text-[#0f2419]";

const initialState: CreateUserState = {};

type AddUserFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
};

export default function AddUserForm({ onCancel, onSuccess }: AddUserFormProps) {
  const [state, formAction, isPending] = useActionState(
    createUser,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-5">
      {state.error ? (
        <div
          role="alert"
          className="rounded-xl border border-[#b91c1c]/25 bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]"
        >
          {state.error}
        </div>
      ) : null}

      <ProfileImageField id="add-user-photo" name="profilePhoto" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="add-user-firstname" className={labelClassName}>
            First name
          </label>
          <input
            id="add-user-firstname"
            name="firstname"
            type="text"
            required
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="add-user-surname" className={labelClassName}>
            Surname
          </label>
          <input
            id="add-user-surname"
            name="surname"
            type="text"
            required
            className={inputClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="add-user-email" className={labelClassName}>
          Email
        </label>
        <input
          id="add-user-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClassName}
        />
      </div>

      <PasswordInput
        id="add-user-password"
        name="password"
        label="Password"
        required
        minLength={8}
        autoComplete="new-password"
      />

      <div>
        <label htmlFor="add-user-role" className={labelClassName}>
          Role
        </label>
        <select
          id="add-user-role"
          name="role"
          defaultValue="VERIFIER"
          className={inputClassName}
        >
          <option value="VERIFIER">Verifier</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-[#0B5D3B]/10 pt-5">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0B5D3B] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(11,93,59,0.3)] transition hover:bg-[#094a31] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Creating…" : "Create user"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center justify-center rounded-xl border-2 border-[#0B5D3B]/25 px-5 text-sm font-semibold text-[#0B5D3B] transition hover:bg-[#0B5D3B]/5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

"use server";

import {
  createStation as createStationAction,
  toggleStationActive as toggleStationActiveAction,
  type AdminFormState,
} from "@/lib/admin/station-actions";

export async function createStation(
  prevState: AdminFormState,
  formData: FormData,
) {
  return createStationAction(prevState, formData);
}

export async function toggleStationActive(id: string) {
  return toggleStationActiveAction(id);
}

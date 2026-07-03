"use server";

import {
  createFaculty as createFacultyAction,
  toggleFacultyActive as toggleFacultyActiveAction,
  type AdminFormState,
} from "@/lib/admin/faculty-actions";

export async function createFaculty(
  prevState: AdminFormState,
  formData: FormData,
) {
  return createFacultyAction(prevState, formData);
}

export async function toggleFacultyActive(id: string) {
  return toggleFacultyActiveAction(id);
}

"use server";

import {
  createDepartment as createDepartmentAction,
  toggleDepartmentActive as toggleDepartmentActiveAction,
  type AdminFormState,
} from "@/lib/admin/department-actions";

export async function createDepartment(
  prevState: AdminFormState,
  formData: FormData,
) {
  return createDepartmentAction(prevState, formData);
}

export async function toggleDepartmentActive(id: string) {
  return toggleDepartmentActiveAction(id);
}

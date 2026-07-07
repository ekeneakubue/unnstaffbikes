export function formatPersonName(parts: {
  firstname: string;
  middlename?: string | null;
  surname: string;
}) {
  return [parts.firstname, parts.middlename, parts.surname]
    .filter((part) => part && part.trim())
    .join(" ");
}

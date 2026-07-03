const baseUrl = process.env.R2_CHECK_URL ?? "http://localhost:3000/api/r2-health";

const response = await fetch(baseUrl);
const data = await response.json();

console.log(JSON.stringify(data, null, 2));

if (!data.ok) {
  process.exitCode = 1;
}

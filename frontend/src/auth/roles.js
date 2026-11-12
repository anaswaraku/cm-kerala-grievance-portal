export const ROLE_HOME = {
  citizen: "/citizen/dashboard",
  cmo_admin: "/cmo/dashboard",
  department_officer: "/officer/dashboard",
};

export const ROLE_TITLE = {
  citizen: "Citizen dashboard",
  cmo_admin: "CMO administrator dashboard",
  department_officer: "Department officer dashboard",
};

export const ENTRIES = {
  citizen: {
    role: "citizen",
    title: "Citizen sign in",
    label: "a citizen",
  },
  cmo: {
    role: "cmo_admin",
    title: "CMO Administrator Sign in",
    label: "a CMO administrator",
  },
  officer: {
    role: "department_officer",
    title: "Department officer sign in",
    label: "a department officer",
  },
};

export const mismatchMessage = (expectedRole) => {
  const entry = Object.values(ENTRIES).find((item) => item.role === expectedRole);
  return `This account is not authorized as ${entry?.label || "that role"}.`;
};

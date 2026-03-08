const ROLE_MAP: Record<string, string> = {
  TENANT_ADMIN: "Admin",
  MANAGER: "Manager",
  SELLER: "Seller",
};

export function formatRole(role?: string): string {
  if (!role) return "Employee";
  return ROLE_MAP[role] || role;
}

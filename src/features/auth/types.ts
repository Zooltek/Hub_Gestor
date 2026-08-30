export type UserRole = "Manager" | "Operator" | "Admin";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: UserRole;
  customerId: string;
  customerName: string;
  token: string;
}

export interface LoginCredentials {
  username: string;
  password?: string;
  customerId?: string;
}

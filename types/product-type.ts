export interface ProductType {
  id: string;
  name: string;
}

export interface ProductTypeResponse {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

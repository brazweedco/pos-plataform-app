export interface Brand {
  id: string;
  name: string;
}

export interface BrandResponse {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

import { api } from "./api";
import { Brand, BrandResponse } from "@/types/brand";
import { Category, CategoryResponse } from "@/types/category";
import { ProductType, ProductTypeResponse } from "@/types/product-type";
import { ProductRequest, ProductResponse } from "@/types/product";

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Products API
export const productsService = {
  async list(params?: { brandId?: string; categoryId?: string; page?: number; size?: number }) {
    const query = new URLSearchParams();
    if (params?.brandId) query.append("brandId", params.brandId);
    if (params?.categoryId) query.append("categoryId", params.categoryId);
    if (params?.page !== undefined) query.append("page", String(params.page));
    if (params?.size !== undefined) query.append("size", String(params.size));

    const queryString = query.toString();
    const endpoint = `/api/v1/products${queryString ? `?${queryString}` : ""}`;
    return api.get<PageResponse<ProductResponse>>(endpoint);
  },

  async getById(id: string) {
    return api.get<ProductResponse>(`/api/v1/products/${id}`);
  },

  async getBySku(sku: string) {
    return api.get<ProductResponse>(`/api/v1/products/sku/${sku}`);
  },

  async create(data: ProductRequest) {
    return api.post<ProductResponse>("/api/v1/products", data);
  },

  async uploadImage(productId: string, imageUri: string) {
    const formData = new FormData();
    const isWeb = typeof window !== "undefined" && typeof document !== "undefined";

    if (isWeb && imageUri.startsWith("blob:")) {
      // Web: fetch blob URL and create real File
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const filename = `image-${Date.now()}.jpg`;
      const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
      formData.append("image", file);
    } else {
      // React Native: use URI object format
      const filename = imageUri.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";

      const file = {
        uri: imageUri,
        type: mimeType,
        name: filename,
      };

      // @ts-expect-error - React Native FormData accepts this format
      formData.append("image", file);
    }

    return api.postFormData<ProductResponse>(`/api/v1/products/${productId}/image`, formData);
  },

  async update(id: string, data: ProductRequest) {
    return api.put<ProductResponse>(`/api/v1/products/${id}`, data);
  },

  async delete(id: string) {
    return api.delete<void>(`/api/v1/products/${id}`);
  },

  async getLowStock() {
    return api.get<ProductResponse[]>("/api/v1/products/low-stock");
  },
};

// Brands API
export const brandsService = {
  async list(params?: { page?: number; size?: number }) {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append("page", String(params.page));
    if (params?.size !== undefined) query.append("size", String(params.size));

    const queryString = query.toString();
    const endpoint = `/api/v1/brands${queryString ? `?${queryString}` : ""}`;
    return api.get<PageResponse<BrandResponse>>(endpoint);
  },

  async listActive() {
    return api.get<Brand[]>("/api/v1/brands/active");
  },

  async getById(id: string) {
    return api.get<BrandResponse>(`/api/v1/brands/${id}`);
  },

  async create(data: { name: string; description?: string }) {
    return api.post<BrandResponse>("/api/v1/brands", data);
  },

  async update(id: string, data: { name: string; description?: string }) {
    return api.put<BrandResponse>(`/api/v1/brands/${id}`, data);
  },

  async delete(id: string) {
    return api.delete<void>(`/api/v1/brands/${id}`);
  },
};

// Categories API
export const categoriesService = {
  async list(params?: { page?: number; size?: number }) {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append("page", String(params.page));
    if (params?.size !== undefined) query.append("size", String(params.size));

    const queryString = query.toString();
    const endpoint = `/api/v1/categories${queryString ? `?${queryString}` : ""}`;
    return api.get<PageResponse<CategoryResponse>>(endpoint);
  },

  async listActive() {
    return api.get<Category[]>("/api/v1/categories/active");
  },

  async getById(id: string) {
    return api.get<CategoryResponse>(`/api/v1/categories/${id}`);
  },

  async create(data: { name: string; description?: string }) {
    return api.post<CategoryResponse>("/api/v1/categories", data);
  },

  async update(id: string, data: { name: string; description?: string }) {
    return api.put<CategoryResponse>(`/api/v1/categories/${id}`, data);
  },

  async delete(id: string) {
    return api.delete<void>(`/api/v1/categories/${id}`);
  },
};

// Product Types API
export const productTypesService = {
  async list(params?: { page?: number; size?: number }) {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append("page", String(params.page));
    if (params?.size !== undefined) query.append("size", String(params.size));

    const queryString = query.toString();
    const endpoint = `/api/v1/product-types${queryString ? `?${queryString}` : ""}`;
    return api.get<PageResponse<ProductTypeResponse>>(endpoint);
  },

  async listActive() {
    return api.get<ProductType[]>("/api/v1/product-types/active");
  },

  async getById(id: string) {
    return api.get<ProductTypeResponse>(`/api/v1/product-types/${id}`);
  },
};

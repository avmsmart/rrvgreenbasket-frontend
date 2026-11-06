"use client";

import React from "react";
import { ProductFormModal } from "./ProductFormModal";
import { Product, AdminProduct } from "@/types";

export interface EditProductModalProps {
  product: Product | AdminProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updated: Product) => void;
  onSuccess?: (product?: Product | AdminProduct) => void;
}

/**
 * EditProductModal - Thin wrapper around the unified ProductFormModal in "edit" mode.
 * Eliminates duplicate forms and reuses the exact same inputs, validations,
 * category UUID mappings, and multi-image handlers as AddProductModal.
 */
export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  onSuccess,
}) => {
  return (
    <ProductFormModal
      isOpen={isOpen}
      onClose={onClose}
      mode="edit"
      product={product}
      onSave={onSave}
      onSuccess={onSuccess}
    />
  );
};

export default EditProductModal;

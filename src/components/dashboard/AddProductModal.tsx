"use client";

import React from "react";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { Product } from "@/types";

export interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: (product: Partial<Product>) => void;
  onSuccess?: () => void;
}

/**
 * AddProductModal - Thin wrapper around the unified ProductFormModal in "create" mode.
 * Eliminates form duplication and ensures consistent category UUID binding,
 * image uploading, and validation across the entire application.
 */
export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
  onSuccess,
}) => {
  return (
    <ProductFormModal
      isOpen={isOpen}
      onClose={onClose}
      mode="create"
      onProductAdded={onProductAdded}
      onSuccess={onSuccess}
    />
  );
};

export default AddProductModal;

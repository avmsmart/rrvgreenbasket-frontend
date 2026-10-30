"use client";

import React, { useEffect, useRef } from "react";

interface IndeterminateCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
  ariaLabel?: string;
}

export const IndeterminateCheckbox: React.FC<IndeterminateCheckboxProps> = ({
  indeterminate = false,
  ariaLabel,
  className = "",
  ...rest
}) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  return (
    <input
      type="checkbox"
      ref={ref}
      aria-label={ariaLabel || rest["aria-label"]}
      className={`rounded border-slate-300 text-[#00875a] focus:ring-[#00875a] cursor-pointer ${className}`}
      {...rest}
    />
  );
};

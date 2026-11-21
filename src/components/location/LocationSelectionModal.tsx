
"use client";

import React, { useEffect, useState } from "react";
import { X, MapPin, ArrowLeft } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { usePlacesAutocomplete } from "@/hooks/usePlacesAutocomplete";
import { CurrentLocationButton } from "./CurrentLocationButton";
import { LocationSearchInput } from "./LocationSearchInput";
import { LocationSuggestionList } from "./LocationSuggestionList";
import { AddressConfirmation } from "./AddressConfirmation";
import { DeliveryAvailabilityCard } from "./DeliveryAvailabilityCard";
import {
  VerifiedAddress,
  DeliveryVerificationResult,
} from "@/types/location";

export const LocationSelectionModal: React.FC = () => {
  const {
    isModalOpen,
    closeLocationModal,
    verifyAddressAvailability,
    confirmLocation,
  } = useLocation();

  const [step, setStep] = useState<
    "SEARCH" | "CONFIRM_ADDRESS" | "AVAILABILITY_RESULT"
  >("SEARCH");

  const [candidateAddress, setCandidateAddress] =
    useState<VerifiedAddress | null>(null);

  const [availabilityResult, setAvailabilityResult] =
    useState<DeliveryVerificationResult | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const {
    query,
    setQuery,
    suggestions,
    isLoading: isSearching,
    error: searchError,
    selectedIndex,
    selectSuggestion,
    handleKeyDown,
    clear: clearSearch,
  } = usePlacesAutocomplete({
    onSelect: async (address) => {
      setCandidateAddress(address);
      setVerificationError("");
      setStep("CONFIRM_ADDRESS");
    },
  });

  useEffect(() => {
    if (isModalOpen) {
      setStep("SEARCH");
      setCandidateAddress(null);
      setAvailabilityResult(null);
      setVerificationError("");
      setIsVerifying(false);
      clearSearch();
    }
  }, [isModalOpen, clearSearch]);

  if (!isModalOpen) return null;

  // GPS: detect location and automatically verify delivery
  const handleLocationDetected = async (address: VerifiedAddress) => {
    if (isVerifying) return;

    setCandidateAddress(address);
    setAvailabilityResult(null);
    setVerificationError("");
    setIsVerifying(true);

    try {
      const result = await verifyAddressAvailability(address);

      // Automatically save and close when delivery is available
      if (result.available && result.serviceable) {
        confirmLocation(address, result);
        return;
      }

      // Show the unavailable result if outside the delivery zone
      setAvailabilityResult(result);
      setStep("AVAILABILITY_RESULT");
    } catch (error) {
      console.error("GPS delivery verification failed:", error);
      setVerificationError(
        "Unable to verify delivery availability. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Manual address verification
  const handleProceedVerification = async () => {
    if (!candidateAddress || isVerifying) return;

    setIsVerifying(true);
    setVerificationError("");

    try {
      const result = await verifyAddressAvailability(candidateAddress);
      setAvailabilityResult(result);
      setStep("AVAILABILITY_RESULT");
    } catch (error) {
      console.error("Address verification failed:", error);
      setVerificationError(
        "Unable to verify this address. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Manual confirmation after successful verification
  const handleFinalConfirm = () => {
    if (
      candidateAddress &&
      availabilityResult?.available &&
      availabilityResult?.serviceable
    ) {
      confirmLocation(candidateAddress, availabilityResult);
    }
  };

  const handleBackToSearch = () => {
    setStep("SEARCH");
    setCandidateAddress(null);
    setAvailabilityResult(null);
    setVerificationError("");
  };

  const title =
    step === "SEARCH"
      ? "Change Location"
      : step === "CONFIRM_ADDRESS"
        ? "Confirm your address"
        : "Delivery availability";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Select delivery location"
      onClick={closeLocationModal}
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200 sm:items-start sm:justify-start sm:pt-[106px] sm:pl-[6vw]"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex h-[65dvh] min-h-[420px] max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl animate-in slide-in-from-bottom duration-300 sm:h-auto sm:min-h-0 sm:max-h-[80vh] sm:w-[585px] sm:max-w-[calc(100vw-32px)] sm:rounded-none sm:animate-in sm:fade-in sm:duration-200"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-4 py-3.5 sm:px-7 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            {step !== "SEARCH" && (
              <button
                type="button"
                onClick={handleBackToSearch}
                aria-label="Back to location search"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#2f6f5e] hover:bg-emerald-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}

            {step === "SEARCH" && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#00875a] sm:hidden">
                <MapPin className="h-4 w-4" />
              </span>
            )}

            <h2 className="truncate text-base font-semibold text-[#24594b] sm:text-[15px] sm:font-medium sm:text-slate-800">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeLocationModal}
            aria-label="Close location selector"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="h-px shrink-0 bg-slate-100" />

        {/* Main content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-7 sm:py-5">
          {step === "SEARCH" && (
            <>
              {/* Mobile layout */}
              <div className="space-y-3 sm:hidden">
                <LocationSearchInput
                  value={query}
                  onChange={setQuery}
                  onKeyDown={handleKeyDown}
                  onClear={clearSearch}
                  isLoading={isSearching}
                  autoFocus
                  placeholder="Search delivery location"
                />

                {searchError && (
                  <p className="text-xs text-amber-700">
                    {searchError}
                  </p>
                )}

                <LocationSuggestionList
                  suggestions={suggestions}
                  selectedIndex={selectedIndex}
                  onSelect={selectSuggestion}
                  isLoading={isSearching}
                  query={query}
                />

                <div className="border-t border-slate-100 pt-2">
                  <CurrentLocationButton
                    onLocationDetected={handleLocationDetected}
                    disabled={isVerifying}
                  />
                </div>
              </div>

              {/* Desktop layout */}
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="shrink-0">
                    <CurrentLocationButton
                      onLocationDetected={handleLocationDetected}
                      disabled={isVerifying}
                    />
                  </div>

                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-[11px] text-slate-400">
                    OR
                  </span>

                  <div className="min-w-0 flex-1">
                    <LocationSearchInput
                      value={query}
                      onChange={setQuery}
                      onKeyDown={handleKeyDown}
                      onClear={clearSearch}
                      isLoading={isSearching}
                      placeholder="Search delivery location"
                    />
                  </div>
                </div>

                {searchError && (
                  <p className="mt-2 text-xs text-amber-700">
                    {searchError}
                  </p>
                )}

                <LocationSuggestionList
                  suggestions={suggestions}
                  selectedIndex={selectedIndex}
                  onSelect={selectSuggestion}
                  isLoading={isSearching}
                  query={query}
                />
              </div>

              {/* GPS verification status */}
              {isVerifying && (
                <div className="mt-4 flex items-center gap-2 text-sm text-[#00875a]">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#00875a] border-t-transparent" />
                  Checking delivery availability...
                </div>
              )}

              {verificationError && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <span>{verificationError}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationError("");
                      if (candidateAddress) {
                        handleLocationDetected(candidateAddress);
                      }
                    }}
                    className="shrink-0 font-bold underline"
                  >
                    Retry
                  </button>
                </div>
              )}
            </>
          )}

          {/* Manual address confirmation */}
          {step === "CONFIRM_ADDRESS" && candidateAddress && (
            <>
              {verificationError && (
                <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {verificationError}
                </p>
              )}

              <AddressConfirmation
                address={candidateAddress}
                onConfirm={handleProceedVerification}
                onSearchAnother={handleBackToSearch}
                isLoading={isVerifying}
              />
            </>
          )}

          {/* Delivery availability result */}
          {step === "AVAILABILITY_RESULT" &&
            candidateAddress &&
            availabilityResult && (
              <DeliveryAvailabilityCard
                address={candidateAddress}
                result={availabilityResult}
                onConfirmSuccess={handleFinalConfirm}
                onSearchAnother={handleBackToSearch}
                onRetry={handleProceedVerification}
                isLoading={isVerifying}
              />
            )}
        </div>
      </div>
    </div>
  );
};

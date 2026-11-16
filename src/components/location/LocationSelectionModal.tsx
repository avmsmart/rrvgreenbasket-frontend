"use client";

import React, { useState, useEffect } from "react";
import { X, MapPin, Sparkles, ArrowLeft } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { usePlacesAutocomplete } from "@/hooks/usePlacesAutocomplete";
import { CurrentLocationButton } from "./CurrentLocationButton";
import { LocationSearchInput } from "./LocationSearchInput";
import { LocationSuggestionList } from "./LocationSuggestionList";
import { AddressConfirmation } from "./AddressConfirmation";
import { DeliveryAvailabilityCard } from "./DeliveryAvailabilityCard";
import { VerifiedAddress, DeliveryVerificationResult } from "@/types/location";

export const LocationSelectionModal: React.FC = () => {
  const {
    isModalOpen,
    closeLocationModal,
    verifyAddressAvailability,
    confirmLocation,
    selectedAddress: currentSelected,
    storeInfo,
  } = useLocation();

  // Workflow steps: "SEARCH" -> "CONFIRM_ADDRESS" -> "AVAILABILITY_RESULT"
  const [step, setStep] = useState<"SEARCH" | "CONFIRM_ADDRESS" | "AVAILABILITY_RESULT">("SEARCH");
  const [candidateAddress, setCandidateAddress] = useState<VerifiedAddress | null>(null);
  const [availabilityResult, setAvailabilityResult] = useState<DeliveryVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

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
      setStep("CONFIRM_ADDRESS");
    },
  });

  // Reset internal state whenever modal is opened
  useEffect(() => {
    if (isModalOpen) {
      setStep("SEARCH");
      setCandidateAddress(null);
      setAvailabilityResult(null);
      clearSearch();
    }
  }, [isModalOpen, clearSearch]);

  if (!isModalOpen) return null;

  // Handle GPS location detection
  const handleLocationDetected = async (address: VerifiedAddress) => {
    setCandidateAddress(address);
    setStep("CONFIRM_ADDRESS");
  };

  // Run availability check
  const handleProceedVerification = async () => {
    if (!candidateAddress) return;
    setIsVerifying(true);
    try {
      const result = await verifyAddressAvailability(candidateAddress);
      setAvailabilityResult(result);
      setStep("AVAILABILITY_RESULT");
    } finally {
      setIsVerifying(false);
    }
  };

  // Final confirmation when serviceable
  const handleFinalConfirm = () => {
    if (candidateAddress && availabilityResult) {
      confirmLocation(candidateAddress, availabilityResult);
    }
  };

  const handleBackToSearch = () => {
    setStep("SEARCH");
    setAvailabilityResult(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Delivery location selector"
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={closeLocationModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-2 duration-300"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            {step !== "SEARCH" ? (
              <button
                type="button"
                onClick={handleBackToSearch}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                aria-label="Back to search"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                {step === "SEARCH" && "Where should we deliver your groceries?"}
                {step === "CONFIRM_ADDRESS" && "Confirm Delivery Address"}
                {step === "AVAILABILITY_RESULT" && "Delivery Coverage Status"}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {step === "SEARCH" && "Enter your location to verify delivery availability and fees."}
                {step === "CONFIRM_ADDRESS" && "Check the address details before verifying coverage."}
                {step === "AVAILABILITY_RESULT" && "Real-time delivery verification from Kurnool Hub."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeLocationModal}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {step === "SEARCH" && (
            <div className="space-y-4">
              {/* Option A: Use My Current Location */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Option 1 — Automatic Detection
                </span>
                <CurrentLocationButton onLocationDetected={handleLocationDetected} />
              </div>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200/80"></div>
                <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Or Search Address
                </span>
                <div className="flex-grow border-t border-slate-200/80"></div>
              </div>

              {/* Option B: Search Delivery Location */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Option 2 — Search Locality / Landmark
                </span>
                <LocationSearchInput
                  value={query}
                  onChange={setQuery}
                  onKeyDown={handleKeyDown}
                  onClear={clearSearch}
                  isLoading={isSearching}
                  autoFocus={true}
                  placeholder="Enter apartment, street, landmark, or area in Kurnool..."
                />

                {searchError && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
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

              {/* Current active location reminder */}
              {currentSelected && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Currently delivering to:</span>
                  <span className="font-bold text-emerald-800 truncate max-w-[200px]">
                    {currentSelected.displayName}
                  </span>
                </div>
              )}
            </div>
          )}

          {step === "CONFIRM_ADDRESS" && candidateAddress && (
            <AddressConfirmation
              address={candidateAddress}
              onConfirm={handleProceedVerification}
              onSearchAnother={handleBackToSearch}
              isLoading={isVerifying}
            />
          )}

          {step === "AVAILABILITY_RESULT" && candidateAddress && availabilityResult && (
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

        {/* Modal Footer Note */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
          Fresh morning harvest delivery operates daily within 5 km of our Kurnool distribution hub.
        </div>
      </div>
    </div>
  );
};

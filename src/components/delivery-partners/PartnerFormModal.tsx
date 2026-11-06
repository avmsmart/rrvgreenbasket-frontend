"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Bike,
  Check,
  Phone,
  MapPin,
  User,
  Mail,
  Car,
  Star,
  TrendingUp,
  Clock,
  FileText,
  ShieldCheck,
  Award,
} from "lucide-react";
import { DeliveryPartner } from "@/types";

interface PartnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (partner: Partial<DeliveryPartner>) => void;
  initialData?: DeliveryPartner | null;
  initialTab?: "details" | "vehicle" | "performance" | "documents";
}

export const PartnerFormModal: React.FC<PartnerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialTab = "details",
}) => {
  const [modalTab, setModalTab] = useState<"details" | "vehicle" | "performance" | "documents">(
    initialTab === "documents" ? "documents" : initialTab === "performance" ? "performance" : "details"
  );

  const numId = parseInt((initialData?.id || "1").replace(/\D/g, "") || "1");

  // General & Contact Details
  const [name, setName] = useState(initialData?.name || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [area, setArea] = useState(initialData?.area || "Kurnool Town");
  const [status, setStatus] = useState<DeliveryPartner["status"]>(initialData?.status || "Active");

  // Vehicle Details
  const [vehicleType, setVehicleType] = useState(initialData?.vehicleType || "Two Wheeler");
  const [vehicleDetails, setVehicleDetails] = useState(initialData?.vehicleDetails || "");
  const [vehicleNumber, setVehicleNumber] = useState(initialData?.vehicleNumber || "");

  // Performance Metrics
  const [rating, setRating] = useState<number>(initialData?.rating ?? 4.8);
  const [monthlyDeliveries, setMonthlyDeliveries] = useState<number>(
    initialData?.monthlyDeliveries ?? initialData?.totalDeliveries ?? 45
  );
  const [onTimeRate, setOnTimeRate] = useState(initialData?.onTimeRate || "92%");
  const [orderAcceptanceRate, setOrderAcceptanceRate] = useState(initialData?.orderAcceptanceRate || "98%");
  const [customerSatisfaction, setCustomerSatisfaction] = useState(initialData?.customerSatisfaction || "96%");
  const [avgDeliveryTime, setAvgDeliveryTime] = useState(initialData?.avgDeliveryTime || "22 mins");
  const [distanceCovered, setDistanceCovered] = useState(
    initialData?.distanceCovered ||
      (initialData ? `${Math.round((initialData.totalDeliveries || 45) * 2.8)} km` : "340 km")
  );
  const [monthlyEarnings, setMonthlyEarnings] = useState<number>(initialData?.monthlyEarnings ?? 12450);

  // Documents
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState(
    initialData?.drivingLicenseNumber || `AP21-${2018 + (numId % 5)}-00${49280 + numId}`
  );
  const [drivingLicenseStatus, setDrivingLicenseStatus] = useState<"Verified" | "Pending" | "Rejected">(
    initialData?.drivingLicenseStatus || "Verified"
  );
  const [vehicleRcNumber, setVehicleRcNumber] = useState(
    initialData?.vehicleRcNumber || initialData?.vehicleNumber || `AP 21 AB ${4320 + numId}`
  );
  const [vehicleRcStatus, setVehicleRcStatus] = useState<"Verified" | "Pending" | "Rejected">(
    initialData?.vehicleRcStatus || "Verified"
  );
  const [aadhaarNumber, setAadhaarNumber] = useState(
    initialData?.aadhaarNumber || `XXXX-XXXX-${8920 + numId}`
  );
  const [aadhaarStatus, setAadhaarStatus] = useState<"Verified" | "Pending" | "Rejected">(
    initialData?.aadhaarStatus || "Verified"
  );
  const [bankAccountDetails, setBankAccountDetails] = useState(
    initialData?.bankAccountDetails || `SBI •••• ${4520 + numId}`
  );
  const [bankAccountStatus, setBankAccountStatus] = useState<"Verified" | "Pending" | "Rejected">(
    initialData?.bankAccountStatus || "Verified"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize state when initialData, isOpen, or initialTab changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setPhone(initialData.phone || "");
      setEmail(initialData.email || "");
      setArea(initialData.area || "Kurnool Town");
      setStatus(initialData.status || "Active");

      setVehicleType(initialData.vehicleType || "Two Wheeler");
      setVehicleDetails(initialData.vehicleDetails || "");
      setVehicleNumber(initialData.vehicleNumber || "");

      setRating(initialData.rating !== undefined ? initialData.rating : 4.8);
      setMonthlyDeliveries(
        initialData.monthlyDeliveries !== undefined
          ? initialData.monthlyDeliveries
          : initialData.totalDeliveries || 45
      );
      setOnTimeRate(initialData.onTimeRate || "92%");
      setOrderAcceptanceRate(initialData.orderAcceptanceRate || "98%");
      setCustomerSatisfaction(initialData.customerSatisfaction || "96%");
      setAvgDeliveryTime(initialData.avgDeliveryTime || "22 mins");
      setDistanceCovered(
        initialData.distanceCovered ||
          (Math.round((initialData.totalDeliveries || 45) * 2.8) + " km")
      );
      setMonthlyEarnings(initialData.monthlyEarnings !== undefined ? initialData.monthlyEarnings : 12450);

      const parsedId = parseInt(initialData.id.replace(/\D/g, "") || "1");
      setDrivingLicenseNumber(
        initialData.drivingLicenseNumber || `AP21-${2018 + (parsedId % 5)}-00${49280 + parsedId}`
      );
      setDrivingLicenseStatus(initialData.drivingLicenseStatus || "Verified");
      setVehicleRcNumber(
        initialData.vehicleRcNumber || initialData.vehicleNumber || `AP 21 AB ${4320 + parsedId}`
      );
      setVehicleRcStatus(initialData.vehicleRcStatus || "Verified");
      setAadhaarNumber(initialData.aadhaarNumber || `XXXX-XXXX-${8920 + parsedId}`);
      setAadhaarStatus(initialData.aadhaarStatus || "Verified");
      setBankAccountDetails(initialData.bankAccountDetails || `SBI •••• ${4520 + parsedId}`);
      setBankAccountStatus(initialData.bankAccountStatus || "Verified");
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setArea("Kurnool Town");
      setStatus("Active");

      setVehicleType("Two Wheeler");
      setVehicleDetails("");
      setVehicleNumber("");

      setRating(5.0);
      setMonthlyDeliveries(0);
      setOnTimeRate("100%");
      setOrderAcceptanceRate("100%");
      setCustomerSatisfaction("100%");
      setAvgDeliveryTime("20 mins");
      setDistanceCovered("0 km");
      setMonthlyEarnings(0);

      setDrivingLicenseNumber("");
      setDrivingLicenseStatus("Verified");
      setVehicleRcNumber("");
      setVehicleRcStatus("Verified");
      setAadhaarNumber("");
      setAadhaarStatus("Verified");
      setBankAccountDetails("");
      setBankAccountStatus("Verified");
    }

    if (initialTab === "documents") {
      setModalTab("documents");
    } else if (initialTab === "performance") {
      setModalTab("performance");
    } else if (initialTab === "vehicle") {
      setModalTab("vehicle");
    } else {
      setModalTab("details");
    }
  }, [initialData, isOpen, initialTab]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    const parsedMonthlyDeliveries = Number(monthlyDeliveries) || 0;
    const parsedRating = Number(rating) || 4.8;
    const parsedEarnings = Number(monthlyEarnings) || 0;

    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      area,
      status,
      vehicleType,
      vehicleDetails:
        vehicleDetails.trim() || `${vehicleType} (${vehicleNumber.trim() || "AP 21 AB 4321"})`,
      vehicleNumber: vehicleNumber.trim() || initialData?.vehicleNumber || "AP 21 AB 4321",
      rating: parsedRating,
      monthlyDeliveries: parsedMonthlyDeliveries,
      onTimeDeliveries: Math.round(
        parsedMonthlyDeliveries * ((parseFloat(onTimeRate) || 92) / 100)
      ),
      onTimeRate: onTimeRate.includes("%") ? onTimeRate : `${onTimeRate}%`,
      orderAcceptanceRate: orderAcceptanceRate.includes("%")
        ? orderAcceptanceRate
        : `${orderAcceptanceRate}%`,
      customerSatisfaction: customerSatisfaction.includes("%")
        ? customerSatisfaction
        : `${customerSatisfaction}%`,
      avgDeliveryTime: avgDeliveryTime.includes("min")
        ? avgDeliveryTime
        : `${avgDeliveryTime} mins`,
      distanceCovered: distanceCovered.includes("km")
        ? distanceCovered
        : `${distanceCovered} km`,
      monthlyEarnings: parsedEarnings,
      drivingLicenseNumber: drivingLicenseNumber.trim(),
      drivingLicenseStatus,
      vehicleRcNumber: vehicleRcNumber.trim(),
      vehicleRcStatus,
      aadhaarNumber: aadhaarNumber.trim(),
      aadhaarStatus,
      bankAccountDetails: bankAccountDetails.trim(),
      bankAccountStatus,
    });

    setIsSubmitting(false);
    onClose();
  };

  const areas = [
    "Kurnool Town",
    "RTC Colony",
    "Nandyal Road",
    "Anna Nagar",
    "Bellary Road",
    "Autonagar",
    "Kurnool Rural",
    "Venkat Ramana Colony",
    "Sector 1-4",
    "Sector 5-8",
    "Sector 9-12",
    "Old City",
    "New City",
    "Industrial Area",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              {initialData ? initialData.avatar || initialData.name.charAt(0) : <Bike className="w-5 h-5 text-emerald-700" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {initialData ? `Edit Partner: ${initialData.name}` : "Add Delivery Partner"}
                </h3>
                {initialData && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-600 font-semibold">
                    #{initialData.id}
                  </span>
                )}
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-[#00875a] font-bold">
                  {modalTab === "details"
                    ? "Profile Details"
                    : modalTab === "vehicle"
                    ? "Vehicle Details"
                    : modalTab === "performance"
                    ? "Performance Metrics"
                    : "Compliance Documents"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {initialData
                  ? "Update delivery partner profile, vehicle, performance metrics and documents"
                  : "Register new delivery partner and set up credentials"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subtabs Switcher (Only shown when editing Profile Details & Vehicle) */}
        {(initialTab === "details" || initialTab === "vehicle") && (
          <div className="px-5 pt-3 pb-2 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setModalTab("details")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                modalTab === "details"
                  ? "bg-[#00875a] text-white shadow-3xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile Details</span>
            </button>
            <button
              type="button"
              onClick={() => setModalTab("vehicle")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                modalTab === "vehicle"
                  ? "bg-[#00875a] text-white shadow-3xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Vehicle Details</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* TAB 1: Profile Details */}
          {modalTab === "details" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="driver@gmail.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Delivery Area
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] cursor-pointer"
                  >
                    {areas.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Partner Status
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {(["Active", "On Delivery", "Idle", "Inactive"] as DeliveryPartner["status"][]).map((st) => (
                    <label key={st} className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100">
                      <input
                        type="radio"
                        name="status"
                        value={st}
                        checked={status === st}
                        onChange={() => setStatus(st)}
                        className="text-[#00875a] focus:ring-[#00875a]"
                      />
                      <span className="text-xs font-bold text-slate-800">{st}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Vehicle */}
          {modalTab === "vehicle" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] cursor-pointer"
                  >
                    <option value="Two Wheeler">Two Wheeler (Bike/Scooter)</option>
                    <option value="Electric Scooter">Electric Scooter (EV)</option>
                    <option value="Three Wheeler">Three Wheeler (Auto)</option>
                    <option value="Delivery Van">Delivery Van</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registration Plate Number
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. AP 21 AB 4321"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vehicle Model & Brand Details
                </label>
                <input
                  type="text"
                  value={vehicleDetails}
                  onChange={(e) => setVehicleDetails(e.target.value)}
                  placeholder="e.g. Honda Activa 6G (Grey)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Performance */}
          {modalTab === "performance" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <Star className="w-4 h-4 fill-emerald-500 text-emerald-600 shrink-0" />
                <span>Adjust partner delivery performance statistics and monthly targets</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rating (1.0 to 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(parseFloat(e.target.value) || 5.0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monthly Deliveries
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={monthlyDeliveries}
                    onChange={(e) => setMonthlyDeliveries(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    On-Time Delivery Rate
                  </label>
                  <input
                    type="text"
                    value={onTimeRate}
                    onChange={(e) => setOnTimeRate(e.target.value)}
                    placeholder="92%"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Order Acceptance Rate
                  </label>
                  <input
                    type="text"
                    value={orderAcceptanceRate}
                    onChange={(e) => setOrderAcceptanceRate(e.target.value)}
                    placeholder="98%"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Satisfaction
                  </label>
                  <input
                    type="text"
                    value={customerSatisfaction}
                    onChange={(e) => setCustomerSatisfaction(e.target.value)}
                    placeholder="96%"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Avg Delivery Time
                  </label>
                  <input
                    type="text"
                    value={avgDeliveryTime}
                    onChange={(e) => setAvgDeliveryTime(e.target.value)}
                    placeholder="22 mins"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Distance Covered
                  </label>
                  <input
                    type="text"
                    value={distanceCovered}
                    onChange={(e) => setDistanceCovered(e.target.value)}
                    placeholder="340 km"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monthly Earnings (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={monthlyEarnings}
                    onChange={(e) => setMonthlyEarnings(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Documents */}
          {modalTab === "documents" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verify driving license, vehicle registration, Aadhaar, and bank account</span>
              </div>

              {/* Driving License */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Driving License (DL)
                  </label>
                  <select
                    value={drivingLicenseStatus}
                    onChange={(e) => setDrivingLicenseStatus(e.target.value as "Verified" | "Pending" | "Rejected")}
                    className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Verified">Verified ✓</option>
                    <option value="Pending">Pending ⏳</option>
                    <option value="Rejected">Rejected ✕</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={drivingLicenseNumber}
                  onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                  placeholder="e.g. AP21-2018-0049281"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>

              {/* Vehicle RC */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Vehicle RC Number
                  </label>
                  <select
                    value={vehicleRcStatus}
                    onChange={(e) => setVehicleRcStatus(e.target.value as "Verified" | "Pending" | "Rejected")}
                    className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Verified">Verified ✓</option>
                    <option value="Pending">Pending ⏳</option>
                    <option value="Rejected">Rejected ✕</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={vehicleRcNumber}
                  onChange={(e) => setVehicleRcNumber(e.target.value)}
                  placeholder="e.g. AP 21 AB 4321"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>

              {/* Aadhaar */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Aadhaar Card
                  </label>
                  <select
                    value={aadhaarStatus}
                    onChange={(e) => setAadhaarStatus(e.target.value as "Verified" | "Pending" | "Rejected")}
                    className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Verified">Verified ✓</option>
                    <option value="Pending">Pending ⏳</option>
                    <option value="Rejected">Rejected ✕</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  placeholder="e.g. XXXX-XXXX-8921"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>

              {/* Bank Account */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Bank Account Details
                  </label>
                  <select
                    value={bankAccountStatus}
                    onChange={(e) => setBankAccountStatus(e.target.value as "Verified" | "Pending" | "Rejected")}
                    className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Verified">Verified ✓</option>
                    <option value="Pending">Pending ⏳</option>
                    <option value="Rejected">Rejected ✕</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={bankAccountDetails}
                  onChange={(e) => setBankAccountDetails(e.target.value)}
                  placeholder="e.g. SBI •••• 4521"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00875a] hover:bg-[#00704a] text-white shadow-3xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? "Save Changes" : "Register Partner"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

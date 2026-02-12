import { useState } from "react";
import type React from "react";
import {
  type Journey,
  type JourneyStep,
  DESKTOP_JOURNEYS,
  MOBILE_JOURNEYS,
  OMS_JOURNEYS,
  PARTNER_PANEL_JOURNEYS,
} from "../data/journeyDetails";

interface JourneyDetailsViewProps {
  platform?: string;
  testData?: any; // Real test data from Supabase
  initialPlatform?: string; // Platform to select on initial load
}

type PlatformType = "desktop" | "mobile" | "oms" | "partner";

export function JourneyDetailsView({
  platform,
  testData,
  initialPlatform,
}: JourneyDetailsViewProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(
    (initialPlatform as PlatformType) || "desktop",
  );
  const [expandedJourney, setExpandedJourney] = useState<number | null>(null);

  const toggleJourney = (journeyId: number) => {
    setExpandedJourney(expandedJourney === journeyId ? null : journeyId);
  };

  const getJourneyData = (plat: PlatformType): Journey[] => {
    // For OMS and Partner Panel, ALWAYS use mock data (they only have 1 journey each)
    // Ignore any testData from API for these platforms
    if (plat === "oms") {
      console.log("🔍 OMS selected - forcing OMS_JOURNEYS (1 journey only)");
      return OMS_JOURNEYS;
    }
    if (plat === "partner") {
      console.log(
        "🔍 Partner Panel selected - forcing PARTNER_PANEL_JOURNEYS (1 journey only)",
      );
      return PARTNER_PANEL_JOURNEYS;
    }

    // For other platforms, use API data if available
    const apiPlatformKey = plat === "android" ? "ios" : plat;

    // Use real data from Supabase if available, otherwise fall back to mock data
    if (
      testData &&
      testData[apiPlatformKey] &&
      testData[apiPlatformKey].modules &&
      testData[apiPlatformKey].modules.length > 0
    ) {
      console.log(
        `📊 Using API data for ${plat}:`,
        testData[apiPlatformKey].modules.length,
        "journeys",
      );
      return testData[apiPlatformKey].modules.map(
        (module: any, index: number) => ({
          id: index + 1,
          name: module.name || `Journey ${index + 1}`,
          status: module.status || (module.failed > 0 ? "FAILED" : "PASSED"),
          passed: module.passed || 0,
          failed: module.failed || 0,
          duration: module.duration || 0,
          steps: module.steps || [],
        }),
      );
    }

    // Fallback to mock data
    console.log(`📦 Using mock data for ${plat}`);
    switch (plat) {
      case "mobile":
        return MOBILE_JOURNEYS;
      case "android":
        return ANDROID_JOURNEYS;
      default:
        return DESKTOP_JOURNEYS;
    }
  };

  const getPlatformLabel = (plat: PlatformType): string => {
    switch (plat) {
      case "mobile":
        return "Mobile Site";
      case "android":
        return "Android";
      case "oms":
        return "OMS";
      case "partner":
        return "Partner Panel";
      default:
        return "Desktop Site";
    }
  };

  const journeys = getJourneyData(selectedPlatform);
  const platformLabel = getPlatformLabel(selectedPlatform);

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      "User Authentication": "#FF6B6B",
      "Homepage Setup": "#4ECDC4",
      "Product Discovery": "#45B7D1",
      "Product Selection": "#96CEB4",
      "Cart Management": "#FFEAA7",
      "Payment Process": "#DDA15E",
      "Order Completion": "#10B981",
      "Profile Management": "#8E44AD",
      Navigation: "#3498DB",
      "Delivery Setup": "#E74C3C",
      "Address Management": "#F39C12",
      "Reminder Management": "#9B59B6",
      "FAQ Management": "#1ABC9C",
      "Location Setup": "#E67E22",
      "Variant Testing": "#C0392B",
      "Coupon Testing": "#16A085",
      Personalization: "#8E44AD",
      "Message Card": "#D35400",
      "Product Navigation": "#2980B9",
      "Photo Gallery": "#27AE60",
      "Product Details": "#2C3E50",
      "Journey Step": "#34495E",
      "Search Function": "#7F8C8D",
      "Photo Upload": "#16A085",
      "Location Change": "#E67E22",
      "Category Navigation": "#8E44AD",
      "Gmail OTP Journey": "#EA4335",
      "Order Management": "#3498DB",
      "Customer Details": "#9B59B6",
      "Order Tracking": "#1ABC9C",
      Inventory: "#E67E22",
      "Refund Management": "#E74C3C",
      Reporting: "#27AE60",
      "Customer Management": "#F39C12",
      "Delivery Management": "#16A085",
      "Return Management": "#8E44AD",
      Dashboard: "#3498DB",
      "Product Management": "#E67E22",
      Analytics: "#9B59B6",
      Promotions: "#1ABC9C",
      Support: "#27AE60",
      Compliance: "#F39C12",
      Account: "#16A085",
      Sales: "#2ECC71",
      Operations: "#E67E22",
      Performance: "#9B59B6",
      "Delivery Tracking": "#3498DB",
      "Delivery Status": "#E74C3C",
    };
    return colors[category] || "#95A5A6";
  };

  return (
    <div className="journey-details-container">
      <div className="journey-header">
        <h2>
          <i className="fas fa-map-location-dot" /> Journey Details
        </h2>
      </div>

      <div className="tabs">
        <button
          className={`tab ${selectedPlatform === "desktop" ? "active" : ""}`}
          onClick={() => {
            setSelectedPlatform("desktop");
            setExpandedJourney(null);
          }}
        >
          <i className="fas fa-laptop-code" /> Desktop Site
        </button>
        <button
          className={`tab ${selectedPlatform === "mobile" ? "active" : ""}`}
          onClick={() => {
            setSelectedPlatform("mobile");
            setExpandedJourney(null);
          }}
        >
          <i className="fas fa-mobile-screen" /> Mobile Site
        </button>
        <button
          className={`tab ${selectedPlatform === "oms" ? "active" : ""}`}
          onClick={() => {
            setSelectedPlatform("oms");
            setExpandedJourney(null);
          }}
        >
          <i className="fas fa-boxes-stacked" /> OMS
        </button>
        <button
          className={`tab ${selectedPlatform === "partner" ? "active" : ""}`}
          onClick={() => {
            setSelectedPlatform("partner");
            setExpandedJourney(null);
          }}
        >
          <i className="fas fa-handshake" /> Partner Panel
        </button>
        <button
          className={`tab ${selectedPlatform === "android" ? "active" : ""}`}
          onClick={() => {
            setSelectedPlatform("android");
            setExpandedJourney(null);
          }}
        >
          <i className="fab fa-android" /> Android
        </button>
      </div>

      <div className="journey-platform-info">
        <p className="journey-subtitle">
          {platformLabel} - Total Journeys: <strong>{journeys.length}</strong>
        </p>
      </div>

      <div className="journeys-list">
        {journeys.map((journey) => (
          <div key={journey.id} className="journey-item">
            <div
              className="journey-header-row"
              onClick={() => toggleJourney(journey.id)}
            >
              <div className="journey-title-section">
                <span className="journey-toggle-icon">
                  <i
                    className={`fas fa-chevron-${
                      expandedJourney === journey.id ? "down" : "right"
                    }`}
                  />
                </span>
                <span className="journey-full-title">
                  {journey.name.startsWith("Journey")
                    ? journey.name
                    : `Journey ${journey.id} - ${journey.name}`}
                </span>
                {journey.status && (
                  <span
                    className={`journey-status ${journey.status.toLowerCase()}`}
                  >
                    {journey.status === "FAILED" ? "❌" : "✅"} {journey.status}
                  </span>
                )}
              </div>
              <div className="journey-meta">
                {journey.passed !== undefined &&
                  journey.failed !== undefined && (
                    <span className="journey-stats">
                      <span className="passed-count">✅ {journey.passed}</span>
                      <span className="failed-count">❌ {journey.failed}</span>
                    </span>
                  )}
                {journey.duration && (
                  <span className="journey-duration">
                    <i className="fas fa-clock" />{" "}
                    {(journey.duration / 1000).toFixed(1)}s
                  </span>
                )}
                <span className="step-count">
                  <i className="fas fa-list-check" /> {journey.steps.length}{" "}
                  steps
                </span>
              </div>
            </div>

            {expandedJourney === journey.id && (
              <div className="journey-steps">
                <div className="steps-timeline">
                  {journey.steps.map((step, index) => {
                    // Handle both mock data (category/action) and real data (step_name/status)
                    const stepName =
                      step.step_name || step.action || `Step ${index + 1}`;
                    const stepCategory = step.category || "General";
                    const stepStatus = step.status;
                    const stepDuration = step.duration_ms;
                    const stepError = step.error_message;

                    return (
                      <div
                        key={index}
                        className={`step-item ${stepStatus ? stepStatus.toLowerCase() : ""}`}
                      >
                        <div className="step-number">
                          {index + 1}
                          {stepStatus && (
                            <span
                              className={`step-status-icon ${stepStatus.toLowerCase()}`}
                            >
                              {stepStatus === "FAILED"
                                ? "❌"
                                : stepStatus === "PASSED"
                                  ? "✅"
                                  : "⏸️"}
                            </span>
                          )}
                        </div>
                        <div className="step-content">
                          <div className="step-category">
                            <span
                              className="category-badge"
                              style={{
                                backgroundColor: getCategoryColor(stepCategory),
                              }}
                            >
                              {stepCategory}
                            </span>
                            {stepStatus && (
                              <span
                                className={`status-badge ${stepStatus.toLowerCase()}`}
                              >
                                {stepStatus}
                              </span>
                            )}
                          </div>
                          <div className="step-action">{stepName}</div>
                          {stepDuration && (
                            <div className="step-duration">
                              <i className="fas fa-stopwatch" /> {stepDuration}
                              ms
                            </div>
                          )}
                          {stepError && (
                            <div className="step-error">
                              <i className="fas fa-exclamation-triangle" />{" "}
                              {stepError}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

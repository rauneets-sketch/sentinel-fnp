import { useEffect, useState, useRef } from "react";
import type React from "react";
import Highcharts from "highcharts";
import HighchartsMore from "highcharts/highcharts-more";
import Highcharts3D from "highcharts/highcharts-3d";
import SolidGauge from "highcharts/modules/solid-gauge";
import Heatmap from "highcharts/modules/heatmap";
import Funnel from "highcharts/modules/funnel";
import Exporting from "highcharts/modules/exporting";
import ExportData from "highcharts/modules/export-data";
import Accessibility from "highcharts/modules/accessibility";
import axios from "axios";
import { JourneyDetailsView } from "./components/JourneyDetailsView";
import "./components/JourneyDetailsView.css";
import FallingHearts from "./components/FallingHearts";
import JourneyFailureTimeline from "./components/JourneyFailureTimeline";
import JourneyPassTimeline from "./components/JourneyPassTimeline";
import CombinedPassFailChart from "./components/CombinedPassFailChart";
import PlatformGraphSwitcher from "./components/PlatformGraphSwitcher";

const initModule = (mod: any) => {
  if (typeof mod === "function") {
    mod(Highcharts);
  } else if (mod && typeof mod.default === "function") {
    mod.default(Highcharts);
  }
};

initModule(HighchartsMore);
initModule(Highcharts3D);
initModule(SolidGauge);
initModule(Heatmap);
initModule(Funnel);
initModule(Exporting);
initModule(ExportData);
initModule(Accessibility);

import {
  DESKTOP_JOURNEYS,
  MOBILE_JOURNEYS,
  ANDROID_JOURNEYS,
  OMS_JOURNEYS,
  PARTNER_PANEL_JOURNEYS,
} from "./data/journeyDetails";

interface ModuleStats {
  name: string;
  passed: number;
  failed: number;
  duration: number;
  steps?: any[];
}

interface PlatformStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  lastRun: string;
  modules: ModuleStats[];
  comingSoon?: boolean;
}

interface TestResultsResponse {
  desktop: PlatformStats;
  mobile: PlatformStats;
  android: PlatformStats;
  ios: PlatformStats;
  oms: PlatformStats;
}

type PlatformKey = "desktop" | "mobile" | "android" | "ios" | "oms";

function App() {
  const [testData, setTestData] = useState<
    Partial<Record<PlatformKey, PlatformStats>>
  >({});
  const [currentPlatform, setCurrentPlatform] =
    useState<PlatformKey>("desktop");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedPlatformForDetails, setSelectedPlatformForDetails] =
    useState<PlatformKey | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const overviewChartRef = useRef<Highcharts.Chart | null>(null);
  const trendChartRef = useRef<Highcharts.Chart | null>(null);

  // Check maintenance mode on mount
  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        if (config.maintenanceMode) {
          window.location.href = "/maintenance.html";
        }
      } catch (error) {
        console.log("Config not found, continuing normally");
      }
    };
    checkMaintenanceMode();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
  }, [theme]);

  useEffect(() => {
    return () => {
      if (overviewChartRef.current) {
        overviewChartRef.current.destroy();
        overviewChartRef.current = null;
      }
      if (trendChartRef.current) {
        trendChartRef.current.destroy();
        trendChartRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setLastRefreshTime(new Date());
    renderLiveStats();
    renderStats();
    renderCharts();
    showModules(currentPlatform);
  }, [testData, currentPlatform]);

  useEffect(() => {
    const currentDateEl = document.getElementById("currentDate");
    if (currentDateEl) {
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // 24-hour format
      };
      currentDateEl.textContent = new Date().toLocaleString(undefined, options);
    }
  }, []);

  useEffect(() => {
    initDashboard();
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastRefreshTime) {
        const diffMs = Date.now() - lastRefreshTime.getTime();
        const minutes = Math.floor(diffMs / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        const liveUpdateTime = document.getElementById("liveUpdateTime");
        if (liveUpdateTime) {
          if (minutes === 0 && seconds < 10) {
            liveUpdateTime.textContent = "just now";
          } else if (minutes === 0) {
            liveUpdateTime.textContent = `${seconds}s ago`;
          } else {
            liveUpdateTime.textContent = `${minutes}m ${seconds}s ago`;
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastRefreshTime]);

  function generateMockData(): TestResultsResponse {
    const processJourneys = (
      journeys: typeof DESKTOP_JOURNEYS,
      platform?: string,
    ) => {
      const modules = journeys.map((j) => ({
        name: j.name,
        passed: j.passed || 0,
        failed: j.failed || 0,
        duration: j.duration || 0,
        steps: j.steps,
      }));

      // Count total test steps across all journeys
      const total = journeys.reduce(
        (acc, j) => acc + (j.steps?.length || 0),
        0,
      );

      const passed = journeys.reduce((acc, j) => {
        // Count passed steps from the steps array
        const passedSteps =
          j.steps?.filter((step) => step.status === "PASSED").length || 0;
        return acc + passedSteps;
      }, 0);

      const failed = journeys.reduce((acc, j) => {
        // Count failed steps from the steps array
        const failedSteps =
          j.steps?.filter((step) => step.status === "FAILED").length || 0;
        return acc + failedSteps;
      }, 0);

      const duration = journeys.reduce((acc, j) => acc + (j.duration || 0), 0);

      // For OMS and Partner Panel, show only 1 journey but keep correct step counts
      let processedModules = modules;
      if (platform === "oms" || platform === "partner") {
        processedModules = [
          {
            name:
              platform === "oms"
                ? "OMS Complete Workflow"
                : "Partner Panel Complete Workflow",
            passed: passed,
            failed: failed,
            duration: duration,
            steps: journeys.flatMap((j) => j.steps || []),
          },
        ];
      }

      return {
        total,
        passed,
        failed,
        skipped: 0,
        duration,
        modules: processedModules,
      };
    };

    const desktopData = processJourneys(DESKTOP_JOURNEYS);
    const mobileData = processJourneys(MOBILE_JOURNEYS);
    const androidData = processJourneys(ANDROID_JOURNEYS);
    const omsData = processJourneys(OMS_JOURNEYS, "oms");
    const partnerData = processJourneys(PARTNER_PANEL_JOURNEYS, "partner");

    // Debug logging to verify counts
    console.log("🔍 Mock Data Debug:");
    console.log("Desktop:", {
      journeys: desktopData.modules.length,
      steps: desktopData.total,
      modules: desktopData.modules.length,
    });
    console.log("Mobile:", {
      journeys: mobileData.modules.length,
      steps: mobileData.total,
      modules: mobileData.modules.length,
    });
    console.log("Android:", {
      journeys: androidData.modules.length,
      steps: androidData.total,
      modules: androidData.modules.length,
    });
    console.log("OMS:", {
      journeys: omsData.modules.length,
      steps: omsData.total,
      modules: omsData.modules.length,
    });
    console.log("Partner:", {
      journeys: partnerData.modules.length,
      steps: partnerData.total,
      modules: partnerData.modules.length,
    });

    return {
      desktop: {
        total: desktopData.total,
        passed: desktopData.passed,
        failed: desktopData.failed,
        skipped: desktopData.skipped,
        duration: desktopData.duration,
        lastRun: new Date().toISOString(),
        modules: desktopData.modules,
      },
      mobile: {
        total: mobileData.total,
        passed: mobileData.passed,
        failed: mobileData.failed,
        skipped: mobileData.skipped,
        duration: mobileData.duration,
        lastRun: new Date().toISOString(),
        modules: mobileData.modules,
      },
      android: {
        // Partner Panel
        total: partnerData.total,
        passed: partnerData.passed,
        failed: partnerData.failed,
        skipped: partnerData.skipped,
        duration: partnerData.duration,
        lastRun: new Date().toISOString(),
        modules: partnerData.modules,
      },
      ios: {
        // Android
        total: androidData.total,
        passed: androidData.passed,
        failed: androidData.failed,
        skipped: androidData.skipped,
        duration: androidData.duration,
        lastRun: new Date().toISOString(),
        modules: androidData.modules,
      },
      oms: {
        total: omsData.total,
        passed: omsData.passed,
        failed: omsData.failed,
        skipped: omsData.skipped,
        duration: omsData.duration,
        lastRun: new Date().toISOString(),
        modules: omsData.modules,
      },
    };
  }

  async function loadData() {
    try {
      // Check if we're in a static deployment environment (like Vercel)
      const isStaticDeployment =
        !import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_BASE_URL === "" ||
        window.location.hostname.includes("vercel.app") ||
        window.location.hostname.includes("netlify.app") ||
        window.location.hostname.includes("github.io");

      if (isStaticDeployment) {
        // Use mock data directly for static deployments
        console.log("🔄 Static deployment detected - using mock data");
        console.log("📊 Mobile journeys:", MOBILE_JOURNEYS.length);
        console.log(
          "🔢 Mobile steps:",
          MOBILE_JOURNEYS.reduce((acc, j) => acc + j.steps.length, 0),
        );
        const mockData = generateMockData();
        setTestData((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(mockData)) return prev;
          return mockData;
        });
        setLastRefreshTime(new Date());
        return;
      }

      // Try API call for local development with server
      const timestamp = Date.now();
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(
        /\/+$/,
        "",
      );
      const url = `${baseUrl}/api/index?_t=${timestamp}`;
      const response = await axios.get<TestResultsResponse>(url, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      const apiData = response.data || {};
      const mockData = generateMockData();

      const mergePlatform = (key: PlatformKey) => {
        // Always use mock data for OMS and Partner Panel to ensure correct journey counts
        if (key === "oms" || key === "android") {
          return mockData[key];
        }

        const apiPlatform = apiData[key];
        // If API has data and it has modules with items, use it.
        // Also check if it's not the "coming soon" placeholder
        if (
          apiPlatform &&
          apiPlatform.modules &&
          apiPlatform.modules.length > 0
        ) {
          return apiPlatform;
        }
        // Otherwise use mock data
        return mockData[key];
      };

      // Merge API data with mock data to ensure all platforms have data
      const mergedData: TestResultsResponse = {
        desktop: mergePlatform("desktop"),
        mobile: mergePlatform("mobile"),
        android: mergePlatform("android"),
        ios: mergePlatform("ios"),
        oms: mergePlatform("oms"),
      };

      setTestData((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(mergedData)) return prev;
        return mergedData;
      });
      setLastRefreshTime(new Date());
    } catch (error) {
      console.log("🔄 API call failed - falling back to mock data");
      if (!testData || Object.keys(testData).length === 0) {
        setTestData(generateMockData());
        setLastRefreshTime(new Date());
      }
    }
  }

  async function initDashboard() {
    // Always use mock data to ensure correct counts and avoid API dependency
    console.log("🔄 Initializing dashboard with mock data");
    const mockData = generateMockData();
    setTestData(mockData);
    setLastRefreshTime(new Date());
    setLoading(false);
  }

  function renderLiveStats() {
    const liveStatsGrid = document.getElementById("liveStatsGrid");
    if (!liveStatsGrid) return;
    const desktop = testData.desktop;
    const mobile = testData.mobile;
    const oms = testData.oms;
    const android = testData.android;
    const ios = testData.ios;

    const cards: string[] = [];

    // Desktop Site Card - 13 journeys with 111 total steps, all passed
    if (desktop) {
      const hasFailures = desktop.failed > 0;
      const statusText = hasFailures
        ? `Status: ISSUE DETECTED ❌`
        : `Status: ALL SYSTEMS GO ✓`;
      const statusClass = hasFailures ? "status-error" : "status-success";
      const successRate =
        desktop.total > 0
          ? ((desktop.passed / desktop.total) * 100).toFixed(1)
          : "100";
      const avgStepTime =
        desktop.total > 0
          ? (desktop.duration / desktop.total).toFixed(2)
          : "0.25";

      cards.push(`
        <div class="detailed-stat-card desktop-border">
          <div class="card-header">
            <div class="card-icon desktop-bg"><i class="fas fa-laptop-code"></i></div>
            <div class="card-title">Desktop Site</div>
          </div>
          <div class="card-content">
            <div class="automation-info">FNP Automation Framework - Playwright Test Suite</div>
            <div class="platform-info">Platform: <span class="platform-value">WEB</span></div>
            <div class="environment-info">Environment: <span class="env-value">PROD</span></div>
            <div class="journeys-info">User Journeys: <span class="journeys-value">${desktop.modules.length}</span></div>
            <div class="steps-info">Test Steps: <span class="steps-value">${desktop.total}</span></div>
            <div class="success-info">Success Rate: <span class="success-value">${successRate}%</span></div>
            <div class="avg-time-info">Avg Step Time: <span class="time-value">${avgStepTime}ms</span></div>
            <div class="failed-info">Failed Steps: <span class="failed-value">${desktop.failed}</span></div>
          </div>
          <button class="card-status-button ${statusClass}" data-platform="desktop">${statusText}</button>
        </div>
      `);
    }

    // Mobile Site Card
    if (mobile) {
      const hasFailures = mobile.failed > 0;
      const statusText = hasFailures
        ? `Status: ISSUE DETECTED ❌`
        : `Status: ALL SYSTEMS GO ✓`;
      const statusClass = hasFailures ? "status-error" : "status-success";
      const successRate =
        mobile.total > 0
          ? ((mobile.passed / mobile.total) * 100).toFixed(1)
          : "100";
      const avgStepTime =
        mobile.total > 0 ? (mobile.duration / mobile.total).toFixed(2) : "0.25";

      cards.push(`
        <div class="detailed-stat-card mobile-border">
          <div class="card-header">
            <div class="card-icon mobile-bg"><i class="fas fa-mobile-screen"></i></div>
            <div class="card-title">Mobile Site</div>
          </div>
          <div class="card-content">
            <div class="automation-info">FNP Mobile Automation - Playwright Test Suite</div>
            <div class="platform-info">Platform: <span class="platform-value">MOBILE WEB</span></div>
            <div class="environment-info">Environment: <span class="env-value">prod</span></div>
            <div class="journeys-info">User Journeys: <span class="journeys-value">${mobile.modules.length}</span></div>
            <div class="steps-info">Test Steps: <span class="steps-value">${mobile.total}</span></div>
            <div class="success-info">Success Rate: <span class="success-value">${successRate}%</span></div>
            <div class="avg-time-info">Avg Step Time: <span class="time-value">${avgStepTime}ms</span></div>
            <div class="failed-info">Failed Steps: <span class="failed-value">${mobile.failed}</span></div>
          </div>
          <button class="card-status-button ${statusClass}" data-platform="mobile">${statusText}</button>
        </div>
      `);
    }

    // OMS Card - Hardcoded values as requested
    if (oms) {
      const hasFailures = oms.failed > 0;
      const statusText = hasFailures
        ? `Status: ISSUE DETECTED ❌`
        : `Status: ALL SYSTEMS GO ✓`;
      const statusClass = hasFailures ? "status-error" : "status-success";
      cards.push(`
        <div class="detailed-stat-card oms-border">
          <div class="card-header">
            <div class="card-icon oms-bg"><i class="fas fa-boxes-stacked"></i></div>
            <div class="card-title">OMS</div>
          </div>
          <div class="card-content">
            <div class="automation-info">FNP Automation Framework - Playwright Test Suite</div>
            <div class="platform-info">Platform: <span class="platform-value">WEB</span></div>
            <div class="environment-info">Environment: <span class="env-value">prod</span></div>
            <div class="journeys-info">User Journeys: <span class="journeys-value">1</span></div>
            <div class="steps-info">Test Steps: <span class="steps-value">11</span></div>
            <div class="success-info">Success Rate: <span class="success-value">100%</span></div>
            <div class="avg-time-info">Avg Step Time: <span class="time-value">5.300ms</span></div>
            <div class="failed-info">Failed Steps: <span class="failed-value">0</span></div>
          </div>
          <button class="card-status-button ${statusClass}" data-platform="oms">${statusText}</button>
        </div>
      `);
    }

    // Partner Panel Card - Hardcoded values as requested
    if (android) {
      const hasFailures = android.failed > 0;
      const statusText = hasFailures
        ? `Status: ISSUE DETECTED ❌`
        : `Status: ALL SYSTEMS GO ✓`;
      const statusClass = hasFailures ? "status-error" : "status-success";
      cards.push(`
        <div class="detailed-stat-card android-border">
          <div class="card-header">
            <div class="card-icon android-bg"><i class="fas fa-handshake"></i></div>
            <div class="card-title">Partner Panel</div>
          </div>
          <div class="card-content">
            <div class="automation-info">FNP Partner Automation - Playwright Test Suite</div>
            <div class="platform-info">Platform: <span class="platform-value">PARTNER WEB</span></div>
            <div class="environment-info">Environment: <span class="env-value">prod</span></div>
            <div class="journeys-info">User Journeys: <span class="journeys-value">1</span></div>
            <div class="steps-info">Test Steps: <span class="steps-value">14</span></div>
            <div class="success-info">Success Rate: <span class="success-value">100%</span></div>
            <div class="avg-time-info">Avg Step Time: <span class="time-value">2.409ms</span></div>
            <div class="failed-info">Failed Steps: <span class="failed-value">0</span></div>
          </div>
          <button class="card-status-button ${statusClass}" data-platform="android">${statusText}</button>
        </div>
      `);
    }

    // Android Card (iOS data but labeled as Android)
    if (ios) {
      const hasFailures = ios.failed > 0;
      const statusText = hasFailures
        ? `Status: ISSUE DETECTED ❌`
        : `Status: ALL SYSTEMS GO ✓`;
      const statusClass = hasFailures ? "status-error" : "status-success";
      const successRate =
        ios.total > 0 ? ((ios.passed / ios.total) * 100).toFixed(1) : "0";
      const avgStepTime =
        ios.total > 0 ? (ios.duration / ios.total).toFixed(0) : "0";

      cards.push(`
        <div class="detailed-stat-card ios-border">
          <div class="card-header">
            <div class="card-icon ios-bg"><i class="fab fa-android"></i></div>
            <div class="card-title">Android</div>
          </div>
          <div class="card-content">
            <div class="automation-info">FNP Android Automation - Playwright Test Suite</div>
            <div class="platform-info">Platform: <span class="platform-value">ANDROID</span></div>
            <div class="environment-info">Environment: <span class="env-value">DEV</span></div>
            <div class="journeys-info">User Journeys: <span class="journeys-value">${ios.modules.length}</span></div>
            <div class="steps-info">Test Steps: <span class="steps-value">${ios.total}</span></div>
            <div class="success-info">Success Rate: <span class="success-value">${successRate}%</span></div>
            <div class="avg-time-info">Avg Step Time: <span class="time-value">${avgStepTime}ms</span></div>
            <div class="failed-info">Failed Steps: <span class="failed-value">${ios.failed}</span></div>
          </div>
          <button class="card-status-button ${statusClass}" data-platform="ios">${statusText}</button>
        </div>
      `);
    }

    liveStatsGrid.innerHTML = cards.join("");

    // Add event listeners to status buttons - ALL buttons are clickable
    const statusButtons = liveStatsGrid.querySelectorAll(".card-status-button");
    statusButtons.forEach((button: Element) => {
      button.addEventListener("click", (e: Event) => {
        const platform = (e.target as HTMLElement).getAttribute(
          "data-platform",
        ) as PlatformKey;
        setSelectedPlatformForDetails(platform);
      });
    });
  }

  function renderStats() {
    const statsGrid = document.getElementById("statsGrid");
    if (!statsGrid) return;
    const platforms: PlatformKey[] = [
      "desktop",
      "mobile",
      "oms",
      "android",
      "ios",
    ];
    const html = platforms
      .map((platform) => {
        const data = testData[platform];
        if (!data) return "";
        const passRate =
          data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0;
        const failRate =
          data.total > 0 ? Math.round((data.failed / data.total) * 100) : 0;
        const cardClass =
          platform === "desktop"
            ? "desktop-bg"
            : platform === "mobile"
              ? "mobile-bg"
              : platform === "android"
                ? "android-bg"
                : platform === "oms"
                  ? "oms-bg"
                  : "ios-bg";
        const label =
          platform === "desktop"
            ? "Desktop Site"
            : platform === "mobile"
              ? "Mobile Site"
              : platform === "android"
                ? "Partner Panel"
                : platform === "oms"
                  ? "OMS"
                  : "Android";
        return `
          <div class="stat-card">
            <div class="stat-icon ${cardClass}">
              <i class="fas fa-circle-notch"></i>
            </div>
            <div class="stat-value">${passRate}%</div>
            <div class="stat-label">${label} Success Rate</div>
            <div class="stat-details">
              <div class="stat-detail"><span>Passed:</span><strong>${data.passed}</strong></div>
              <div class="stat-detail"><span>Failed:</span><strong>${data.failed}</strong></div>
              <div class="stat-detail"><span>Skipped:</span><strong>${data.skipped}</strong></div>
            </div>
          </div>
        `;
      })
      .join("");
    statsGrid.innerHTML = html;
  }

  function renderCharts() {
    // Charts removed - function kept to avoid breaking other code
    return;
  }

  function showModules(
    platform: PlatformKey,
    event?: React.MouseEvent<HTMLButtonElement>,
  ) {
    const journeyNames: Record<number, string> = {
      1: "Home Page Exploration",
      2: "Payment Methods Testing",
      3: "International Phone Number Change",
      4: "Reminder and FAQ Testing",
      5: "International Purchase",
      6: "Mobile Location Testing",
      7: "Combinational Purchase",
      8: "Mobile Message Card",
      9: "Cake Variant Testing",
      10: "Valid Coupon Testing",
      11: "Personalized Product Purchase",
      12: "Message Card Integration",
      13: "Product Exploration Journey",
      14: "Same SKU Product Exploration",
      15: "Search Based Purchase",
      16: "Personalized Product with Photo Upload",
      17: "Location Testing",
      18: "Spherical Home Page Icon Exploration",
      19: "Gmail OTP Login",
      20: "Gmail OTP Login",
    };

    const modulesGrid = document.getElementById("modulesGrid");
    if (!modulesGrid) return;
    setCurrentPlatform(platform);
    const data = testData[platform];
    if (!data) {
      modulesGrid.innerHTML = "";
      return;
    }

    const html = data.modules
      .map((module, index) => {
        // For desktop, use the actual journey IDs from the test results
        const desktopJourneyIds = [
          1, 2, 4, 5, 7, 10, 11, 12, 13, 16, 16, 17, 18,
        ];
        const journeyId =
          platform === "desktop"
            ? desktopJourneyIds[index] || index + 1
            : index + 1;
        const journeyName = journeyNames[journeyId] || module.name;
        const statusIcon = module.failed > 0 ? "❌" : "✅";
        const statusClass = module.failed > 0 ? "failed" : "passed";

        return `
        <div class="module-card ${statusClass}">
          <div class="module-name">${statusIcon} Journey ${journeyId} - ${journeyName}</div>
          <div class="module-stats">
            <span>Passed: ${module.passed}</span>
            <span>Failed: ${module.failed}</span>
            <span>Duration: ${module.duration}ms</span>
          </div>
        </div>
      `;
      })
      .join("");
    modulesGrid.innerHTML = html;
    if (event && event.currentTarget) {
      const parent = event.currentTarget.parentElement;
      if (parent) {
        const buttons = parent.querySelectorAll(".tab");
        buttons.forEach((btn) => btn.classList.remove("active"));
        event.currentTarget.classList.add("active");
      }
    }
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  async function refreshData() {
    await initDashboard();
  }

  return (
    <div className="container">
      <FallingHearts />

      {selectedPlatformForDetails ? (
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setSelectedPlatformForDetails(null)}
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 100,
              padding: "8px 16px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            ← Back to Dashboard
          </button>
          <div style={{ paddingTop: "50px" }}>
            <JourneyDetailsView
              testData={testData}
              platform={
                selectedPlatformForDetails === "android"
                  ? "partner"
                  : selectedPlatformForDetails
              }
              initialPlatform={
                selectedPlatformForDetails === "android"
                  ? "partner"
                  : selectedPlatformForDetails
              }
            />
          </div>
        </div>
      ) : (
        <>
          <div className="header">
            <div className="logo-section">
              <img
                src="/static/fnp-logo.svg"
                alt="FNP Logo"
                className="logo"
                style={{ height: 50, width: "auto" }}
              />
              <div>
                <div className="title">Sentinel</div>
              </div>
            </div>
            <div className="header-controls">
              <div className="date-display">
                <div
                  id="currentDate"
                  style={{ fontWeight: 600, color: "var(--text-primary)" }}
                />
              </div>
              <div className="theme-toggle" onClick={toggleTheme}>
                {theme === "light" ? (
                  <i
                    className="fas fa-moon"
                    style={{ fontSize: 16, color: "var(--text-secondary)" }}
                  />
                ) : (
                  <i
                    className="fas fa-sun"
                    style={{ fontSize: 16, color: "#fbbf24" }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="modules-section">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div className="chart-title" style={{ marginBottom: 0 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#10b981",
                    boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.2)",
                    animation: "pulse 2s infinite",
                    marginRight: 4,
                  }}
                />
                <i className="fas fa-broadcast-tower" />
                Live Test Execution Context
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                <i className="fas fa-clock" /> Updated{" "}
                <span id="liveUpdateTime">just now</span>
              </div>
            </div>
            <div className="responsive-stats-grid" id="liveStatsGrid" />
          </div>

          <div className="modules-section">
            <div className="chart-title">
              <i className="fas fa-chart-line" />
              Overall
            </div>
            <div className="responsive-stats-grid" id="statsGrid" />
          </div>

          <JourneyDetailsView testData={testData} />

          <div className="modules-section">
            <div className="chart-title" style={{ marginBottom: "20px" }}>
              <i className="fas fa-chart-bar" />
              Platform Analytics - Switch Graphs by Platform
            </div>
            <PlatformGraphSwitcher initialPlatform="overall" />
          </div>
        </>
      )}
    </div>
  );
}

export default App;

(function () {
  "use strict";

  /* ==========================================================================
     1. KNOWLEDGE BASES & MODEL CONSTANTS
     ========================================================================== */

  // Geocoding Coordinates for recognized locations
  const LOCATION_DATABASE = {
    "Anna Nagar, Chennai, Tamil Nadu": { lat: 13.0850, lng: 80.2100, city: "Chennai", state: "Tamil Nadu", baseTier: "Urban Commercial" },
    "Koramangala, Bangalore, Karnataka": { lat: 12.9352, lng: 77.6245, city: "Bangalore", state: "Karnataka", baseTier: "Tech & Commercial Hub" },
    "Bandra West, Mumbai, Maharashtra": { lat: 19.0596, lng: 72.8295, city: "Mumbai", state: "Maharashtra", baseTier: "High Street Prime" },
    "Connaught Place, New Delhi": { lat: 28.6315, lng: 77.2167, city: "New Delhi", state: "Delhi", baseTier: "Central Business District" },
    "Hitec City, Hyderabad, Telangana": { lat: 17.4474, lng: 78.3762, city: "Hyderabad", state: "Telangana", baseTier: "IT & Commercial Corridor" },
    "RS Puram, Coimbatore, Tamil Nadu": { lat: 11.0116, lng: 76.9536, city: "Coimbatore", state: "Tamil Nadu", baseTier: "Semi-Urban Commercial" },
    "Hinjewadi, Pune, Maharashtra": { lat: 18.5913, lng: 73.7389, city: "Pune", state: "Maharashtra", baseTier: "Tech Corridor" },
    "Salt Lake Sector V, Kolkata, West Bengal": { lat: 22.5804, lng: 88.4378, city: "Kolkata", state: "West Bengal", baseTier: "IT Sector Mixed" }
  };

  // Industry Unit Economics & Benchmarks
  const INDUSTRY_CONFIG = {
    printing: {
      name: "Printing & Reprographics",
      minCapex: 180000,
      optimalCapex: 350000,
      avgGrossMargin: 0.64,
      avgTicketSize: 75,
      captureRate: 0.032,
      baseRentPerSqFt: 55,
      minSpaceSqFt: 250,
      capexRatio: { equipment: 0.55, interior: 0.20, deposit: 0.15, runway: 0.10 },
      opexRatio: { rent: 0.32, salary: 0.30, cogs: 0.23, utilities: 0.15 },
      idealMacro: ["college_zone", "transit_hub", "cbd"],
      equipmentCatalog: [
        { name: "Canon imageRUNNER 4545i", role: "Primary Copier", spec: "45 ppm Monochromatic", cost: 135000, note: "High Volume Workhorse", recommended: false },
        { name: "Xerox WorkCentre 7855", role: "Color / Scan Node", spec: "1200 x 2400 dpi Production", cost: 95000, note: "High Margin Color Production", recommended: true },
        { name: "Electric Heavy-Duty Spiral Binder", role: "Finishing & Binding", spec: "500 sheets capacity", cost: 18000, note: "Essential Academic Finishing", recommended: false }
      ],
      contextNote: "High density of colleges and institutions within catchment creates reliable recurring demand. 40%+ document volume surges occur during exam and project submission seasons."
    },
    food_beverage: {
      name: "Food & Beverage / Cafe",
      minCapex: 450000,
      optimalCapex: 1500000,
      avgGrossMargin: 0.68,
      avgTicketSize: 260,
      captureRate: 0.026,
      baseRentPerSqFt: 85,
      minSpaceSqFt: 500,
      capexRatio: { equipment: 0.50, interior: 0.30, deposit: 0.12, runway: 0.08 },
      opexRatio: { rent: 0.26, salary: 0.26, cogs: 0.34, utilities: 0.14 },
      idealMacro: ["cbd", "tech_park", "college_zone", "residential"],
      equipmentCatalog: [
        { name: "La Marzocco 2-Group Commercial Espresso", role: "Beverage Station", spec: "120 cups/hr dual boiler", cost: 380000, note: "Artisan Coffee Core", recommended: true },
        { name: "Foster Under-counter 2-Door Chiller", role: "Refrigeration", spec: "320L capacity, 2-8°C", cost: 85000, note: "HACCP Food Safety Standard", recommended: false },
        { name: "Dual-Screen Cloud POS & KDS Terminal", role: "Billing & Order Routing", spec: "Kitchen display + thermal", cost: 45000, note: "High-Speed Table Turnover", recommended: false }
      ],
      contextNote: "High pedestrian dwell time and youth/corporate demographics drive strong evening beverage sales with consistent lunch traffic."
    },
    retail: {
      name: "Retail & Apparel Boutique",
      minCapex: 350000,
      optimalCapex: 1200000,
      avgGrossMargin: 0.46,
      avgTicketSize: 850,
      captureRate: 0.016,
      baseRentPerSqFt: 75,
      minSpaceSqFt: 400,
      capexRatio: { equipment: 0.45, interior: 0.28, deposit: 0.15, runway: 0.12 },
      opexRatio: { rent: 0.32, salary: 0.20, cogs: 0.38, utilities: 0.10 },
      idealMacro: ["cbd", "residential", "transit_hub"],
      equipmentCatalog: [
        { name: "Modular Architectural Display Gondolas", role: "Retail Fixtures", spec: "Powder-coated steel & oak", cost: 140000, note: "Floor Space Optimization", recommended: false },
        { name: "Honeywell RFID & Barcode Checkout System", role: "POS & Inventory", spec: "Omnichannel inventory sync", cost: 52000, note: "Zero Shrinkage Tracking", recommended: true },
        { name: "LED Track Luminaire Matrix 4000K", role: "Accent Lighting", spec: "CRI > 90 True Color", cost: 32000, note: "High Apparel Visual Appeal", recommended: false }
      ],
      contextNote: "High street frontage and weekend shopping footfall support strong average basket sizes and repeat neighborhood clientele."
    },
    healthcare: {
      name: "Healthcare & Diagnostics Clinic",
      minCapex: 650000,
      optimalCapex: 2200000,
      avgGrossMargin: 0.58,
      avgTicketSize: 680,
      captureRate: 0.014,
      baseRentPerSqFt: 60,
      minSpaceSqFt: 600,
      capexRatio: { equipment: 0.55, interior: 0.22, deposit: 0.13, runway: 0.10 },
      opexRatio: { rent: 0.22, salary: 0.36, cogs: 0.30, utilities: 0.12 },
      idealMacro: ["residential", "semi_urban", "transit_hub"],
      equipmentCatalog: [
        { name: "Mindray Automated Hematology Analyzer", role: "Primary Diagnostics", spec: "60 samples/hr 3-part diff", cost: 320000, note: "Core Blood Analysis Workhorse", recommended: true },
        { name: "Semi-Automated Clinical Chemistry Unit", role: "Biochemistry", spec: "340-670nm photometer", cost: 165000, note: "Essential Metabolic Panels", recommended: false },
        { name: "Medical Grade Sample Chiller + Data Logger", role: "Sample Storage", spec: "250L, 2-8°C digital monitor", cost: 60000, note: "NABL Compliance Standard", recommended: false }
      ],
      contextNote: "Proximity to dense residential households and elderly population yields steady recurring diagnostic orders and doctor referrals."
    },
    education: {
      name: "Education & Skill Coaching",
      minCapex: 250000,
      optimalCapex: 600000,
      avgGrossMargin: 0.74,
      avgTicketSize: 3200,
      captureRate: 0.008,
      baseRentPerSqFt: 45,
      minSpaceSqFt: 750,
      capexRatio: { equipment: 0.44, interior: 0.26, deposit: 0.18, runway: 0.12 },
      opexRatio: { rent: 0.32, salary: 0.44, cogs: 0.10, utilities: 0.14 },
      idealMacro: ["college_zone", "residential", "tech_park"],
      equipmentCatalog: [
        { name: "75-inch 4K Interactive Touch Flat Panel", role: "Smart Classroom", spec: "Dual OS Android/Windows", cost: 145000, note: "Interactive Student Engagement", recommended: true },
        { name: "Ergonomic Dual Study Desks & Chairs", role: "Classroom Seating", spec: "Set of 25 heavy duty units", cost: 65000, note: "Optimized Floor Capacity", recommended: false },
        { name: "1080p PTZ Hybrid Lecture Streaming Kit", role: "Online / Hybrid AV", spec: "Auto-tracking & dual mics", cost: 38000, note: "Seamless Hybrid Delivery", recommended: false }
      ],
      contextNote: "High concentration of feeder schools and residential communities ensures sustained student enrollments across academic semesters."
    },
    fitness: {
      name: "Fitness & Wellness Studio",
      minCapex: 600000,
      optimalCapex: 2500000,
      avgGrossMargin: 0.65,
      avgTicketSize: 1800,
      captureRate: 0.012,
      baseRentPerSqFt: 50,
      minSpaceSqFt: 1200,
      capexRatio: { equipment: 0.58, interior: 0.20, deposit: 0.12, runway: 0.10 },
      opexRatio: { rent: 0.34, salary: 0.38, cogs: 0.12, utilities: 0.16 },
      idealMacro: ["residential", "tech_park", "cbd"],
      equipmentCatalog: [
        { name: "Commercial Treadmill AC 5.0 HP Matrix", role: "Cardio Station", spec: "180kg user capacity", cost: 210000, note: "Heavy-Duty Cardio Line", recommended: false },
        { name: "8-Stack Multi-Station Jungle Gym", role: "Strength Conditioning", spec: "Dual pulleys & cable crossover", cost: 340000, note: "Full-Body Strength Station", recommended: true },
        { name: "Commercial Urethane Dumbbell Set + Rack", role: "Free Weights", spec: "2.5kg - 35kg with 3-tier rack", cost: 75000, note: "Essential Free Weight Section", recommended: false }
      ],
      contextNote: "Healthy density of young professionals and fitness-conscious residents drives strong annual membership retention and PT upselling."
    },
    tech_services: {
      name: "Tech & Coworking Services",
      minCapex: 500000,
      optimalCapex: 1800000,
      avgGrossMargin: 0.62,
      avgTicketSize: 4500,
      captureRate: 0.009,
      baseRentPerSqFt: 65,
      minSpaceSqFt: 1000,
      capexRatio: { equipment: 0.45, interior: 0.28, deposit: 0.15, runway: 0.12 },
      opexRatio: { rent: 0.40, salary: 0.24, cogs: 0.18, utilities: 0.18 },
      idealMacro: ["tech_park", "cbd", "transit_hub"],
      equipmentCatalog: [
        { name: "Enterprise Gigabit Managed Wi-Fi 6 AP Matrix", role: "IT Network", spec: "3.2 Gbps throughput, 120 clients", cost: 95000, note: "Ultra Low-Latency Fiber", recommended: true },
        { name: "Ergonomic Mesh Task Chairs (Set of 15)", role: "Workstation Comfort", spec: "Lumbar support & 3D armrests", cost: 150000, note: "Full-Day Ergonomics", recommended: false },
        { name: "Online 10kVA Pure Sine Wave UPS System", role: "Power Backup", spec: "3-Hour full load backup", cost: 120000, note: "Zero Downtime Assurance", recommended: false }
      ],
      contextNote: "Central proximity to tech corridors captures robust demand for flexible hot desks, private offices, and client meeting rooms."
    }
  };

  // Macro Environment Baseline Modifiers
  const MACRO_ENV_CONFIG = {
    college_zone: { densityPerSqKm: 7500, footfallMultiplier: 1.15, rentMultiplier: 0.95, compMultiplier: 0.90, name: "College Zone / Educational Hub" },
    cbd: { densityPerSqKm: 12000, footfallMultiplier: 1.45, rentMultiplier: 1.50, compMultiplier: 1.40, name: "Central Business District (CBD)" },
    residential: { densityPerSqKm: 5400, footfallMultiplier: 0.85, rentMultiplier: 0.80, compMultiplier: 0.75, name: "High-Density Residential Suburb" },
    industrial: { densityPerSqKm: 3800, footfallMultiplier: 0.65, rentMultiplier: 0.60, compMultiplier: 0.50, name: "Industrial & Logistics Corridor" },
    tech_park: { densityPerSqKm: 9800, footfallMultiplier: 1.30, rentMultiplier: 1.35, compMultiplier: 1.15, name: "IT & Technology Park Corridor" },
    transit_hub: { densityPerSqKm: 14000, footfallMultiplier: 1.60, rentMultiplier: 1.40, compMultiplier: 1.30, name: "Metro & Transit Junction" }
  };

  // Infrastructure Support Multipliers
  const INFRA_CONFIG = {
    urban_high: { multiplier: 1.05, label: "Urban Grade A (High Quality)" },
    semi_urban: { multiplier: 0.95, label: "Semi-Urban (Moderate)" },
    developing: { multiplier: 0.82, label: "Developing / Emerging (Basic)" }
  };

  // Enterprise Presets
  const PRESETS = [
    {
      id: "preset-printing-chennai",
      title: "Academic Xerox & Print Hub",
      icon: "🖨️",
      category: "printing",
      businessIdea: "Anna Nagar Academic Print Hub",
      targetSegment: "College Students & Faculty",
      location: "Anna Nagar, Chennai, Tamil Nadu",
      macroEnv: "college_zone",
      infraRating: "urban_high",
      budget: 350000,
      catchment: 1.0,
      reportLang: "ta",
      desc: "Reprographics and thesis document hub serving Anna Nagar academic clusters."
    },
    {
      id: "preset-cafe-bangalore",
      title: "Specialty Coffee & Artisan Bistro",
      icon: "☕",
      category: "food_beverage",
      businessIdea: "Koramangala Artisan Espresso Lounge",
      targetSegment: "Tech Workers, Founders & Young Professionals",
      location: "Koramangala, Bangalore, Karnataka",
      macroEnv: "tech_park",
      infraRating: "urban_high",
      budget: 1500000,
      catchment: 1.5,
      reportLang: "en",
      desc: "Premium espresso bar and work-friendly cafe in Bangalore's startup heart."
    },
    {
      id: "preset-retail-delhi",
      title: "Boutique Apparel & Lifestyle Studio",
      icon: "👗",
      category: "retail",
      businessIdea: "CP Heritage Lifestyle Boutique",
      targetSegment: "Urban Shoppers & Tourists",
      location: "Connaught Place, New Delhi",
      macroEnv: "cbd",
      infraRating: "urban_high",
      budget: 1200000,
      catchment: 2.0,
      reportLang: "hi",
      desc: "Contemporary apparel studio capturing high weekend retail footfall in Central Delhi."
    },
    {
      id: "preset-health-coimbatore",
      title: "Diagnostic Lab & Family Clinic",
      icon: "🩺",
      category: "healthcare",
      businessIdea: "RS Puram Diagnostic & Wellness Hub",
      targetSegment: "Families, Seniors & Chronic Care Patients",
      location: "RS Puram, Coimbatore, Tamil Nadu",
      macroEnv: "residential",
      infraRating: "semi_urban",
      budget: 2200000,
      catchment: 1.5,
      reportLang: "ta",
      desc: "Preventative pathology and general health clinic serving affluent residential neighborhoods."
    },
    {
      id: "preset-education-hyderabad",
      title: "STEM & Robotics Coaching Academy",
      icon: "🎓",
      category: "education",
      businessIdea: "Cyberabad STEM & Coding Academy",
      targetSegment: "K-12 Students & Aspiring Engineers",
      location: "Hitec City, Hyderabad, Telangana",
      macroEnv: "tech_park",
      infraRating: "urban_high",
      budget: 600000,
      catchment: 2.0,
      reportLang: "en",
      desc: "After-school STEM and algorithmic thinking academy for tech-corridor families."
    },
    {
      id: "preset-fitness-mumbai",
      title: "Premium Strength & CrossFit Box",
      icon: "🏋️",
      category: "fitness",
      businessIdea: "Bandra Elite Strength Studio",
      targetSegment: "Fitness Enthusiasts & Celebrities",
      location: "Bandra West, Mumbai, Maharashtra",
      macroEnv: "residential",
      infraRating: "urban_high",
      budget: 2800000,
      catchment: 1.5,
      reportLang: "en",
      desc: "Boutique functional conditioning studio with customized membership tiers."
    }
  ];

  /* ==========================================================================
     2. FEASIBILITY CALCULATION ENGINE
     ========================================================================== */
  class GeoFeasibilityEngine {
    static calculate(input) {
      const {
        businessIdea = "Commercial Enterprise",
        industryCategory = "printing",
        targetSegment = "General Public",
        targetLocation = "Anna Nagar, Chennai, Tamil Nadu",
        macroEnv = "college_zone",
        infraRating = "urban_high",
        budget = 350000,
        catchmentRadius = 1.0,
        reportLang = "en"
      } = input;

      const ind = INDUSTRY_CONFIG[industryCategory] || INDUSTRY_CONFIG.printing;
      const macro = MACRO_ENV_CONFIG[macroEnv] || MACRO_ENV_CONFIG.college_zone;
      const infra = INFRA_CONFIG[infraRating] || INFRA_CONFIG.urban_high;

      // 1. Spatial Area & Footfall Calculation
      const areaSqKm = Math.PI * Math.pow(catchmentRadius, 2);
      const estCatchmentPopulation = Math.round(areaSqKm * macro.densityPerSqKm);
      const dailyPedestrianFootfall = Math.round(estCatchmentPopulation * 0.28 * macro.footfallMultiplier);
      const footfallLow = Math.round(dailyPedestrianFootfall * 0.88);
      const footfallHigh = Math.round(dailyPedestrianFootfall * 1.15);

      // 2. Competitor Estimation
      const baseCompetitorDensity = Math.max(1, Math.round(areaSqKm * 1.2 * macro.compMultiplier));
      const competitorCount = baseCompetitorDensity;

      // 3. Recommended CapEx Allocation
      // CapEx is tailored to budget, with floor at minCapex if budget allows
      const recommendedCapex = Math.max(ind.minCapex, Math.min(budget, ind.optimalCapex * 1.5));
      const capexEq = Math.round(recommendedCapex * ind.capexRatio.equipment);
      const capexFitout = Math.round(recommendedCapex * ind.capexRatio.interior);
      const capexDeposit = Math.round(recommendedCapex * ind.capexRatio.deposit);
      const capexRunway = Math.round(recommendedCapex * ind.capexRatio.runway);

      // 4. Monthly Revenue & OpEx Projections
      // Daily Captured Customers based on footfall & capture rate
      const captureShare = (ind.captureRate * 0.45) / Math.sqrt(Math.max(1, competitorCount * 0.8));
      const dailyCustomers = Math.max(8, Math.round(dailyPedestrianFootfall * captureShare));
      const monthlyOperatingDays = 26;
      
      // Steady State (Mature) Monthly Gross Revenue
      const matureGrossMonthlyRevenue = Math.round(dailyCustomers * ind.avgTicketSize * monthlyOperatingDays);

      // Monthly OpEx Breakdown
      const estRent = Math.round(ind.minSpaceSqFt * ind.baseRentPerSqFt * macro.rentMultiplier);
      const estCogs = Math.round(matureGrossMonthlyRevenue * (1 - ind.avgGrossMargin));
      const estSalaries = Math.round(Math.max(15000, recommendedCapex * 0.045));
      const estUtilities = Math.round(estRent * 0.28 + 3500);
      const totalMonthlyOpex = estRent + estCogs + estSalaries + estUtilities;

      // Mature vs Year-1 Ramp-Up Profits (Year 1 accounts for initial 6-month ramp-up)
      const matureMonthlyProfit = Math.max(8000, matureGrossMonthlyRevenue - totalMonthlyOpex);
      const year1AvgMonthlyProfit = Math.round(matureMonthlyProfit * 0.72);
      const profitMarginPct = ((matureMonthlyProfit / matureGrossMonthlyRevenue) * 100).toFixed(1);
      
      const breakevenMonths = Math.max(4, Math.round(recommendedCapex / Math.max(5000, year1AvgMonthlyProfit)));
      const annualRoiPct = (((year1AvgMonthlyProfit * 12) / recommendedCapex) * 100).toFixed(1);
      const grossMonthlyRevenue = matureGrossMonthlyRevenue;
      const netMonthlyProfit = matureMonthlyProfit;


      // 5. Multi-Factor Composite Feasibility Score (0 - 100)
      // A. Capital Adequacy (25%)
      let capScore = 0;
      if (budget < ind.minCapex) {
        capScore = Math.max(25, Math.round((budget / ind.minCapex) * 60));
      } else if (budget >= ind.optimalCapex) {
        capScore = 95;
      } else {
        capScore = 75 + Math.round(((budget - ind.minCapex) / (ind.optimalCapex - ind.minCapex)) * 20);
      }

      // B. Macro / Location Synergy (25%)
      let synergyScore = ind.idealMacro.includes(macroEnv) ? 94 : 68;

      // C. Demand & Density Index (20%)
      let demandScore = Math.min(96, Math.max(60, Math.round((dailyPedestrianFootfall / 8000) * 85)));

      // D. Unit Economics & ROI Index (20%)
      let unitEcoScore = breakevenMonths <= 14 ? 92 : breakevenMonths <= 24 ? 76 : 58;

      // E. Infrastructure Multiplier (10%)
      const rawScore = (capScore * 0.25) + (synergyScore * 0.25) + (demandScore * 0.20) + (unitEcoScore * 0.20);
      const finalScore = Math.min(97, Math.max(35, Math.round(rawScore * infra.multiplier)));

      // 6. Verdict Classification
      let verdictLabel = "Highly Viable";
      let verdictClass = "verdict--emerald";
      let verdictSubtext = "Prime footfall density, high target segment affinity & sound unit economics.";

      if (finalScore >= 85) {
        verdictLabel = "Highly Viable";
        verdictClass = "verdict--emerald";
        verdictSubtext = "Exceptional market conditions, strong margin buffer & swift break-even horizon.";
      } else if (finalScore >= 70) {
        verdictLabel = "Strongly Feasible";
        verdictClass = "verdict--indigo";
        verdictSubtext = "Solid financial fundamentals with manageable local competition.";
      } else if (finalScore >= 55) {
        verdictLabel = "Moderately Feasible";
        verdictClass = "verdict--amber";
        verdictSubtext = "Viable with focused differentiation and strict operating cost controls.";
      } else {
        verdictLabel = "High Risk / Reconfigure";
        verdictClass = "verdict--rose";
        verdictSubtext = "Capital adequacy or location fit requires restructuring prior to deployment.";
      }

      // 7. Matched Government Subsidy Scheme
      let scheme = {};
      if (budget <= 60000) {
        scheme = {
          title: "PM Mudra Loan (Shishu Scheme)",
          authority: "MINISTRY OF FINANCE & SIDBI",
          desc: "Micro-credit collateral-free financial facility up to ₹50,000 designed for starter equipment & initial inventory.",
          subsidyTag: "0% Collateral • Subsidized Interest",
          criteria: "Non-corporate, non-farm small micro-enterprises with valid Aadhaar & project plan.",
          procedure: "Apply via JanSamarth or Udyamimitra portal; instant sanction with basic quotation documents."
        };
      } else if (budget <= 500000) {
        scheme = {
          title: "PM Mudra Loan (Kishore Scheme)",
          authority: "MINISTRY OF FINANCE & CGTMSE",
          desc: "Working capital and machinery procurement credit from ₹50,000 to ₹5,00,000 without third-party collateral.",
          subsidyTag: "Up to ₹5 Lakhs • 5-Yr Runway",
          criteria: "Established or new micro-enterprises with formal equipment quotations and Udyam MSME registration.",
          procedure: "Submit Detailed Project Report (DPR) with machine proforma invoices to any commercial or regional rural bank."
        };
      } else if (budget <= 2500000) {
        scheme = {
          title: "PMEGP (Prime Minister Employment Generation)",
          authority: "MINISTRY OF MSME & KVIC",
          desc: "Credit-linked capital subsidy scheme providing 15% to 35% government grant on project costs up to ₹25 Lakhs in service sector.",
          subsidyTag: "15% - 35% Govt Capital Subsidy",
          criteria: "Individuals aged 18+ with minimum VIII standard qualification for service projects over ₹5 Lakhs.",
          procedure: "Apply online at kviconline.gov.in portal. Subsidy routed via nodal bank branch after 3-year lock-in."
        };
      } else {
        scheme = {
          title: "Stand-Up India & CGTMSE Credit Guarantee",
          authority: "MINISTRY OF MSME & SIDBI",
          desc: "Institutional credit guarantee covering term loans and working capital up to ₹2 Crores with 75-85% guarantee cover.",
          subsidyTag: "Collateral-Free Institutional Backing",
          criteria: "Registered MSME private limited, LLP, or partnership entities with techno-economic feasibility approval.",
          procedure: "Approach participating Member Lending Institutions (MLIs) with audited projections and GeoFeasibility report."
        };
      }

      // 8. Multi-Radius Variations (500m, 1km, 2km, 5km)
      const radiusAnalysis = {
        0.5: {
          area: "0.79 sq.km",
          footfall: `${Math.round(footfallLow * 0.45).toLocaleString()} – ${Math.round(footfallHigh * 0.45).toLocaleString()}`,
          competitors: `${Math.max(1, Math.round(competitorCount * 0.4))} Active Competitors`,
          densityNote: "Immediate Walkability Zone"
        },
        1.0: {
          area: "3.14 sq.km",
          footfall: `${footfallLow.toLocaleString()} – ${footfallHigh.toLocaleString()}`,
          competitors: `${competitorCount} Active Hubs`,
          densityNote: "Core Primary Catchment"
        },
        2.0: {
          area: "12.57 sq.km",
          footfall: `${Math.round(footfallLow * 2.6).toLocaleString()} – ${Math.round(footfallHigh * 2.6).toLocaleString()}`,
          competitors: `${Math.round(competitorCount * 2.8)} Competitors in Ring`,
          densityNote: "Extended Drive-Time Radius"
        },
        5.0: {
          area: "78.54 sq.km",
          footfall: `${Math.round(footfallLow * 6.2).toLocaleString()} – ${Math.round(footfallHigh * 6.2).toLocaleString()}`,
          competitors: `${Math.round(competitorCount * 7.5)} Metro Competitors`,
          densityNote: "Macro District Aggregation"
        }
      };

      return {
        inputs: input,
        industry: ind,
        macro: macro,
        infra: infra,
        score: finalScore,
        verdictLabel,
        verdictClass,
        verdictSubtext,
        metrics: {
          recommendedCapex,
          capexEq,
          capexFitout,
          capexDeposit,
          capexRunway,
          grossMonthlyRevenue,
          totalMonthlyOpex,
          estRent,
          estSalaries,
          estCogs,
          estUtilities,
          netMonthlyProfit,
          profitMarginPct,
          breakevenMonths,
          annualRoiPct,
          dailyPedestrianFootfall,
          footfallLow,
          footfallHigh,
          competitorCount
        },
        equipment: ind.equipmentCatalog,
        scheme,
        radiusAnalysis,
        contextNote: ind.contextNote
      };
    }
  }

  // Expose engine to window
  if (typeof window !== "undefined") {
    window.GeoFeasibilityEngine = GeoFeasibilityEngine;
  }


  /* ==========================================================================
     3. MAP CONTROLLER (LEAFLET.JS)
     ========================================================================== */
  let proposalMap = null;
  let proposalCircle = null;
  let proposalTargetMarker = null;
  let proposalCompMarkers = [];

  let reportGapMap = null;
  let reportCircle = null;

  function initProposalMap() {
    const mapContainer = document.getElementById("proposalMap");
    if (!mapContainer || typeof L === "undefined") return;

    if (proposalMap) {
      proposalMap.invalidateSize();
      return;
    }

    const defaultLoc = LOCATION_DATABASE["Anna Nagar, Chennai, Tamil Nadu"];
    proposalMap = L.map("proposalMap", {
      center: [defaultLoc.lat, defaultLoc.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // High quality CartoDB Positron tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd"
    }).addTo(proposalMap);

    updateMapLocation(defaultLoc.lat, defaultLoc.lng, 1.0);

    // Wire custom map zoom & recenter buttons
    document.getElementById("mapZoomInBtn")?.addEventListener("click", () => {
      if (proposalMap) proposalMap.zoomIn();
    });
    document.getElementById("mapZoomOutBtn")?.addEventListener("click", () => {
      if (proposalMap) proposalMap.zoomOut();
    });
    document.getElementById("mapRecenterBtn")?.addEventListener("click", () => {
      syncMapWithLocationInput();
    });
  }


  function updateMapLocation(lat, lng, radiusKm) {
    if (!proposalMap || typeof L === "undefined") return;

    proposalMap.setView([lat, lng], radiusKm <= 1 ? 14 : radiusKm <= 2.5 ? 13 : 12);

    // Target Marker
    if (proposalTargetMarker) proposalMap.removeLayer(proposalTargetMarker);
    const targetIcon = L.divIcon({
      className: "custom-pin-target",
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    proposalTargetMarker = L.marker([lat, lng], { icon: targetIcon })
      .addTo(proposalMap)
      .bindPopup("<strong>Proposed Venture Spot</strong><br/>Optimal Spatial Node");

    // Catchment Circle
    if (proposalCircle) proposalMap.removeLayer(proposalCircle);
    proposalCircle = L.circle([lat, lng], {
      radius: radiusKm * 1000,
      color: "#3421e8",
      weight: 2,
      fillColor: "#4f46ff",
      fillOpacity: 0.18,
      dashArray: "6, 6"
    }).addTo(proposalMap);

    // Dynamic Competitor Markers
    proposalCompMarkers.forEach((m) => proposalMap.removeLayer(m));
    proposalCompMarkers = [];

    const compOffsets = [
      [0.004, -0.005],
      [-0.005, 0.003],
      [0.006, 0.004],
      [-0.003, -0.006]
    ];

    compOffsets.forEach(([dLat, dLng], idx) => {
      const cIcon = L.divIcon({
        className: "custom-pin-competitor",
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
      const cMarker = L.marker([lat + dLat, lng + dLng], { icon: cIcon })
        .addTo(proposalMap)
        .bindPopup(`Existing Competitor #${idx + 1}`);
      proposalCompMarkers.push(cMarker);
    });
  }

  function initReportGapMap(lat, lng, radiusKm) {
    const gapMapContainer = document.getElementById("reportGapMap");
    if (!gapMapContainer || typeof L === "undefined") return;

    if (reportGapMap) {
      reportGapMap.setView([lat, lng], 13);
      if (reportCircle) reportGapMap.removeLayer(reportCircle);
      reportCircle = L.circle([lat, lng], {
        radius: radiusKm * 1000,
        color: "#6366f1",
        weight: 2,
        fillColor: "#4f46ff",
        fillOpacity: 0.25
      }).addTo(reportGapMap);
      reportGapMap.invalidateSize();
      return;
    }

    reportGapMap = L.map("reportGapMap", {
      center: [lat, lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd"
    }).addTo(reportGapMap);

    reportCircle = L.circle([lat, lng], {
      radius: radiusKm * 1000,
      color: "#6366f1",
      weight: 2,
      fillColor: "#4f46ff",
      fillOpacity: 0.25
    }).addTo(reportGapMap);

    const targetIcon = L.divIcon({
      className: "custom-pin-target",
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    L.marker([lat, lng], { icon: targetIcon }).addTo(reportGapMap);
  }

  /* ==========================================================================
     4. UI STATE & INTERACTION BINDINGS
     ========================================================================== */
  const screens = {
    proposal: document.getElementById("screen-proposal"),
    loading: document.getElementById("screen-loading"),
    report: document.getElementById("screen-report")
  };

  let currentAnalysisResult = null;

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      if (el) {
        if (key === name) {
          if (el.removeAttribute) el.removeAttribute("hidden");
          el.hidden = false;
          el.style.display = key === "loading" ? "flex" : "block";
        } else {
          if (el.setAttribute) el.setAttribute("hidden", "true");
          el.hidden = true;
          el.style.display = "none";
        }
      }
    });


    // Update active nav link
    const navProposal = document.getElementById("navProposal");
    const analysisTabLink = document.getElementById("analysisTabLink");
    const mobNavProposal = document.getElementById("mobNavProposal");
    const mobNavReport = document.getElementById("mobNavReport");

    if (name === "proposal") {
      navProposal?.classList.add("mainnav__link--active");
      analysisTabLink?.classList.remove("mainnav__link--active");
      mobNavProposal?.classList.add("active");
      mobNavReport?.classList.remove("active");
      setTimeout(() => {
        if (proposalMap) proposalMap.invalidateSize();
        else initProposalMap();
      }, 120);
    } else if (name === "report") {
      analysisTabLink?.classList.add("mainnav__link--active");
      navProposal?.classList.remove("mainnav__link--active");
      mobNavReport?.classList.add("active");
      mobNavProposal?.classList.remove("active");
      setTimeout(() => {
        if (reportGapMap) reportGapMap.invalidateSize();
      }, 120);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }


  // Currency Formatter
  function formatINR(val) {
    return "₹" + Number(val).toLocaleString("en-IN");
  }

  // Read current form inputs
  function getFormData() {
    const businessIdea = document.getElementById("businessIdea")?.value.trim() || "Venture Feasibility";
    const industryCategory = document.getElementById("industryCategory")?.value || "printing";
    const targetSegment = document.getElementById("targetSegment")?.value.trim() || "General Consumers";
    const targetLocation = document.getElementById("targetLocation")?.value.trim() || "Anna Nagar, Chennai, Tamil Nadu";
    const macroEnv = document.getElementById("macroEnv")?.value || "college_zone";
    const infraRating = document.getElementById("infraRating")?.value || "urban_high";
    const budget = Number(document.getElementById("budgetSlider")?.value || 350000);
    const catchmentRadius = Number(document.getElementById("catchmentSlider")?.value || 1.0);
    const reportLang = document.getElementById("reportLang")?.value || "en";

    return {
      businessIdea,
      industryCategory,
      targetSegment,
      targetLocation,
      macroEnv,
      infraRating,
      budget,
      catchmentRadius,
      reportLang
    };
  }

  // Set form inputs
  function setFormData(data) {
    if (data.businessIdea) document.getElementById("businessIdea").value = data.businessIdea;
    if (data.industryCategory) document.getElementById("industryCategory").value = data.industryCategory;
    if (data.targetSegment) document.getElementById("targetSegment").value = data.targetSegment;
    if (data.targetLocation) document.getElementById("targetLocation").value = data.targetLocation;
    if (data.macroEnv) document.getElementById("macroEnv").value = data.macroEnv;
    if (data.infraRating) document.getElementById("infraRating").value = data.infraRating;
    if (data.reportLang) document.getElementById("reportLang").value = data.reportLang;

    if (data.budget) {
      setBudget(data.budget);
    }
    if (data.catchment) {
      const slider = document.getElementById("catchmentSlider");
      if (slider) {
        slider.value = data.catchment;
        document.getElementById("catchmentValue").textContent = `${Number(data.catchment).toFixed(1)} km`;
      }
    }

    syncMapWithLocationInput();
  }

  // Budget Slider Sync
  const budgetSlider = document.getElementById("budgetSlider");
  const budgetAmount = document.getElementById("budgetAmount");
  const budgetTierBadge = document.getElementById("budgetTierBadge");
  const chips = document.querySelectorAll(".chip[data-budget]");

  function setBudget(val) {
    const num = Number(val);
    if (budgetSlider) budgetSlider.value = num;
    if (budgetAmount) budgetAmount.textContent = formatINR(num);

    if (budgetTierBadge) {
      if (num <= 100000) budgetTierBadge.textContent = "Micro CapEx";
      else if (num <= 500000) budgetTierBadge.textContent = "Starter CapEx";
      else if (num <= 1500000) budgetTierBadge.textContent = "Mid-Scale CapEx";
      else if (num <= 3500000) budgetTierBadge.textContent = "Growth CapEx";
      else budgetTierBadge.textContent = "Enterprise CapEx";
    }

    chips.forEach((chip) => {
      chip.classList.toggle("chip--active", Number(chip.dataset.budget) === num);
    });
  }

  budgetSlider?.addEventListener("input", (e) => {
    setBudget(e.target.value);
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => setBudget(chip.dataset.budget));
  });

  // Catchment Radius Slider
  const catchmentSlider = document.getElementById("catchmentSlider");
  const catchmentValue = document.getElementById("catchmentValue");
  const mapEstCoverage = document.getElementById("mapEstCoverage");

  catchmentSlider?.addEventListener("input", (e) => {
    const r = Number(e.target.value);
    if (catchmentValue) catchmentValue.textContent = `${r.toFixed(1)} km`;
    const area = (Math.PI * r * r).toFixed(2);
    if (mapEstCoverage) mapEstCoverage.textContent = `Est. Catchment: ~${area} sq.km`;
    syncMapWithLocationInput();
  });

  // Location input sync with Leaflet map
  function syncMapWithLocationInput() {
    const locStr = document.getElementById("targetLocation")?.value.trim() || "";
    const radius = Number(document.getElementById("catchmentSlider")?.value || 1.0);
    const locData = LOCATION_DATABASE[locStr] || { lat: 13.0850, lng: 80.2100 };
    updateMapLocation(locData.lat, locData.lng, radius);
  }

  document.getElementById("targetLocation")?.addEventListener("change", syncMapWithLocationInput);

  /* ==========================================================================
     5. REPORT RENDERING ENGINE
     ========================================================================== */
  function renderAnalysisReport(result) {
    currentAnalysisResult = result;
    const { inputs, industry, metrics, score, verdictLabel, verdictClass, verdictSubtext, scheme, contextNote } = result;

    // Header & Summary
    const reportTitle = document.getElementById("reportBusinessTitle");
    if (reportTitle) reportTitle.textContent = inputs.businessIdea;

    const reportIndustryBadgeText = document.getElementById("reportIndustryBadgeText");
    if (reportIndustryBadgeText) reportIndustryBadgeText.textContent = industry.name.toUpperCase();

    const reportLocationText = document.getElementById("reportLocationText");
    if (reportLocationText) reportLocationText.textContent = inputs.targetLocation;

    const reportCatchmentTag = document.getElementById("reportCatchmentTag");
    if (reportCatchmentTag) reportCatchmentTag.textContent = `${inputs.catchmentRadius.toFixed(1)} km Catchment Buffer`;

    // Verdict Score Ring
    const scoreEl = document.getElementById("verdictScore");
    if (scoreEl) scoreEl.textContent = score;

    const verdictLabelEl = document.getElementById("verdictLabel");
    if (verdictLabelEl) verdictLabelEl.textContent = verdictLabel;

    const verdictSubtextEl = document.getElementById("verdictSubtext");
    if (verdictSubtextEl) verdictSubtextEl.textContent = verdictSubtext;

    const verdictCard = document.getElementById("verdictCard");
    if (verdictCard) {
      verdictCard.className = `verdict-card ${verdictClass}`;
    }

    // Animate Circular Progress Ring
    const ringCircle = document.getElementById("verdictRingProgress");
    if (ringCircle) {
      const circumference = 2 * Math.PI * 38; // r=38 -> 238.76
      const offset = circumference - (score / 100) * circumference;
      ringCircle.style.strokeDasharray = `${circumference}`;
      ringCircle.style.strokeDashoffset = `${offset}`;
    }

    // KPI Cards
    const kpiCapex = document.getElementById("kpiCapex");
    if (kpiCapex) kpiCapex.textContent = formatINR(metrics.recommendedCapex);

    const kpiMonthlyProfit = document.getElementById("kpiMonthlyProfit");
    if (kpiMonthlyProfit) kpiMonthlyProfit.textContent = formatINR(metrics.netMonthlyProfit);

    const kpiProfitMarginText = document.getElementById("kpiProfitMarginText");
    if (kpiProfitMarginText) kpiProfitMarginText.textContent = `${metrics.profitMarginPct}% Operating Margin`;

    const kpiBreakeven = document.getElementById("kpiBreakeven");
    if (kpiBreakeven) kpiBreakeven.textContent = `${metrics.breakevenMonths} Months`;

    const kpiBreakevenNote = document.getElementById("kpiBreakevenNote");
    if (kpiBreakevenNote) {
      kpiBreakevenNote.textContent = metrics.breakevenMonths <= 12 ? "Fast capital recovery" : "Standard operational runway";
    }

    const kpiRoi = document.getElementById("kpiRoi");
    if (kpiRoi) kpiRoi.textContent = `${metrics.annualRoiPct}%`;

    const kpiRoiTierText = document.getElementById("kpiRoiTierText");
    if (kpiRoiTierText) {
      kpiRoiTierText.textContent = Number(metrics.annualRoiPct) > 70 ? "Top-tier capital efficiency" : "Healthy industry benchmark";
    }

    // Financial Breakdown Widget
    const capexDistTotal = document.getElementById("capexDistTotal");
    if (capexDistTotal) capexDistTotal.textContent = Number(metrics.recommendedCapex).toLocaleString("en-IN");

    const barEqCost = document.getElementById("barEqCost");
    if (barEqCost) barEqCost.textContent = formatINR(metrics.capexEq);

    const barFitoutCost = document.getElementById("barFitoutCost");
    if (barFitoutCost) barFitoutCost.textContent = formatINR(metrics.capexFitout);

    const barDepositCost = document.getElementById("barDepositCost");
    if (barDepositCost) barDepositCost.textContent = formatINR(metrics.capexDeposit);

    const barRunwayCost = document.getElementById("barRunwayCost");
    if (barRunwayCost) barRunwayCost.textContent = formatINR(metrics.capexRunway);

    const opexDistTotal = document.getElementById("opexDistTotal");
    if (opexDistTotal) opexDistTotal.textContent = Number(metrics.totalMonthlyOpex).toLocaleString("en-IN");

    const barRentCost = document.getElementById("barRentCost");
    if (barRentCost) barRentCost.textContent = formatINR(metrics.estRent);

    const barSalaryCost = document.getElementById("barSalaryCost");
    if (barSalaryCost) barSalaryCost.textContent = formatINR(metrics.estSalaries);

    const barCogsCost = document.getElementById("barCogsCost");
    if (barCogsCost) barCogsCost.textContent = formatINR(metrics.estCogs);

    const barUtilCost = document.getElementById("barUtilCost");
    if (barUtilCost) barUtilCost.textContent = formatINR(metrics.estUtilities);

    const grossRevenueTag = document.getElementById("grossRevenueTag");
    if (grossRevenueTag) grossRevenueTag.textContent = `Est. Gross Revenue: ${formatINR(metrics.grossMonthlyRevenue)} / mo`;

    // Note / Context Banner
    const locationAdvantageTitle = document.getElementById("locationAdvantageTitle");
    if (locationAdvantageTitle) locationAdvantageTitle.textContent = `${industry.name} — Spatial Advantage`;

    const locationAdvantageText = document.getElementById("locationAdvantageText");
    if (locationAdvantageText) locationAdvantageText.textContent = contextNote;

    // Market Analysis Cards
    updateMarketRadiusStats(result.radiusAnalysis["1.0"] || result.radiusAnalysis[1]);

    // Strategic Gap Map & Text
    const locData = LOCATION_DATABASE[inputs.targetLocation] || { lat: 13.0850, lng: 80.2100 };
    initReportGapMap(locData.lat, locData.lng, inputs.catchmentRadius);

    const gapBannerTitle = document.getElementById("gapBannerTitle");
    if (gapBannerTitle) gapBannerTitle.textContent = `Strategic Gap in ${inputs.targetLocation.split(",")[0]} Node`;

    const gapBannerText = document.getElementById("gapBannerText");
    if (gapBannerText) {
      gapBannerText.textContent = `Spatial simulations identify an under-served quadrant in the ${inputs.catchmentRadius}km catchment. Competitors are clustered towards the main transit junction, leaving high footfall corridors near local offices and institutions open for capture.`;
    }

    // Dynamic Equipment Grid Rendering
    const equipmentGrid = document.getElementById("equipmentGrid");
    if (equipmentGrid) {
      equipmentGrid.innerHTML = result.equipment
        .map(
          (eq) => `
        <article class="equip-card ${eq.recommended ? "equip-card--recommended" : ""}">
          ${eq.recommended ? `<span class="equip-card__ribbon">AI RECOMMENDED</span>` : ""}
          <header class="equip-card__header">
            <h4>${eq.name}</h4>
            <span class="tag">${eq.role}</span>
          </header>
          <div class="equip-card__body">
            <div class="equip-specs">
              <div class="equip-row"><span>Performance Spec</span><strong>${eq.spec}</strong></div>
              <div class="equip-row"><span>Est. Procurement Cost</span><strong>${formatINR(eq.cost)}</strong></div>
            </div>
            <div class="equip-card__note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              ${eq.note}
            </div>
          </div>
        </article>
      `
        )
        .join("");
    }

    // Dynamic Schemes Container Rendering
    const schemesContainer = document.getElementById("schemesContainer");
    if (schemesContainer) {
      schemesContainer.innerHTML = `
        <div class="scheme-hero">
          <div>
            <span class="scheme-hero__eyebrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 10 12 4l9 6M4 10v9h16v-9M2 21h20" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
              ${scheme.authority}
            </span>
            <h3 class="scheme-hero__title">${scheme.title}</h3>
            <p class="scheme-hero__text">${scheme.desc}</p>
          </div>
          <button class="btn btn--primary" onclick="alert('Scheme Application Assistant:\\n\\nEligible under: ${scheme.title}\\nBenefit: ${scheme.subsidyTag}\\n\\nPlease visit the official MSME / Mudra portal or present this GeoFeasibility report to your lending bank.')">
            ${scheme.subsidyTag}
          </button>
        </div>

        <div class="scheme-detail-grid">
          <div class="scheme-detail">
            <button class="scheme-detail__toggle" aria-expanded="true">
              <span class="scheme-detail__title">
                <svg width="16" height="20" viewBox="0 0 24 30" fill="none"><path d="M12 2 3 8v8c0 6.6 4 11 9 12 5-1 9-5.4 9-12V8l-9-6Z" stroke="#EEF0FF" stroke-width="1.6"/></svg>
                Eligibility Matrix
              </span>
              <svg class="chevron" width="12" height="7" viewBox="0 0 12 7" fill="none"><path d="M1 1l5 5 5-5" stroke="#DBE1FF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <p class="scheme-detail__text">${scheme.criteria}</p>
          </div>
          <div class="scheme-detail">
            <button class="scheme-detail__toggle" aria-expanded="true">
              <span class="scheme-detail__title">
                <svg width="16" height="20" viewBox="0 0 24 30" fill="none"><rect x="4" y="2" width="16" height="26" rx="2" stroke="#EEF0FF" stroke-width="1.6"/><path d="M9 9h6M9 14h6M9 19h4" stroke="#EEF0FF" stroke-width="1.6" stroke-linecap="round"/></svg>
                Disbursement Procedure
              </span>
              <svg class="chevron" width="12" height="7" viewBox="0 0 12 7" fill="none"><path d="M1 1l5 5 5-5" stroke="#DBE1FF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <p class="scheme-detail__text">${scheme.procedure}</p>
          </div>
        </div>
      `;

      // Re-attach collapse toggles
      schemesContainer.querySelectorAll(".scheme-detail__toggle").forEach((btn) => {
        btn.addEventListener("click", () => {
          const expanded = btn.getAttribute("aria-expanded") === "true";
          btn.setAttribute("aria-expanded", String(!expanded));
        });
      });
    }
  }

  function updateMarketRadiusStats(statObj) {
    if (!statObj) return;
    const marketFootfall = document.getElementById("marketFootfall");
    if (marketFootfall) marketFootfall.textContent = statObj.footfall;

    const marketCompetitors = document.getElementById("marketCompetitors");
    if (marketCompetitors) marketCompetitors.textContent = statObj.competitors;

    const marketAreaHint = document.getElementById("marketAreaHint");
    if (marketAreaHint) marketAreaHint.textContent = `Coverage Area: ${statObj.area} (${statObj.densityNote})`;
  }

  // Segmented Radius Toggle on Report Screen
  document.querySelectorAll(".segmented__btn[data-radius]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".segmented__btn[data-radius]").forEach((b) => b.classList.remove("segmented__btn--active"));
      btn.classList.add("segmented__btn--active");

      const radKey = Number(btn.dataset.radius);
      if (currentAnalysisResult && currentAnalysisResult.radiusAnalysis[radKey]) {
        updateMarketRadiusStats(currentAnalysisResult.radiusAnalysis[radKey]);
        const locData = LOCATION_DATABASE[currentAnalysisResult.inputs.targetLocation] || { lat: 13.0850, lng: 80.2100 };
        initReportGapMap(locData.lat, locData.lng, radKey);
      }
    });
  });

  /* ==========================================================================
     6. LOADING PIPELINE ANIMATION & FEASIBILITY EXECUTION
     ========================================================================== */
  const loadingMessages = [
    "Running spatial density simulation & catchment boundary modeling...",
    "Computing unit economics, footfall capture & operating margin curve...",
    "Selecting machinery specs & capital procurement breakdown...",
    "Benchmarking PMEGP / Mudra subsidy eligibility & break-even runway...",
    "Compiling final location intelligence report & verdict..."
  ];

  const loadingStatusText = document.getElementById("loadingStatusText");
  const progressFill = document.getElementById("progressFill");
  const progressStepPercent = document.getElementById("progressStepPercent");
  let loadingTimers = [];

  function clearLoadingTimers() {
    loadingTimers.forEach((t) => clearTimeout(t));
    loadingTimers = [];
  }

  function runLoadingSequence(onComplete) {
    clearLoadingTimers();
    if (progressFill) progressFill.style.width = "0%";
    if (progressStepPercent) progressStepPercent.textContent = "0%";

    const stepDuration = 650;
    loadingMessages.forEach((msg, i) => {
      const t = setTimeout(() => {
        if (loadingStatusText) loadingStatusText.textContent = msg;
        const pct = Math.round(((i + 1) / loadingMessages.length) * 100);
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressStepPercent) progressStepPercent.textContent = `${pct}%`;

        // Update pipeline step highlights
        const pipeStepId = `pipeStep${Math.min(4, i + 1)}`;
        document.querySelectorAll(".pipeline-step").forEach((p) => p.classList.remove("pipeline-step--active"));
        document.getElementById(pipeStepId)?.classList.add("pipeline-step--active");
      }, i * stepDuration);
      loadingTimers.push(t);
    });

    const finishTimer = setTimeout(onComplete, loadingMessages.length * stepDuration + 250);
    loadingTimers.push(finishTimer);
  }

  function startFeasibilityRun(e) {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const formData = getFormData();
      const result = GeoFeasibilityEngine.calculate(formData);

      showScreen("loading");
      runLoadingSequence(() => {
        try {
          renderAnalysisReport(result);
          showScreen("report");
        } catch (renderErr) {
          console.error("Error rendering analysis report:", renderErr);
          showScreen("report");
        }
      });
    } catch (calcErr) {
      console.error("Error running feasibility calculations:", calcErr);
      showScreen("report");
    }
  }

  // Buttons triggering Feasibility Run
  document.getElementById("generateBtn")?.addEventListener("click", startFeasibilityRun);
  document.getElementById("runFeasibilityBtn")?.addEventListener("click", startFeasibilityRun);
  document.getElementById("runFeasibilityBtnMobile")?.addEventListener("click", (e) => {
    if (e && e.preventDefault) e.preventDefault();
    mobileMenu?.classList.remove("is-open");
    startFeasibilityRun(e);
  });

  // Back to Proposal
  function returnToProposal(e) {
    if (e && e.preventDefault) e.preventDefault();
    clearLoadingTimers();
    showScreen("proposal");
  }
  document.getElementById("backToProposalBtn")?.addEventListener("click", returnToProposal);
  document.getElementById("bottomBackBtn")?.addEventListener("click", returnToProposal);
  document.getElementById("navProposal")?.addEventListener("click", returnToProposal);
  document.getElementById("mobNavProposal")?.addEventListener("click", (e) => {
    mobileMenu?.classList.remove("is-open");
    returnToProposal(e);
  });


  // Tab Link to Report (if report exists)
  document.getElementById("analysisTabLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!currentAnalysisResult) {
      startFeasibilityRun();
    } else {
      showScreen("report");
    }
  });

  /* ==========================================================================
     7. PRESETS MODAL SYSTEM
     ========================================================================== */
  const presetModal = document.getElementById("presetModal");
  const presetsList = document.getElementById("presetsList");

  function renderPresetsList() {
    if (!presetsList) return;
    presetsList.innerHTML = PRESETS.map(
      (p) => `
      <div class="preset-card" data-preset-id="${p.id}">
        <div class="preset-card__header">
          <span class="preset-card__icon">${p.icon}</span>
          <span class="preset-card__budget">${formatINR(p.budget)}</span>
        </div>
        <div class="preset-card__title">${p.title}</div>
        <div class="preset-card__meta">📍 ${p.location.split(",")[0]} • 🏷️ ${p.targetSegment}</div>
        <p class="preset-card__desc">${p.desc}</p>
      </div>
    `
    ).join("");

    presetsList.querySelectorAll(".preset-card").forEach((card) => {
      card.addEventListener("click", () => {
        const pId = card.dataset.presetId;
        const pData = PRESETS.find((x) => x.id === pId);
        if (pData) {
          setFormData(pData);
          closePresetModal();
        }
      });
    });
  }

  function openPresetModal() {
    renderPresetsList();
    if (presetModal) presetModal.classList.add("is-active");
  }

  function closePresetModal() {
    if (presetModal) presetModal.classList.remove("is-active");
  }

  document.getElementById("loadPresetBtn")?.addEventListener("click", openPresetModal);
  document.getElementById("navPresets")?.addEventListener("click", (e) => {
    e.preventDefault();
    openPresetModal();
  });
  document.getElementById("quickPresetBtnTop")?.addEventListener("click", openPresetModal);
  document.getElementById("footerPresetsLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    openPresetModal();
  });
  document.getElementById("mobNavPresets")?.addEventListener("click", (e) => {
    e.preventDefault();
    mobileMenu.classList.remove("is-open");
    openPresetModal();
  });
  document.getElementById("closePresetModalBtn")?.addEventListener("click", closePresetModal);
  presetModal?.addEventListener("click", (e) => {
    if (e.target === presetModal) closePresetModal();
  });

  // Reset Form
  document.getElementById("resetFormBtn")?.addEventListener("click", () => {
    setFormData({
      businessIdea: "Digital Xerox & Print Hub",
      industryCategory: "printing",
      targetSegment: "College Students & Faculty",
      targetLocation: "Anna Nagar, Chennai, Tamil Nadu",
      macroEnv: "college_zone",
      infraRating: "urban_high",
      budget: 350000,
      catchment: 1.0,
      reportLang: "en"
    });
  });

  /* ==========================================================================
     8. EXPORT DATA & PRINTING ENGINE
     ========================================================================== */
  const exportBtn = document.getElementById("exportBtn");
  const exportMenu = document.getElementById("exportMenu");

  exportBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    exportMenu?.classList.toggle("is-open");
  });

  document.addEventListener("click", () => {
    exportMenu?.classList.remove("is-open");
  });

  function downloadCSV() {
    const data = currentAnalysisResult || GeoFeasibilityEngine.calculate(getFormData());
    const m = data.metrics;

    const rows = [
      ["GeoFeasibility AI - Executive Feasibility Model Export"],
      ["Report Date", new Date().toISOString().split("T")[0]],
      [""],
      ["Parameter", "Configured Value"],
      ["Business Venture", data.inputs.businessIdea],
      ["Industry Category", data.industry.name],
      ["Location", data.inputs.targetLocation],
      ["Macro Environment", data.macro.name],
      ["Infrastructure Grade", data.infra.label],
      ["Catchment Radius", `${data.inputs.catchmentRadius} km`],
      [""],
      ["Financial KPI", "Calculated Value"],
      ["Feasibility Score", `${data.score} / 100`],
      ["AI Verdict", data.verdictLabel],
      ["Recommended CapEx", m.recommendedCapex],
      ["Machinery & Equipment CapEx", m.capexEq],
      ["Interior Fit-out CapEx", m.capexFitout],
      ["Rental Security Deposit", m.capexDeposit],
      ["Working Capital Reserve", m.capexRunway],
      ["Monthly Gross Revenue", m.grossMonthlyRevenue],
      ["Monthly Total OpEx", m.totalMonthlyOpex],
      ["Monthly Space Rent", m.estRent],
      ["Monthly Staff Salaries", m.estSalaries],
      ["Monthly COGS / Materials", m.estCogs],
      ["Monthly Net Profit", m.netMonthlyProfit],
      ["Net Profit Margin", `${m.profitMarginPct}%`],
      ["Break-even Horizon", `${m.breakevenMonths} Months`],
      ["Projected Annual ROI", `${m.annualRoiPct}%`],
      ["Daily Footfall Range", `${m.footfallLow} - ${m.footfallHigh}`],
      ["Competitor Count", m.competitorCount],
      [""],
      ["Matched Government Subsidy", data.scheme.title],
      ["Authority", data.scheme.authority],
      ["Benefit", data.scheme.subsidyTag]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GeoFeasibility_${data.inputs.businessIdea.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadJSON() {
    const data = currentAnalysisResult || GeoFeasibilityEngine.calculate(getFormData());
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonStr);
    link.setAttribute("download", `GeoFeasibility_${data.inputs.businessIdea.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  document.getElementById("exportCSVBtn")?.addEventListener("click", downloadCSV);
  document.getElementById("exportReportCsvBtn")?.addEventListener("click", downloadCSV);
  document.getElementById("exportBtnMobile")?.addEventListener("click", downloadCSV);
  document.getElementById("exportJSONBtn")?.addEventListener("click", downloadJSON);
  document.getElementById("bottomExportJsonBtn")?.addEventListener("click", downloadJSON);

  // Print Report
  function printExecutiveReport() {
    if (screens.report.hidden) {
      const data = GeoFeasibilityEngine.calculate(getFormData());
      renderAnalysisReport(data);
      showScreen("report");
      setTimeout(() => window.print(), 300);
    } else {
      window.print();
    }
  }

  document.getElementById("downloadReportBtn")?.addEventListener("click", printExecutiveReport);
  document.getElementById("bottomPrintBtn")?.addEventListener("click", printExecutiveReport);

  // Mobile menu toggle
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  hamburgerBtn?.addEventListener("click", () => {
    mobileMenu.classList.toggle("is-open");
  });

  // Topbar Logo click
  document.getElementById("brandLogo")?.addEventListener("click", returnToProposal);

  // Methodology & Tips links
  document.getElementById("navInsights")?.addEventListener("click", (e) => {
    e.preventDefault();
    alert("GeoFeasibility Spatial Model v2.4 combines Voronoi catchment partitioning, gravity footfall decay, capital adequacy benchmarks, and local demographic elasticity across recognized urban corridors.");
  });
  document.getElementById("footerMethodologyLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Algorithmic Methodology:\n1. Spatial Density & Gravity Capture Curve\n2. Capital Adequacy Matrix vs Sector Floor\n3. Dynamic OpEx Projections (Rent, Labor, COGS)\n4. Multi-tier MSME Government Subsidy Matching");
  });
  document.getElementById("themeToggleBtn")?.addEventListener("click", () => {
    alert("Need Help? Use 'Load Preset Scenarios' to test pre-calibrated models for Cafes, Printing Hubs, Diagnostic Clinics, and Retail Boutiques across major Indian cities.");
  });

  /* ==========================================================================
     9. INITIALIZATION
     ========================================================================== */
  showScreen("proposal");
  initProposalMap();
})();


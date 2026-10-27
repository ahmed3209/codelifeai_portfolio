import { getDb } from '../server/db/database.js'

export const INDUSTRIES_SEED_DATA = [
  {
    title: 'E-Commerce & Retail',
    slug: 'e-commerce-retail',
    icon: 'ShoppingBag',
    badge: 'HIGH-CONVERSION RETAIL',
    short_desc: 'High-conversion headless commerce, unified checkout & sub-second catalog search.',
    long_desc: 'We architect and engineer modern headless commerce platforms designed for high-volume consumer brands and B2B distributors. By decoupling frontend shopping experiences from backend inventory management, we achieve blazing-fast sub-200ms page transitions, seamless checkout flows, and frictionless omnichannel shopping.\n\nOur engineering team specializes in custom Shopify Plus integrations, Medusa/commercelayer headless microservices, elastic search engines, and real-time inventory synchronization across multi-warehouse supply chains.',
    challenges: [
      'Monolithic storefronts causing high bounce rates and cart abandonment due to 4+ second load times.',
      'Disjointed inventory reconciliation between brick-and-mortar POS and digital storefronts.',
      'Database locks and checkout bottlenecks during Black Friday and flash sales events.',
    ],
    solutions: [
      'Headless Next.js edge-rendered storefronts achieving 95+ Google Lighthouse performance scores.',
      'Event-driven inventory synchronization pipelines updating stock counts across all channels in real time.',
      'Distributed serverless checkout microservices engineered to process 50,000+ concurrent transactions without latency degradation.',
    ],
    features: [
      'Headless Next.js / Hydrogen Digital Storefronts',
      'Custom Checkout & PCI-DSS Compliant Payment Gateways',
      'Sub-Second Vector & Keyword Catalog Search (Algolia / Elasticsearch)',
      'Omnichannel Warehouse & ERP Synchronization (NetSuite / SAP)',
      'Personalized Recommendation & Dynamic Pricing Microservices',
      'PWA & Cross-Platform Mobile Commerce Apps (iOS & Android)',
    ],
    stack: ['Next.js', 'Shopify Plus', 'Medusa', 'Stripe', 'PostgreSQL', 'Redis', 'Elasticsearch', 'AWS', 'Tailwind CSS'],
    metrics: [
      { label: 'Search Latency', value: '<120ms' },
      { label: 'Conversion Boost', value: '+34%' },
      { label: 'Uptime on Peak Days', value: '99.99%' },
    ],
    image_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 1,
  },
  {
    title: 'Healthcare & Life Sciences',
    slug: 'healthcare-life-sciences',
    icon: 'HeartPulse',
    badge: 'HIPAA COMPLIANT',
    short_desc: 'HIPAA-compliant patient portals, encrypted telemetry & digital health systems.',
    long_desc: 'We build mission-critical digital health software engineered for uncompromising data security and regulatory compliance. From WebRTC-powered virtual consultation rooms to bidirectional Electronic Health Record (EHR) interoperability gateways, our platforms modernize patient care.\n\nEvery line of code adheres strictly to HIPAA, HITECH, and GDPR guidelines, featuring end-to-end data encryption at rest and in transit, comprehensive immutable audit logging, and role-based clinician access control.',
    challenges: [
      'Strict regulatory penalties and severe legal liability surrounding PHI (Protected Health Information) data breaches.',
      'Fragmented legacy EHR systems that block clinicians from accessing longitudinal patient medical records.',
      'Unstable video connections and high latency during critical telehealth appointments.',
    ],
    solutions: [
      'SOC2 Type II and HIPAA-audited cloud infrastructure with hardware-encrypted storage and zero PHI leakage.',
      'Standardized HL7 FHIR API connectors enabling bi-directional sync with Epic, Cerner, and AthenaHealth.',
      'Low-latency WebRTC streaming clusters with adaptive bitrate streaming for crystal-clear clinical video calls.',
    ],
    features: [
      'HIPAA-Compliant Patient & Provider Telehealth Web/Mobile Portals',
      'HL7 & FHIR Electronic Health Record (EHR) Bridges',
      'Medical IoT Device Telemetry & Vital Signs Monitoring',
      'Secure E-Prescriptions & Clinical Lab Result Distribution',
      'Clinical Trial Data Capture & Compliance Audit Trails',
      'AI-Assisted Medical Imaging Analysis & Diagnostic Workflows',
    ],
    stack: ['React', 'Node.js', 'Python', 'WebRTC', 'PostgreSQL', 'FHIR API', 'Docker', 'AWS GovCloud', 'Redis'],
    metrics: [
      { label: 'Compliance Standard', value: '100% HIPAA' },
      { label: 'Telehealth Latency', value: '<180ms' },
      { label: 'Patient Adoption', value: '+58%' },
    ],
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 2,
  },
  {
    title: 'Education & EdTech',
    slug: 'education-edtech',
    icon: 'GraduationCap',
    badge: 'GLOBAL LEARNING PLATFORMS',
    short_desc: 'Accessible real-time learning portals, LMS microservices & adaptive assessments.',
    long_desc: 'We engineer interactive educational software that transforms how students, educators, and enterprise teams learn. By combining real-time collaboration with AI-driven adaptive assessment engines, our platforms boost student retention and course completion.\n\nOur solutions support modern educational standards including SCORM, xAPI, and LTI, ensuring seamless integration with existing university registries and institutional learning ecosystems.',
    challenges: [
      'Student disengagement and high drop-off rates in passive video-based e-learning courses.',
      'Server crashes when tens of thousands of students submit synchronized exams or stream lectures simultaneously.',
      'Inaccessibility for neurodivergent or visually impaired students due to poor accessibility compliance.',
    ],
    solutions: [
      'Gamified interactive modules, real-time code sandboxes, and collaborative virtual whiteboards.',
      'Horizontally autoscaling WebSocket microservices engineered to support 150,000+ simultaneous test takers.',
      'Full adherence to WCAG 2.1 AA accessibility guidelines, screen-reader optimizations, and keyboard navigation.',
    ],
    features: [
      'Custom Learning Management Systems (LMS) with SCORM / xAPI Support',
      'Synchronized Virtual Classrooms with WebRTC Audio/Video & Canvas Whiteboard',
      'AI-Powered Adaptive Assessment Engines with Instant Grading',
      'Student Engagement & Drop-off Prediction Analytics Dashboards',
      'Enterprise Single Sign-On (SAML / OAuth2) & Student Registry Sync',
      'Offline-First Mobile Learning Apps with Automatic Background Sync',
    ],
    stack: ['React', 'Next.js', 'Node.js', 'WebSockets', 'WebRTC', 'PostgreSQL', 'Redis', 'AWS CloudFront', 'Tailwind CSS'],
    metrics: [
      { label: 'Course Completion', value: '+72%' },
      { label: 'Concurrent Students', value: '150k+' },
      { label: 'Accessibility Rating', value: 'WCAG 2.1 AA' },
    ],
    image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 3,
  },
  {
    title: 'Logistics & Supply Chain',
    slug: 'logistics-supply-chain',
    icon: 'Truck',
    badge: 'REAL-TIME GEOSPATIAL TELEMETRY',
    short_desc: 'Real-time geospatial fleet tracking, automated dispatch & warehouse operations.',
    long_desc: 'We engineer high-throughput supply chain intelligence and freight management platforms. From IoT sensor data streaming on container ships and long-haul trucks to computer-vision-assisted warehouse sorting, our software eliminates blind spots.\n\nOur platforms integrate seamlessly with major carriers and standard logistics protocols (EDI 204, 210, 214), delivering end-to-end visibility from factory floor to doorstep delivery.',
    challenges: [
      'Blind spots across third-party carrier handoffs causing inaccurate ETAs and frustrated customers.',
      'Suboptimal vehicle routing driving up diesel consumption, driver overtime, and fleet wear-and-tear.',
      'Manual inventory counts and spreadsheet errors leading to warehouse stockouts and shipping delays.',
    ],
    solutions: [
      'Real-time GPS telemetry pipelines streaming coordinates directly to low-latency Mapbox visualizations.',
      'AI heuristic routing algorithms that dynamically factor in live traffic, axle weight limits, and delivery windows.',
      'Barcode and RFID scanning web/mobile applications that reconcile warehouse inventory in real time.',
    ],
    features: [
      'Sub-Second GPS Fleet Tracking & Geofenced Alerts',
      'AI Automated Dispatch & Multi-Stop Route Optimization',
      'Warehouse Management Systems (WMS) with Barcode & RFID Support',
      'Driver Mobile Apps (Turn-by-turn guidance & Digital Proof of Delivery)',
      'EDI 204 / 210 / 214 Carrier & Freight Brokerage Integrations',
      'Predictive Inventory Stockout & Replenishment Dashboards',
    ],
    stack: ['React', 'Mapbox GL', 'Node.js', 'Python', 'PostGIS', 'Kafka', 'Redis', 'Docker', 'AWS IoT Core'],
    metrics: [
      { label: 'Route Efficiency', value: '+28%' },
      { label: 'ETA Accuracy', value: '98.4%' },
      { label: 'Fuel Cost Savings', value: '19%' },
    ],
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 4,
  },
  {
    title: 'Automotive & Mobility',
    slug: 'automotive-mobility',
    icon: 'Car',
    badge: 'CONNECTED MOBILITY & TELEMETRY',
    short_desc: 'Connected vehicle telemetry, dealer CRM portals & predictive diagnostics.',
    long_desc: 'We architect modern software platforms for vehicle manufacturers, EV charging networks, and automotive dealership groups. We ingest high-frequency CAN-bus and OBD-II telemetry streams, power digital car configurators, and manage dealership operations.\n\nWhether developing OCPP-compliant EV charging management clouds or companion mobile apps with digital vehicle key functionality, we build secure, scalable automotive tech.',
    challenges: [
      'Massive volumes of high-frequency sensor streams overwhelming conventional database architectures.',
      'Fragmented dealership software ecosystems causing disconnects between online shoppers and showroom sales reps.',
      'Unpredicted mechanical breakdowns causing fleet downtime and warranty cost overruns.',
    ],
    solutions: [
      'High-throughput time-series ingestion pipelines built on Apache Kafka and TimescaleDB handling millions of data points per minute.',
      'Integrated omnichannel dealer portals connecting online vehicle configuration with CRM sales workflows.',
      'Predictive anomaly detection models analyzing vibration and heat metrics to flag component wear before failure.',
    ],
    features: [
      'Connected Vehicle CAN-Bus & OBD-II Cloud Ingestion Engines',
      'Automotive Dealership Digital Showrooms & Inventory Portals',
      'EV Charging Station Management & Billing Platforms (OCPP 1.6 / 2.0.1)',
      'Predictive Vehicle Component Diagnostics & Maintenance Alerts',
      'Driver Companion Mobile Apps (Remote start, lock, and battery telemetry)',
      'Fleet Sharing & Rental Reservation Booking Platforms',
    ],
    stack: ['React', 'React Native', 'Go', 'Python', 'TimescaleDB', 'Kafka', 'MQTT', 'AWS IoT', 'Tailwind CSS'],
    metrics: [
      { label: 'Telemetry Ingestion', value: '1M+ msgs/sec' },
      { label: 'Diagnostic Accuracy', value: '96.2%' },
      { label: 'Dealer Leads', value: '+44%' },
    ],
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 5,
  },
  {
    title: 'Fintech & Enterprise Software',
    slug: 'fintech-enterprise-software',
    icon: 'Landmark',
    badge: 'SOC2 & PCI-DSS READY',
    short_desc: 'SOC2-ready financial platforms, immutable ledgers & real-time settlement APIs.',
    long_desc: 'We build institutional-grade financial platforms that move money securely and instantly. From core double-entry accounting ledgers to algorithmic fraud prevention and digital banking interfaces, our software powers next-generation financial services.\n\nEvery platform is engineered to satisfy stringent SOC2 Type II, PCI-DSS Level 1, and ISO 27001 audit standards, providing mathematically immutable audit trails and microsecond transaction settlement.',
    challenges: [
      'Zero tolerance for ledger imbalances, transaction loss, or concurrency race conditions.',
      'Sophisticated automated fraud attacks that bypass static rule engines and trigger chargeback penalties.',
      'Complex multi-party regulatory compliance (KYC, AML, OFAC sanctions checks).',
    ],
    solutions: [
      'Mathematically provable double-entry ledger architecture with ACID transactional integrity and cryptographic verification.',
      'Real-time machine learning inference scoring risk in under 35ms on every card authorization.',
      'Automated KYC/AML verification workflows integrating biometric identity verification and sanctions screening.',
    ],
    features: [
      'Double-Entry Ledger & Multi-Currency Digital Wallet Microservices',
      'Real-Time Card Issuance & Core Banking API Connectors',
      'AI-Powered Real-Time Fraud & Anomaly Risk Scoring Engine',
      'Automated KYC / AML Identity Verification & Biometric Match',
      'Institutional Asset Management & Algorithmic Trading Dashboards',
      'Open Banking Integrations with Plaid, MX, and Stripe Financial Connections',
    ],
    stack: ['TypeScript', 'React', 'Node.js', 'Go', 'PostgreSQL', 'Redis', 'Kafka', 'AWS CloudHSM', 'Docker'],
    metrics: [
      { label: 'Audit Standards', value: 'SOC2 Type II' },
      { label: 'Transaction Latency', value: '<35ms' },
      { label: 'Fraud Detection Rate', value: '99.4%' },
    ],
    image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 6,
  },
  {
    title: 'Travel & Tourism',
    slug: 'travel-tourism',
    icon: 'Plane',
    badge: 'HIGH-CONCURRENCY BOOKING',
    short_desc: 'High-concurrency flight booking engines, reservation APIs & payment gateways.',
    long_desc: 'We engineer high-availability reservation engines and immersive travel planning software. By integrating Global Distribution Systems (Amadeus, Sabre) and direct airline NDC APIs, our platforms deliver sub-second search results across millions of flight and hotel combinations.\n\nOur systems handle high-volume booking spikes with resilient distributed locking, multi-currency processing, and automated itinerary management.',
    challenges: [
      'Massive traffic spikes during holiday travel promotions overwhelming database servers and dropping bookings.',
      'Multi-second latency when querying complex multi-leg flight combinations across legacy GDS APIs.',
      'Complex cancellation, change fee calculations, and currency conversion reconciliations.',
    ],
    solutions: [
      'Distributed caching layers and asynchronous flight search matrix pipelines delivering sub-400ms query times.',
      'Resilient booking state machines with distributed locks preventing double-bookings.',
      'Automated self-service passenger portals enabling instant flight changes, refunds, and voucher issuance.',
    ],
    features: [
      'GDS Flight Search & Direct Airline Ticketing (NDC API, Amadeus, Sabre)',
      'Hotel & Vacation Rental Property Reservation Management Systems',
      'Dynamic Pricing Engines with Competitor Rate Scraping',
      'Interactive Multilingual Itinerary Builders with Offline Mobile Sync',
      'Multi-Currency Local Payment Gateways (Alipay, Klarna, Apple Pay)',
      'Customer Self-Service Rebooking & Instant Refund Automation',
    ],
    stack: ['Next.js', 'React', 'Node.js', 'Python', 'PostgreSQL', 'Redis', 'Elasticsearch', 'AWS', 'Tailwind CSS'],
    metrics: [
      { label: 'Flight Matrix Query', value: '<350ms' },
      { label: 'Checkout Completion', value: '92.8%' },
      { label: 'Peak Concurrency', value: '80k users' },
    ],
    image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 7,
  },
  {
    title: 'Professional Services',
    slug: 'professional-services',
    icon: 'Briefcase',
    badge: 'ENTERPRISE PRODUCTIVITY',
    short_desc: 'Custom enterprise ERPs, client workflow automation & executive analytics portals.',
    long_desc: 'We build bespoke practice management and enterprise software for legal firms, accounting practices, management consultancies, and digital agencies. We consolidate disparate spreadsheets and tools into a single, cohesive operating system.\n\nFrom smart time-tracking and automated progress billing to secure client document portals and real-time partner analytics, our software eliminates administrative drag.',
    challenges: [
      'Unbilled hours and revenue leakage caused by disconnected manual time-tracking across spreadsheets.',
      'Slow invoice turnaround and delayed client collections harming cash flow predictability.',
      'Partners and executives lacking real-time visibility into project profitability and consultant utilization.',
    ],
    solutions: [
      'Automated background time-tracking tools with single-click conversion into itemized client invoices.',
      'Self-service client intake portals with integrated electronic signatures and instant credit card / ACH payments.',
      'Executive KPI dashboards displaying real-time billable utilization, project margins, and revenue forecasting.',
    ],
    features: [
      'Custom Enterprise Resource Planning (ERP) & Practice Management Systems',
      'Automated Client Intake & Legally Compliant E-Signature Portals',
      'Smart Time-Tracking, Billable Rate Calculators & Automated Invoicing',
      'Executive KPI & Resource Utilization Dashboards',
      'Role-Based Access Control (RBAC) & Bank-Grade Document Vaults',
      'Seamless Integrations with QuickBooks, Xero, Salesforce & Google Workspace',
    ],
    stack: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe Invoicing', 'AWS', 'Tailwind CSS'],
    metrics: [
      { label: 'Admin Time Saved', value: '18 hrs/week' },
      { label: 'Payment Turnaround', value: '-45% days' },
      { label: 'Team Utilization', value: '+24%' },
    ],
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 8,
  },
]

async function seed() {
  const db = getDb()

  await db.execute(`
    CREATE TABLE IF NOT EXISTS industries (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      slug        TEXT UNIQUE NOT NULL,
      icon        TEXT DEFAULT 'Building2',
      badge       TEXT DEFAULT 'ENTERPRISE VERTICAL',
      short_desc  TEXT,
      long_desc   TEXT,
      challenges  TEXT DEFAULT '[]',
      solutions   TEXT DEFAULT '[]',
      features    TEXT DEFAULT '[]',
      stack       TEXT DEFAULT '[]',
      metrics     TEXT DEFAULT '[]',
      image_url   TEXT DEFAULT '',
      show_on_home INTEGER DEFAULT 1,
      sort_order  INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now'))
    )
  `)

  const countRes = await db.execute('SELECT COUNT(*) as c FROM industries')
  if (Number(countRes.rows[0]?.c || 0) > 0) {
    console.log(`Industries already has ${countRes.rows[0].c} records. Updating/refreshing...`)
    await db.execute('DELETE FROM industries')
  }

  for (const ind of INDUSTRIES_SEED_DATA) {
    await db.execute({
      sql: `INSERT INTO industries (title, slug, icon, badge, short_desc, long_desc, challenges, solutions, features, stack, metrics, image_url, show_on_home, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        ind.title,
        ind.slug,
        ind.icon,
        ind.badge,
        ind.short_desc,
        ind.long_desc,
        JSON.stringify(ind.challenges),
        JSON.stringify(ind.solutions),
        JSON.stringify(ind.features),
        JSON.stringify(ind.stack),
        JSON.stringify(ind.metrics),
        ind.image_url,
        ind.show_on_home,
        ind.sort_order,
      ],
    })
  }

  const check = await db.execute('SELECT COUNT(*) as c FROM industries')
  console.log(`✅ Seeded ${check.rows[0]?.c} Industries successfully!`)
}

seed().catch(console.error)

import { getDb } from '../server/db/database.js'

const HIERARCHICAL_SERVICES = [
  {
    title: 'AI Development Services',
    icon: '🧠',
    slug: 'ai-development-services',
    short_desc: 'Custom multi-agent workflows, fine-tuned LLMs, computer vision, and predictive AI systems built for enterprise scale.',
    long_desc: 'We architect enterprise-grade Artificial Intelligence solutions that transform business operations. From autonomous AI agents with tool-calling capabilities to custom Retrieval-Augmented Generation (RAG) pipelines over proprietary data repositories, we deliver secure, compliant, and cost-effective AI systems.\n\nOur engineers specialize in fine-tuning open-source models (Llama 3, Mistral) and integrating frontier LLMs (OpenAI GPT-4o, Anthropic Claude 3.5, Google Gemini 2.0) with strict token guards and low-latency streaming infrastructure.',
    features: [
      'Autonomous Multi-Agent Task Orchestration & Tool Calling',
      'Enterprise Vector RAG over Private Documents & SQL Databases',
      'Computer Vision, OCR & Intelligent Document Processing',
      'Custom LLM Fine-Tuning & Quantization on Dedicated GPUs',
      'Real-Time WebSocket Streaming Chatbots with Safety Guardrails',
      'Predictive Machine Learning Models for Churn, Risk & Demand',
    ],
    stack: ['Python', 'LangChain', 'LlamaIndex', 'OpenAI', 'Gemini 2.0', 'Claude 3.5', 'Pinecone', 'FastAPI', 'PyTorch'],
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 1,
    children: [
      {
        title: 'AI Agent Development',
        slug: 'ai-agent-development',
        short_desc: 'Autonomous intelligent agents capable of multi-step reasoning, external tool execution, and goal completion.',
        long_desc: 'We build autonomous AI agents that act as tireless digital co-workers. Equipped with tool-calling capabilities, short/long-term vector memory, and self-correcting reasoning loops, our agents automate complex knowledge workflows across your CRM, ERP, and internal databases.',
        features: ['Autonomous multi-step execution', 'Tool calling & API integrations', 'Short and long-term memory retrieval', 'Human-in-the-loop approval gates'],
        stack: ['LangChain', 'LangGraph', 'Python', 'OpenAI Functions', 'Redis Vector'],
      },
      {
        title: 'Generative AI Development',
        slug: 'generative-ai-development',
        short_desc: 'Domain-adapted generative AI platforms producing multimodal text, code, audio, and visual outputs.',
        long_desc: 'Harness the creative and generative power of frontier foundation models. We build tailored generative applications including automated report generators, code assistants, dynamic content synthesis engines, and multimodal creative suites.',
        features: ['Multimodal generative pipelines', 'Prompt engineering & caching optimizations', 'Structured JSON output guarantees', 'Cost-effective token routing'],
        stack: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 2.0', 'vLLM', 'Hugging Face'],
      },
      {
        title: 'Machine Learning Development',
        slug: 'machine-learning-development',
        short_desc: 'Custom supervised, unsupervised, and reinforcement learning models deployed into production microservices.',
        long_desc: 'From exploratory data analysis and feature engineering to model training, hyperparameter tuning, and containerized deployment, we deliver robust ML pipelines that solve complex classification, clustering, and regression challenges.',
        features: ['End-to-end MLOps pipeline', 'Automated data drift monitoring', 'Sub-50ms inference microservices', 'High-throughput batch scoring'],
        stack: ['Scikit-learn', 'TensorFlow', 'PyTorch', 'MLflow', 'Docker', 'Kubernetes'],
      },
      {
        title: 'Computer Vision Development',
        slug: 'computer-vision-development',
        short_desc: 'Real-time image classification, object detection, facial recognition, and intelligent OCR extraction.',
        long_desc: 'Extract actionable intelligence from visual media. We design computer vision models for automated quality control in manufacturing, identity verification, geospatial satellite imagery analysis, and high-accuracy document OCR.',
        features: ['Real-time object detection & tracking', 'High-accuracy document OCR', 'Facial & biometric verification', 'Edge device embedded inference'],
        stack: ['OpenCV', 'YOLOv10', 'PyTorch', 'Tesseract', 'TensorRT', 'AWS Rekognition'],
      },
      {
        title: 'Predictive Analytics',
        slug: 'predictive-analytics',
        short_desc: 'Forecasting engines that predict customer churn, demand fluctuations, financial risk, and equipment failure.',
        long_desc: 'Turn historical company data into forward-looking competitive advantage. Our predictive models analyze longitudinal trends to anticipate market changes, optimize inventory reserves, and flag operational anomalies before they escalate.',
        features: ['Time-series demand forecasting', 'Customer lifetime value & churn modeling', 'Predictive equipment maintenance', 'Real-time risk scoring algorithms'],
        stack: ['Prophet', 'XGBoost', 'Python', 'Pandas', 'PostgreSQL', 'Snowflake'],
      },
      {
        title: 'AI Product Development',
        slug: 'ai-product-development',
        short_desc: 'Zero-to-one engineering of commercial AI-native SaaS products from concept prototype to global launch.',
        long_desc: 'We partner with visionary founders and enterprises to engineer AI-native products from the ground up. We handle UX design, multi-tenant databases, real-time streaming interfaces, subscription billing, and GPU cloud infrastructure.',
        features: ['Zero-to-one MVP launch in 4-6 weeks', 'Multi-tenant cloud architecture', 'Stripe recurring billing & token quotas', 'Fluid streaming UI components'],
        stack: ['Next.js', 'React', 'FastAPI', 'Node.js', 'Stripe', 'PostgreSQL', 'AWS'],
      },
      {
        title: 'NLP Development',
        slug: 'nlp-development',
        short_desc: 'Natural language processing for sentiment analysis, semantic search, entity extraction, and multilingual translation.',
        long_desc: 'Make sense of unstructured text across emails, customer support tickets, and legal contracts. We build NLP pipelines that classify sentiment, extract named entities, summarize dense documents, and translate across 90+ languages.',
        features: ['Named Entity Recognition (NER)', 'Sentiment & intent classification', 'Automated document summarization', 'Semantic vector similarity search'],
        stack: ['spaCy', 'NLTK', 'Transformers', 'BERT', 'Pinecone', 'FastAPI'],
      },
    ],
  },
  {
    title: 'Software Development',
    icon: '💻',
    slug: 'software-development',
    short_desc: 'Enterprise-grade custom software, distributed microservices, legacy modernization, and technical advisory.',
    long_desc: 'We engineer mission-critical custom software systems engineered for high availability, zero downtime, and seamless horizontal scale. Whether replacing legacy monolithic systems or building distributed cloud-native microservices from scratch, our senior engineers deliver modular, maintainable codebases with 100% intellectual property handover.\n\nEvery project is executed with strict test-driven development, automated CI/CD deployments, comprehensive API documentation, and strict adherence to enterprise security standards.',
    features: [
      'High-Concurrency Distributed Cloud Microservices',
      'Legacy Monolith Refactoring & Cloud Modernization',
      'Multi-Tenant SaaS Platforms with Role-Based Access Control',
      'Zero-Downtime Blue/Green CI/CD Deployment Pipelines',
      'RESTful & GraphQL API Gateway Architectures',
      'Comprehensive Code Audits, Security Reviews & CTO Advisory',
    ],
    stack: ['Node.js', 'TypeScript', 'Go', 'Python', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
    image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 2,
    children: [
      {
        title: 'Enterprise Software Development',
        slug: 'enterprise-software-development',
        short_desc: 'High-availability, fault-tolerant custom software engineered for enterprise security and scale.',
        long_desc: 'We build enterprise software that powers global corporations. Engineered with strict SOC2/ISO compliance, multi-tenant database isolation, audit logging, and SSO integrations.',
        features: ['Multi-tenant database isolation', 'SSO / SAML / OAuth enterprise login', 'Granular RBAC permissions', 'Comprehensive audit logging'],
        stack: ['TypeScript', 'Node.js', 'Java / Spring', 'PostgreSQL', 'Docker'],
      },
      {
        title: 'Custom Software Development',
        slug: 'custom-software-development',
        short_desc: 'Tailor-made software solutions built around your exact business logic and competitive advantages.',
        long_desc: 'Off-the-shelf software often creates bottlenecks. We develop bespoke applications tailored to your precise workflows, integrating existing systems and removing operational friction.',
        features: ['Custom business logic workflows', 'Third-party API integrations', 'Scalable database schemas', 'Automated QA test suites'],
        stack: ['React', 'Next.js', 'Node.js', 'Python', 'PostgreSQL'],
      },
      {
        title: 'Legacy Modernization',
        slug: 'legacy-modernization',
        short_desc: 'Transform aging legacy applications into modern, cloud-native microservices with zero downtime.',
        long_desc: 'Don’t let technical debt hold back your growth. We incrementally refactor legacy systems using the strangler fig pattern, migrating data and users to modern cloud stacks without downtime.',
        features: ['Strangler fig migration strategy', 'Zero data loss database cutover', 'Monolith to microservices breakdown', 'Modern cloud DevOps integration'],
        stack: ['Docker', 'Kubernetes', 'Node.js', 'PostgreSQL', 'AWS'],
      },
      {
        title: 'Cloud Applications',
        slug: 'cloud-applications',
        short_desc: 'Serverless and containerized cloud applications that auto-scale with traffic spikes.',
        long_desc: 'Engineered for modern cloud providers (AWS, GCP, Azure). We build resilient cloud-native architectures that automatically scale to meet peak loads while keeping infrastructure costs minimal.',
        features: ['Auto-scaling serverless functions', 'Elastic container orchestration', 'Distributed multi-region caching', 'High-availability failover mechanisms'],
        stack: ['AWS Lambda', 'Fargate', 'Cloudflare Workers', 'Terraform', 'PostgreSQL'],
      },
      {
        title: 'Technical Consulting',
        slug: 'technical-consulting',
        short_desc: 'CTO-level architectural guidance, tech stack selection, scalability planning, and engineering leadership.',
        long_desc: 'Make the right technology decisions from day one. Our seasoned software architects provide CTO-as-a-service, conducting feasibility studies, architecture reviews, and team upskilling.',
        features: ['Architecture design & reviews', 'Tech stack & database selection', 'Performance bottleneck audits', 'Scalability roadmaps'],
        stack: ['System Architecture', 'Microservices', 'Distributed Systems', 'Security'],
      },
      {
        title: 'API Development & Integration',
        slug: 'api-development-and-integration',
        short_desc: 'High-speed REST, GraphQL, and gRPC APIs connecting payment gateways, CRMs, and partner ecosystems.',
        long_desc: 'Power your frontend and partner integrations with blazing-fast APIs. We design clean, self-documenting APIs with automated OpenAPI/Swagger specs, rate limiting, and webhook dispatchers.',
        features: ['RESTful & GraphQL endpoints', 'Sub-20ms database queries', 'Rate limiting & API keys', 'Automated Swagger documentation'],
        stack: ['Express', 'FastAPI', 'GraphQL', 'Redis', 'Swagger / OpenAPI'],
      },
      {
        title: 'Software Audit',
        slug: 'software-audit',
        short_desc: 'In-depth code quality, security vulnerability, performance, and architecture health audits.',
        long_desc: 'Before an acquisition, funding round, or major scaling phase, get an objective audit of your codebase. We evaluate security vulnerabilities, test coverage, technical debt, and architectural bottlenecks.',
        features: ['Static code analysis & linting', 'OWASP top 10 security scanning', 'Database query optimization', 'Actionable remediation roadmap'],
        stack: ['SonarQube', 'Snyk', 'OWASP ZAP', 'PostgreSQL EXPLAIN', 'Artillery'],
      },
      {
        title: 'Middleware Development',
        slug: 'middleware-development',
        short_desc: 'Custom integration middleware bridging disparate databases, third-party APIs, and enterprise systems.',
        long_desc: 'Connect legacy on-premises databases with modern SaaS platforms. We build event-driven middleware and message queues that synchronize data reliably in real time.',
        features: ['Event-driven pub/sub architecture', 'Message queue buffering & retry queues', 'Data transformation & ETL pipelines', 'Bi-directional real-time sync'],
        stack: ['Apache Kafka', 'RabbitMQ', 'Redis Pub/Sub', 'Node.js', 'Go'],
      },
      {
        title: 'Gamification',
        slug: 'gamification',
        short_desc: 'Engagement-boosting gamified mechanics, loyalty reward systems, badges, and progress milestones.',
        long_desc: 'Increase user retention and daily active engagement with custom gamification modules. We engineer point economies, dynamic leaderboards, streak rewards, and unlockable achievement tiers.',
        features: ['Real-time leaderboard rankings', 'Dynamic streak & reward systems', 'Virtual point economies', 'Interactive visual milestones'],
        stack: ['WebSockets', 'Redis', 'React', 'TailwindCSS', 'Framer Motion'],
      },
    ],
  },
  {
    title: 'Mobile App Development',
    icon: '📱',
    slug: 'mobile-app-development',
    short_desc: 'Native and cross-platform mobile apps for iOS & Android with fluid 120 FPS animations and offline-first sync.',
    long_desc: 'We craft breathtaking, intuitive mobile applications that captivate users on both Apple App Store and Google Play Store. Leveraging Flutter and React Native, we deliver true native performance, buttery 120 FPS animations, and offline-first local data synchronization from a single shared codebase.\n\nFrom biometric authentication and in-app subscriptions to background geolocation and interactive push notifications, we build mobile experiences that scale to millions of monthly active users.',
    features: [
      'Native 120 FPS Animations & Smooth Touch Gestures',
      'Cross-Platform iOS & Android Codebase with Flutter & React Native',
      'Offline-First Local SQLite Storage & Real-Time Cloud Sync',
      'Biometric Face ID / Touch ID Secure Authentication',
      'Apple App Store & Google Play Publishing Compliance',
      'In-App Purchase & Stripe Subscription Billing Integration',
    ],
    stack: ['Flutter', 'Dart', 'React Native', 'Swift', 'Kotlin', 'SQLite', 'Firebase', 'Fastlane'],
    image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 3,
    children: [
      {
        title: 'Custom Mobile App Development',
        slug: 'custom-mobile-app-development',
        short_desc: 'Bespoke mobile applications crafted around your unique brand identity and user journeys.',
        long_desc: 'Transform your vision into an addictive mobile app. We handle end-to-end design, development, API integration, and app store deployment tailored to your specific audience.',
        features: ['Custom UI design tailored to iOS & Android', 'State management with Riverpod/Redux', 'Push notifications via FCM', 'App Store & Google Play approval'],
        stack: ['Flutter', 'React Native', 'Firebase', 'Figma'],
      },
      {
        title: 'Android App Development',
        slug: 'android-app-development',
        short_desc: 'High-performance Android applications optimized for all smartphone, tablet, and foldable form factors.',
        long_desc: 'Target the global Android ecosystem with apps built to perform smoothly across diverse hardware specifications. We follow modern Material You guidelines and Android Jetpack standards.',
        features: ['Material You design integration', 'Compatibility across 10,000+ Android devices', 'Background services & battery optimization', 'Google Play Store deployment'],
        stack: ['Kotlin', 'Jetpack Compose', 'Android Studio', 'Room DB', 'Retrofit'],
      },
      {
        title: 'iOS App Development',
        slug: 'ios-app-development',
        short_desc: 'Premium iOS experiences engineered with Swift and SwiftUI following Apple Human Interface Guidelines.',
        long_desc: 'Deliver the refined elegance Apple users expect. We build native iOS apps with SwiftUI, integrating Apple Pay, HealthKit, CallKit, Widgets, and App Clips.',
        features: ['Apple Human Interface Guidelines compliance', 'Apple Pay & In-App Purchase integration', 'iOS Home Screen Widgets', 'Strict App Store review adherence'],
        stack: ['Swift', 'SwiftUI', 'Xcode', 'CoreData', 'Combine', 'Apple Pay'],
      },
      {
        title: 'MVP Development',
        slug: 'mvp-development',
        short_desc: 'Rapid mobile MVP delivery in 3-5 weeks to validate core product assumptions with real users.',
        long_desc: 'Validate your startup idea fast without sacrificing quality. We build lean, high-polish minimum viable mobile products focused on your core value proposition.',
        features: ['Rapid 3-5 week launch timeline', 'Core feature prioritization', 'Analytics & user feedback telemetry', 'Built on a scalable production foundation'],
        stack: ['Flutter', 'Supabase', 'Firebase', 'Mixpanel', 'RevenueCat'],
      },
      {
        title: 'App Maintenance & Support',
        slug: 'app-maintenance-and-support',
        short_desc: 'Continuous OS compatibility updates, crash monitoring, performance tuning, and feature iterations.',
        long_desc: 'Mobile operating systems evolve continuously. We keep your app updated for new iOS and Android releases, monitoring Sentry crashes, squashing bugs, and optimizing battery/memory usage.',
        features: ['Annual iOS & Android OS upgrades', '24/7 crash & performance monitoring', 'Dependency & security patching', 'Guaranteed SLA response times'],
        stack: ['Sentry', 'Fastlane', 'GitHub Actions', 'Firebase Crashlytics'],
      },
      {
        title: 'Cross-Platform App Development',
        slug: 'cross-platform-app-development',
        short_desc: 'Single unified codebase running natively on iOS, Android, macOS, and Web with zero code duplication.',
        long_desc: 'Cut development time and maintenance costs in half. We build cross-platform applications with Flutter, sharing 95%+ of code while maintaining true 120 FPS native performance.',
        features: ['95%+ shared codebase across platforms', 'Sub-second hot reload iteration speed', 'Native platform channels for camera/sensors', 'Consistent design language'],
        stack: ['Flutter', 'Dart', 'React Native', 'TypeScript', 'WebSockets'],
      },
      {
        title: 'App Testing & QA',
        slug: 'app-testing-and-qa',
        short_desc: 'Automated end-to-end device testing, manual exploratory QA, and performance profiling.',
        long_desc: 'Ensure your app launches bug-free. Our QA engineers execute automated UI tests across real physical devices in the cloud, verifying performance, memory leaks, and network edge cases.',
        features: ['Automated UI tests via Maestro / Appium', 'Testing on real iOS & Android devices', 'Network throttling & offline simulation', 'Memory leak & battery drain profiling'],
        stack: ['Maestro', 'Appium', 'Firebase Test Lab', 'Postman'],
      },
    ],
  },
  {
    title: 'Web Development',
    icon: '⚡',
    slug: 'web-development',
    short_desc: 'High-velocity React, Next.js, and distributed backend architectures engineered for sub-second speeds.',
    long_desc: 'We engineer full-stack web platforms built for speed, SEO domination, and conversion excellence. From high-converting interactive digital experiences to complex multi-tenant SaaS dashboards, our engineering stack pairs Next.js 15, React 19, and TailwindCSS with distributed microservices.\n\nEvery site we build achieves 95+ Google Lighthouse scores, sub-second First Contentful Paint, automated edge CDN caching, and seamless database architectures.',
    features: [
      'Sub-Second First Contentful Paint & 95+ Core Web Vitals',
      'React 19 & Next.js 15 App Router Full-Stack Architecture',
      'Edge CDN Caching & Global Static Site Generation (SSG)',
      'High-Conversion UI/UX Micro-Interactions & Fluid Animations',
      'Secure OAuth2 Authentication, Role Permissions & Multi-Tenancy',
      'Headless CMS, E-Commerce & Custom Database Integrations',
    ],
    stack: ['React', 'Next.js', 'Node.js', 'TypeScript', 'TailwindCSS', 'PostgreSQL', 'Vercel', 'Redis'],
    image_url: 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 4,
    children: [
      {
        title: 'Web App Development',
        slug: 'web-app-development',
        short_desc: 'Complex single-page and server-rendered web applications engineered for heavy daily workflows.',
        long_desc: 'We build web apps that handle mission-critical business operations with fluid responsiveness. Paired with modern state management, real-time WebSockets, and optimistic UI updates.',
        features: ['Fluid optimistic UI updates', 'Real-time WebSocket data sync', 'Modular component hierarchy', 'Enterprise authentication & SSO'],
        stack: ['Next.js', 'React', 'TypeScript', 'TailwindCSS', 'Zustand'],
      },
      {
        title: 'Back-End Development',
        slug: 'back-end-development',
        short_desc: 'High-throughput, scalable server architectures, database optimization, and secure API layers.',
        long_desc: 'The rock-solid engine powering your frontend. We build resilient backends with Node.js, Express, Go, and Python, structuring high-performance databases with connection pooling and caching.',
        features: ['Sub-15ms database query latency', 'Redis caching layers & connection pooling', 'Role-based access security middleware', 'Comprehensive automated unit & E2E tests'],
        stack: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Prisma / Drizzle'],
      },
      {
        title: 'Web Portal Development',
        slug: 'web-portal-development',
        short_desc: 'Secure customer self-service, vendor management, and employee intranet web portals.',
        long_desc: 'Empower clients and partners with dedicated self-service portals. Featuring document vaults, invoice payments, ticket tracking, and multi-tenant security.',
        features: ['Granular multi-tenant permissions', 'Self-service document uploads & downloads', 'Integrated Stripe / credit card billing', 'Audit trails & activity logs'],
        stack: ['React', 'Next.js', 'PostgreSQL', 'TailwindCSS', 'Stripe'],
      },
      {
        title: 'Progressive Web Apps',
        slug: 'progressive-web-apps',
        short_desc: 'Installable web applications with offline capabilities, push notifications, and app-like feel.',
        long_desc: 'Combine the universal reach of the web with native app capabilities. PWAs install directly to home screens without app store downloads, caching assets for instant offline loading.',
        features: ['Instant home screen installation', 'Offline caching via Service Workers', 'Background push notifications', 'Zero app store commission fees'],
        stack: ['Next.js', 'Workbox', 'Service Workers', 'Web Manifest'],
      },
      {
        title: 'Front-End Development',
        slug: 'front-end-development',
        short_desc: 'Pixel-perfect, accessible, and high-performance interactive interfaces crafted with React & TailwindCSS.',
        long_desc: 'We transform complex Figma designs into clean, responsive HTML, CSS, and React code with obsessive attention to micro-animations, typography, and accessibility.',
        features: ['100% pixel-perfect Figma translations', 'Fluid responsive layout across all breakpoints', 'WCAG AA accessibility compliance', 'Smooth Framer Motion micro-interactions'],
        stack: ['React', 'TailwindCSS', 'Framer Motion', 'TypeScript', 'Radix UI'],
      },
      {
        title: 'Full-Stack Web Development',
        slug: 'full-stack-web-development',
        short_desc: 'Complete end-to-end web engineering covering database design, backend APIs, and frontend UI.',
        long_desc: 'One multidisciplinary team delivering your entire software platform from database migrations to responsive interactive UI. Eliminates handoff friction and speeds up delivery.',
        features: ['Single point of architectural ownership', 'End-to-end type safety with TypeScript', 'Integrated CI/CD delivery pipelines', 'Optimized full-stack performance'],
        stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'TailwindCSS', 'Docker'],
      },
      {
        title: 'UI/UX Design',
        slug: 'ui-ux-design',
        short_desc: 'Design systems, prototyping, and product design. We obsess over details so users do not have to think.',
        long_desc: 'Exceptional software begins with an intuitive design. We build comprehensive Figma design tokens, clickable prototypes, and conversion-optimized user flows.',
        features: ['Complete Figma design systems & tokens', 'Interactive clickable prototype demonstrations', 'User journey mapping & friction audits', 'Dark mode & responsive styling guidelines'],
        stack: ['Figma', 'FigJam', 'Design Tokens', 'TailwindCSS', 'Framer'],
      },
    ],
  },
  {
    title: 'Business Process Automation',
    icon: '⚙️',
    slug: 'business-process-automation',
    short_desc: 'Automate repetitive workflows, document ingestion, data extraction, and cross-platform integrations.',
    long_desc: 'Eliminate manual data entry, human error, and operational bottlenecks. We engineer custom workflow automation pipelines, robotic process automation (RPA), and intelligent document ingestion systems that connect your CRM, accounting, communication, and inventory platforms.\n\nOur automations run 24/7 in the cloud, processing thousands of tasks per hour with guaranteed audit trails, exception alerting, and measurable cost reductions.',
    features: [
      'Custom Multi-System Workflow Automation & Webhooks',
      'Intelligent Document & Invoice OCR Extraction',
      'Robotic Process Automation (RPA) for Legacy Interfaces',
      'Automated Cross-Platform Data Sync & Sanitization',
      'Automated Sales Pipeline & Lead Nurturing Triggers',
      'Real-Time Slack/Email Error Alerting & Auditing Logs',
    ],
    stack: ['Python', 'Node.js', 'Zapier', 'n8n', 'Make', 'PostgreSQL', 'OpenAI', 'AWS Lambda'],
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    show_on_home: 1,
    sort_order: 5,
    children: [
      {
        title: 'Custom Workflow Automation',
        slug: 'custom-workflow-automation',
        short_desc: 'Tailored event-driven workflows connecting your core SaaS tools and internal databases.',
        long_desc: 'Connect disparate software tools into seamless automated pipelines. When a trigger occurs in one tool, our workflows instantly execute multi-step logic across your entire stack.',
        features: ['Event-driven webhook listeners', 'Conditional branching & error fallbacks', 'Automated data transformation', 'Zero human intervention required'],
        stack: ['n8n', 'Node.js', 'Python', 'Webhooks', 'REST APIs'],
      },
      {
        title: 'Document Management Systems',
        slug: 'document-management-systems',
        short_desc: 'Automated document ingestion, optical character recognition (OCR), tagging, and cloud archiving.',
        long_desc: 'Stop sorting PDFs manually. We build intelligent document pipelines that automatically ingest incoming invoices, contracts, and receipts, extracting structured data directly into your database.',
        features: ['Intelligent OCR data extraction', 'Automated tagging & category classification', 'Secure cloud storage & encrypted archiving', 'Full-text search over millions of documents'],
        stack: ['Python', 'Tesseract OCR', 'AWS S3', 'PostgreSQL Full-Text Search'],
      },
      {
        title: 'Business Intelligence Automation',
        slug: 'business-intelligence-automation',
        short_desc: 'Automated KPI reporting, executive summary dashboards, and data pipeline aggregation.',
        long_desc: 'Make informed decisions with real-time data. We build automated data pipelines that aggregate numbers from Stripe, Google Analytics, and databases into clean executive dashboards.',
        features: ['Automated daily/weekly executive reports', 'Multi-source data aggregation pipelines', 'Interactive charting & KPI dashboards', 'Automated anomaly detection alerts'],
        stack: ['PostgreSQL', 'Metabase', 'Python', 'Chart.js', 'AWS Redshift'],
      },
      {
        title: 'Sales Process Automation',
        slug: 'sales-process-automation',
        short_desc: 'Automated lead capture, qualification scoring, CRM updates, and dynamic email sequence triggers.',
        long_desc: 'Accelerate your deal velocity. We automate lead enrichment, route inbound prospects to the right account executive, and trigger personalized follow-ups without manual CRM work.',
        features: ['Instant inbound lead qualification', 'Automated CRM pipeline stage progression', 'Dynamic personalized email sequences', 'Calendar booking & reminder triggers'],
        stack: ['HubSpot API', 'Salesforce API', 'Node.js', 'SendGrid', 'Stripe'],
      },
      {
        title: 'Robotic Process Automation',
        slug: 'robotic-process-automation',
        short_desc: 'Software bots that interact with legacy desktop and web applications without native APIs.',
        long_desc: 'For older government or enterprise systems that lack APIs, our RPA bots mimic human user actions—logging in, clicking buttons, extracting tables, and entering records with 100% precision.',
        features: ['Automated desktop & browser UI actions', 'Scheduled batch data processing', 'Zero API requirement for legacy software', 'Detailed execution audit trails'],
        stack: ['Playwright', 'Puppeteer', 'Python', 'Selenium'],
      },
      {
        title: 'Automated Data Entry Solutions',
        slug: 'automated-data-entry-solutions',
        short_desc: 'Eliminate manual copy-paste errors with automated ingestion, validation, and database updates.',
        long_desc: 'Replace tedious manual data entry teams with automated ingestion bots that validate inputs against business rules before writing directly to your production databases.',
        features: ['Automated schema validation & cleansing', 'Duplicate record detection & merging', 'High-speed bulk CSV / Excel ingestion', 'Guaranteed 99.99% data accuracy'],
        stack: ['Python', 'Pandas', 'Node.js', 'PostgreSQL', 'JSON Schema'],
      },
      {
        title: 'Supply Chain Automation',
        slug: 'supply-chain-automation',
        short_desc: 'Automate purchase orders, inventory threshold alerts, tracking updates, and vendor notices.',
        long_desc: 'Keep supply chains running smoothly without manual spreadsheets. We automate low-stock reorder triggers, shipment status syncs, supplier invoicing, and freight tracking updates.',
        features: ['Dynamic inventory threshold reorders', 'Real-time carrier tracking sync', 'Automated supplier invoice reconciliation', 'Predictive stockout alert warnings'],
        stack: ['Node.js', 'PostgreSQL', 'REST APIs', 'Webhooks', 'AWS'],
      },
    ],
  },
]

async function runSeed() {
  const db = getDb()

  console.log('🌱 Starting hierarchical services seed…')

  // Clear existing services to make room for full hierarchical seed
  await db.execute('DELETE FROM services')
  console.log('Cleared existing services.')

  let headCount = 0
  let childCount = 0

  for (const head of HIERARCHICAL_SERVICES) {
    headCount++
    const insHead = await db.execute({
      sql: `INSERT INTO services (title, slug, icon, short_desc, long_desc, features, stack, image_url, show_on_home, sort_order, parent_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      args: [
        head.title,
        head.slug,
        head.icon,
        head.short_desc,
        head.long_desc,
        JSON.stringify(head.features),
        JSON.stringify(head.stack),
        head.image_url || '',
        head.show_on_home ? 1 : 0,
        head.sort_order,
      ],
    })

    const headId = Number(insHead.lastInsertRowid)
    console.log(`[Head Service ${headId}] ${head.title} (${head.children.length} sub-services)`)

    let childSort = 1
    for (const child of head.children) {
      childCount++
      await db.execute({
        sql: `INSERT INTO services (title, slug, icon, short_desc, long_desc, features, stack, image_url, show_on_home, sort_order, parent_id)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          child.title,
          child.slug,
          head.icon,
          child.short_desc,
          child.long_desc,
          JSON.stringify(child.features || []),
          JSON.stringify(child.stack || []),
          head.image_url || '',
          0, // Child services don't clutter the home services section
          childSort++,
          headId, // Linked to parent!
        ],
      })
    }
  }

  console.log(`\n✅ Hierarchical services seeded successfully!`)
  console.log(`   Total Head Services: ${headCount}`)
  console.log(`   Total Child Services: ${childCount}`)
  console.log(`   Grand Total: ${headCount + childCount} services created.\n`)
}

runSeed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Seed error:', err)
    process.exit(1)
  })

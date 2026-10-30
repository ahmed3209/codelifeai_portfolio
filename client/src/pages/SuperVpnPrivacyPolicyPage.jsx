import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, EyeOff, Server, Smartphone, Globe, Mail, ArrowLeft, FileText, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'

export default function SuperVpnPrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#060b14] text-slate-300">
      <PageMeta
        path="/upervpn-privacy-pilocy"
        title="Privacy Policy — Super VPN - Fast & Secure"
        description="Official Privacy Policy for Super VPN - Fast & Secure by CodeLife AI. Details on VPN architecture, data protection, and user privacy."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#00f0ff] transition-colors"
          >
            <ArrowLeft size={14} /> Back to CodeLifeAI Home
          </Link>
        </div>

        {/* Main Document Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl p-6 sm:p-10 bg-[#091527]/90 border border-[#00cced]/25 shadow-2xl shadow-black/60 relative overflow-hidden mb-8"
        >
          {/* Accent glow */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-cyan-500/15 border border-cyan-500/30 text-[#00f0ff]">
              <ShieldCheck size={14} /> Official Policy Document
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
              <Calendar size={13} className="text-cyan-400" /> Effective: 23 October 2026
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg text-cyan-300 font-semibold mt-1">
            Super VPN - Fast & Secure
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Application</span>
              <span className="font-semibold text-white">Super VPN - Fast & Secure</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider">Developer & Studio</span>
              <span className="font-semibold text-white">CodeLife AI</span>
            </div>
          </div>
        </motion.div>

        {/* Core Document Body */}
        <div className="rounded-2xl p-6 sm:p-10 bg-[#091527]/60 border border-slate-800/80 shadow-xl space-y-10 text-sm sm:text-base leading-relaxed text-slate-300">
          
          {/* Preamble */}
          <section className="space-y-3">
            <p>
              This Privacy Policy explains how <strong>CodeLife AI</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) may process information when you use <strong>Super VPN - Fast & Secure</strong> (the &ldquo;App&rdquo;). It describes the App&rsquo;s VPN functionality, technical services, and the choices available to you. Please read it carefully.
            </p>
          </section>

          {/* Highlight Callout: NO ACCOUNT OR IN-APP ADS */}
          <div className="rounded-xl p-5 sm:p-6 bg-emerald-950/30 border border-emerald-500/30 text-emerald-100 relative overflow-hidden">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 flex-shrink-0 mt-0.5">
                <EyeOff size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-emerald-300 tracking-wide uppercase">
                  No Account or In-App Ads
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
                  The App does not require you to create an account, sign in, or provide an email address to use its main features. The App does not display in-app advertisements. All server options, including options labelled &ldquo;VIP,&rdquo; are currently available without a paid subscription or in-app purchase.
                </p>
              </div>
            </div>
          </div>

          {/* 1. ABOUT THE APP */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">1.</span> About the App
            </h2>
            <p>
              Super VPN - Fast & Secure lets you connect to available VPN server locations, select supported connection protocols, run a network speed test, use a built-in browser, and manage which installed apps use the VPN through App Filter settings. Availability of features can depend on your device, Android version, network, and server status.
            </p>
          </section>

          {/* 2. INFORMATION THAT MAY BE PROCESSED */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">2.</span> Information That May Be Processed
            </h2>
            <p>
              The information involved depends on how you use the App, the Android permissions you grant, the server infrastructure, and the configuration of integrated third-party services. Information that may be processed includes:
            </p>
            <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-slate-300">
              <li>
                <strong>Technical app and device information:</strong> app version, operating-system version, device model or similar technical details, and diagnostic information.
              </li>
              <li>
                <strong>VPN connection information:</strong> connection state, selected server or protocol, network details needed to establish or troubleshoot a connection, and technical metadata processed by the VPN infrastructure. Your IP address may be visible to the server or network systems involved in routing your connection.
              </li>
              <li>
                <strong>App Filter information:</strong> the installed-app information needed on your device to show app choices and let you select which apps use the VPN. This does not mean the App needs to collect the contents of those apps.
              </li>
              <li>
                <strong>Speed-test results:</strong> download speed, upload speed, latency, and related measurements generated when you run the test. Whether these measurements leave your device depends on the implementation and configuration.
              </li>
              <li>
                <strong>App preferences:</strong> settings such as selected server, protocol, language, theme, or other preferences. Some preferences may be stored locally on your device.
              </li>
              <li>
                <strong>Usage and diagnostic data:</strong> app events, crash information, and technical identifiers that may be processed by Firebase services as described below.
              </li>
            </ul>
            <p className="text-slate-400 text-xs sm:text-sm italic pt-1">
              The App does not ask for your name, phone number, or email address as a condition of using its main VPN features. We do not describe this as a guarantee that no technical data is processed: the VPN infrastructure and third-party SDKs may process technical information as needed for their functions.
            </p>
          </section>

          {/* 3. VPN TRAFFIC, CONNECTION SECURITY, AND SERVER LOGS */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">3.</span> VPN Traffic, Connection Security, and Server Logs
            </h2>
            <p>
              When you grant Android VPN permission and connect, the App uses Android&rsquo;s VPN functionality to route the traffic covered by your settings through a VPN connection to the selected or automatically selected server. VPN encryption and the information visible to the VPN server depend on the actual protocol, server configuration, and implementation used for that connection.
            </p>
            <p>
              CodeLife AI does not intentionally store users&rsquo; browsing activity or IP addresses in an app database, based on the current information provided about the App. However, an IP address and connection metadata may need to be processed temporarily by the VPN server and network infrastructure to establish and route a connection. Server and hosting logs, if enabled by the infrastructure provider, are governed by their configuration and retention practices. A VPN does not guarantee complete anonymity or prevent all tracking.
            </p>
          </section>

          {/* 4. SERVER LOCATIONS, PROTOCOLS, AND PAYMENTS */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">4.</span> Server Locations, Protocols, and Payments
            </h2>
            <p>
              The App provides a list of available VPN server locations and supported connection protocols. Server availability, speed, and latency may change according to network conditions and server status. All server options, including those marked &ldquo;VIP,&rdquo; are currently available without payment. The current App does not offer paid subscriptions, premium purchases, or in-app purchases.
            </p>
          </section>

          {/* 5. APP FILTER AND DEVICE PERMISSIONS */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">5.</span> App Filter and Device Permissions
            </h2>
            <p>
              The App Filter feature uses installed-app information available on the device to let you choose which apps should use the VPN, where supported by Android and the App&rsquo;s implementation. Android VPN permission is used to establish the VPN connection. You can manage relevant permissions in Android settings, although revoking permissions may prevent related features from working.
            </p>
          </section>

          {/* 6. BUILT-IN BROWSER AND THIRD-PARTY WEBSITES */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">6.</span> Built-in Browser and Third-Party Websites
            </h2>
            <p>
              The built-in browser lets you open websites from within the App. Those websites and their service providers may collect information, use cookies or similar technologies, and apply their own privacy practices. Their collection and use of information are controlled by the relevant website operators, not by this Privacy Policy. Please review the policies of websites and services you visit.
            </p>
          </section>

          {/* 7. FIREBASE ANALYTICS */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">7.</span> Firebase Analytics
            </h2>
            <p>
              The App integrates Firebase Analytics. Depending on its configuration, this service may process app usage events, app and device information, and app-instance or other technical identifiers to provide usage statistics and help understand how the App is used. The precise events and data fields depend on the SDK version, configuration, and any consent or collection settings implemented in the App.
            </p>
          </section>

          {/* 8. FIREBASE CRASHLYTICS */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">8.</span> Firebase Crashlytics
            </h2>
            <p>
              The App integrates Firebase Crashlytics to help diagnose app crashes and stability issues. Crash reports may include crash traces, app state, device and operating-system details, and technical identifiers. The precise information processed depends on Crashlytics configuration and the events that occur.
            </p>
          </section>

          {/* 9. FIREBASE CLOUD MESSAGING */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">9.</span> Firebase Cloud Messaging
            </h2>
            <p>
              The App integrates Firebase Cloud Messaging (FCM), which may process a registration token and technical delivery information to send push notifications to the device. You can manage notification permissions through Android settings. Whether notifications are sent and which messages are delivered depend on the App&rsquo;s implementation.
            </p>
            <p className="text-xs sm:text-sm text-slate-400">
              Firebase services are provided by Google. For further details, review the Firebase privacy and security information (<a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">https://firebase.google.com/support/privacy</a>) and the Google Privacy Policy (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">https://policies.google.com/privacy</a>). Google&rsquo;s handling of data through its services is also subject to Google&rsquo;s applicable terms and policies.
            </p>
          </section>

          {/* 10. ADVERTISING AND COOKIES */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">10.</span> Advertising and Cookies
            </h2>
            <p>
              The App does not display in-app advertisements, and AdMob is not listed as an advertising service used by the current App. This does not control advertisements, cookies, or tracking technologies that may be used by websites opened in the built-in browser. Such website practices are governed by the respective website operators&rsquo; policies.
            </p>
          </section>

          {/* 11. HOW INFORMATION MAY BE USED */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">11.</span> How Information May Be Used
            </h2>
            <p>
              Information described in this policy may be processed, where applicable, to establish and maintain VPN connections, provide App features, remember settings, measure performance, diagnose crashes, deliver notifications, maintain service reliability, prevent misuse, and comply with legal obligations.
            </p>
          </section>

          {/* 12. SHARING AND DISCLOSURE */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">12.</span> Sharing and Disclosure
            </h2>
            <p>
              Information may be processed by service providers whose technologies are integrated into the App, including Google Firebase, for the purposes described in this policy. VPN connection data is also handled by the VPN server and related network infrastructure needed to route traffic. Information may be disclosed when required by applicable law or when reasonably necessary to address security, misuse, or protection of rights. We do not sell personal information as a business practice. This statement should not be interpreted as a claim that no information is processed or shared by third-party SDKs or VPN infrastructure.
            </p>
          </section>

          {/* 13. DATA RETENTION AND SECURITY */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">13.</span> Data Retention and Security
            </h2>
            <p>
              Information is retained only as needed for the purposes described in this policy, subject to the configuration and retention practices of the relevant service providers and VPN infrastructure. Firebase may retain technical or diagnostic information according to its service settings and applicable policies. We use reasonable safeguards, but no method of electronic storage or transmission can be guaranteed to be completely secure.
            </p>
          </section>

          {/* 14. YOUR CHOICES AND DATA REQUESTS */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">14.</span> Your Choices and Data Requests
            </h2>
            <p>
              You can stop using the App or uninstall it at any time. You can manage VPN and notification permissions through Android settings and adjust the preferences available in the App. Uninstalling the App does not necessarily delete information already processed by third-party providers. If you have a privacy question or request, contact us using the details below and include enough information for us to understand your request.
            </p>
          </section>

          {/* 15. CHILDREN'S PRIVACY */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">15.</span> Children&rsquo;s Privacy
            </h2>
            <p>
              The App is not designed to knowingly collect personal information from children under 13. If you believe a child has provided personal information in connection with the App, contact us so that we can review the request and take appropriate action where required by applicable law.
            </p>
          </section>

          {/* 16. INTERNATIONAL PROCESSING */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">16.</span> International Processing
            </h2>
            <p>
              VPN connections and third-party services may involve systems located in countries other than your own. Data protection rules may differ between countries. The applicable handling of information depends on the server locations, service providers, and technical configuration used.
            </p>
          </section>

          {/* 17. CHANGES TO THIS POLICY */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">17.</span> Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy when the App, its integrations, or applicable requirements change. We will publish the revised version on this page and update the effective date. Please review it periodically.
            </p>
          </section>

          {/* 18. CONTACT US */}
          <section className="space-y-3 pt-4 border-t border-slate-800">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#00f0ff]">18.</span> Contact Us
            </h2>
            <p>
              For questions or requests about this Privacy Policy, contact:
            </p>
            <div className="rounded-xl p-5 bg-[#060b14]/80 border border-slate-800 space-y-1 text-sm">
              <p className="font-bold text-white">CodeLife AI</p>
              <p className="flex items-center gap-2 text-cyan-400">
                <Mail size={14} />
                <a href="mailto:contact@codelifeai.com" className="hover:underline">
                  contact@codelifeai.com
                </a>
              </p>
            </div>
            <p className="text-xs text-slate-500 pt-2 leading-relaxed">
              This policy describes the App and its integrated services based on the information currently available. Third-party services may process technical information according to their own configurations and applicable privacy terms.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}


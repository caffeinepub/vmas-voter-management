import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  MapPin,
  MapPinned,
  MessageCircle,
  Moon,
  Notebook,
  Printer,
  Shield,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  Vote,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import React from "react";

interface LandingPageProps {
  onNavigate: () => void;
}

const useCases = [
  {
    icon: Users,
    title: "Political Campaign Management",
    description:
      "Track supporters, opponents, and neutrals across booths and wards. Visualize sentiment distribution and prioritize outreach with category labels and influence scoring.",
    badge: "Core Feature",
    color: "#0b0854",
  },
  {
    icon: MapPin,
    title: "Booth-level Outreach",
    description:
      "Organize field visits and follow-ups booth by booth. Assign tasks to volunteers, track completion, and ensure no voter is missed in any area.",
    badge: "Ground Ops",
    color: "#1a1580",
  },
  {
    icon: ClipboardList,
    title: "Community Surveys",
    description:
      "Collect detailed voter demographics including profession, education, caste, religion, and custom fields. Build comprehensive voter profiles for data-driven decisions.",
    badge: "Data Collection",
    color: "#0b0854",
  },
  {
    icon: UserCheck,
    title: "Volunteer Coordination",
    description:
      "Assign tasks and track field volunteers. Manage campaign events, follow-up calls, and field visits with real-time status updates for every team member.",
    badge: "Team Management",
    color: "#1a1580",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description:
      "Visual dashboards showing voter distribution, category breakdown, birthday alerts, education and profession breakdowns, and monthly growth trends.",
    badge: "Insights",
    color: "#0b0854",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Outreach",
    description:
      "Send personalized WhatsApp messages using gender-specific templates. Use placeholders like {name} for automatic personalization. Reach hundreds of voters instantly.",
    badge: "Communication",
    color: "#1a1580",
  },
];

const features = [
  {
    icon: Shield,
    title: "3-Role Access Control",
    description:
      "Super Admin, Data Entry, and Viewer roles with granular permissions.",
  },
  {
    icon: FileSpreadsheet,
    title: "Bulk Excel Import",
    description:
      "Import thousands of voters at once using a downloadable Excel template.",
  },
  {
    icon: Printer,
    title: "Label Printing",
    description:
      "Generate voter address labels — 10 per A4 page — for bulk mail campaigns.",
  },
  {
    icon: Moon,
    title: "Dark Mode",
    description:
      "Full dark mode support for comfortable use in any lighting condition.",
  },
];

const stats = [
  { value: "3 Lakh+", label: "Voter Capacity", icon: Users },
  { value: "30+", label: "Data Fields", icon: ClipboardList },
  { value: "3 Roles", label: "Access Levels", icon: Shield },
  { value: "Real-time", label: "Analytics", icon: TrendingUp },
];

const screenshots = [
  {
    image: "/assets/generated/dashboard-screenshot.dim_1200x750.png",
    title: "Campaign Command Center",
    scenario:
      "On election day, your campaign coordinator opens the dashboard to get an instant read on ground operations.",
    bullets: [
      "2,847 voters tracked across 48 booths — instantly know your field coverage",
      "Category donut shows 45% Supporters: enough to win if they turn out",
      "7 pending tasks and birthday alerts keep your team proactive all day",
    ],
    badge: "Dashboard",
    reverse: false,
  },
  {
    image: "/assets/generated/analytics-screenshot.dim_1200x750.png",
    title: "Data-Driven Voter Strategy",
    scenario:
      "A week before canvassing, the party strategist analyzes voter demographics to craft targeted messages.",
    bullets: [
      "Education breakdown reveals 38% graduates — pitch policy details, not just slogans",
      "Profession data shows 40% farmers — lead with agricultural welfare schemes",
      "Caste/community charts guide which community leaders to engage first",
    ],
    badge: "Analytics",
    reverse: true,
  },
  {
    image: "/assets/generated/voters-screenshot.dim_1200x750.png",
    title: "Precision Voter Outreach",
    scenario:
      "Your data entry team filters booth-wise supporters and sends WhatsApp messages with one click.",
    bullets: [
      "Filter by Booth 12 + Supporter category → 89 voters to contact today",
      "Influence stars (1–5) highlight key opinion leaders worth personal visits",
      "Direct WhatsApp link generation saves hours of manual messaging",
    ],
    badge: "Voter List",
    reverse: false,
  },
];

const vlpUseCases = [
  {
    icon: TrendingUp,
    title: "Election History Tracking",
    description:
      "Track last 5 years of election results booth-by-booth. Know who won, by how much, and the trend — before you plan a single visit.",
    color: "#1565c0",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "AI calculates win probability, classifies booths as Strong/Swing/Weak, and surfaces the top caste influences driving each result.",
    color: "#6a1b9a",
  },
  {
    icon: Users,
    title: "Caste & Demographics Analysis",
    description:
      "See caste breakdown from real voter data for any taluka, village, or booth. Know which community dominates — and which party they lean toward.",
    color: "#00897b",
  },
  {
    icon: Notebook,
    title: "Field Notes & Reports",
    description:
      "Tag notes, photos, and PDFs to specific locations. Generate print-ready PDF reports with charts, insights, and ground intelligence.",
    color: "#e65100",
  },
];

function ScreenshotCard({
  item,
}: {
  item: (typeof screenshots)[0];
}) {
  const imageBlock = (
    <motion.div
      initial={{ opacity: 0, x: item.reverse ? 30 : -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      viewport={{ once: true }}
      className="lg:w-[58%] shrink-0"
    >
      <div className="screenshot-frame">
        <div className="screenshot-chrome">
          <div className="dot" style={{ background: "#ff5f57" }} />
          <div className="dot" style={{ background: "#febc2e" }} />
          <div className="dot" style={{ background: "#28c840" }} />
          <div
            className="flex-1 h-5 rounded ml-2 text-xs flex items-center px-3"
            style={{ background: "#f0f0f0", color: "#888", fontSize: "10px" }}
          >
            surveymitra.app · {item.badge}
          </div>
        </div>
        <img
          src={item.image}
          alt={item.title}
          className="w-full block"
          style={{ display: "block" }}
        />
      </div>
    </motion.div>
  );

  const textBlock = (
    <motion.div
      initial={{ opacity: 0, x: item.reverse ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
      className="flex-1 flex flex-col justify-center"
    >
      <Badge
        className="self-start mb-4 text-xs px-3 py-1"
        style={{
          background: "rgba(11,8,84,0.08)",
          color: "#0b0854",
          border: "none",
        }}
      >
        {item.badge}
      </Badge>
      <h3
        className="font-display text-2xl sm:text-3xl font-bold mb-3 leading-tight"
        style={{ color: "#0b0854" }}
      >
        {item.title}
      </h3>
      <p
        className="text-base leading-relaxed mb-6"
        style={{ color: "rgba(11,8,84,0.65)" }}
      >
        {item.scenario}
      </p>
      <ul className="space-y-3">
        {item.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-3">
            <div
              className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(11,8,84,0.08)" }}
            >
              <CheckCircle2
                className="w-3.5 h-3.5"
                style={{ color: "#0b0854" }}
              />
            </div>
            <span
              className="text-sm leading-relaxed"
              style={{ color: "rgba(11,8,84,0.75)" }}
            >
              {bullet}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={`flex flex-col ${
        item.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
      } gap-10 lg:gap-16 items-center`}
    >
      {imageBlock}
      {textBlock}
    </motion.div>
  );
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen" style={{ background: "#f7f5ee" }}>
      {/* Navigation Bar */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ background: "#0b0854", borderColor: "rgba(227,222,197,0.15)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(227,222,197,0.15)" }}
            >
              <Vote className="w-5 h-5" style={{ color: "#e3dec5" }} />
            </div>
            <div className="flex flex-col">
              <span
                className="font-display font-bold text-lg leading-tight"
                style={{ color: "#e3dec5" }}
              >
                SurveyMitra
              </span>
              <span
                className="leading-none"
                style={{ fontSize: "9px", color: "rgba(227,222,197,0.5)" }}
              >
                by Tattva Innovation
              </span>
            </div>
          </div>
          <Button
            onClick={onNavigate}
            size="sm"
            data-ocid="landing.primary_button"
            style={{ background: "#e3dec5", color: "#0b0854" }}
          >
            Sign In
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-20 sm:py-32"
        style={{
          backgroundImage:
            "url('/assets/generated/hero-campaign-rally.dim_1600x800.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/65" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6 font-medium"
              style={{
                background: "rgba(227,222,197,0.15)",
                color: "#e3dec5",
                border: "1px solid rgba(227,222,197,0.3)",
              }}
            >
              <Star className="w-3.5 h-3.5" />
              Voter Management & Analytics Platform
            </div>
            <h1
              className="font-display text-4xl sm:text-6xl font-bold mb-6 leading-tight"
              style={{ color: "#e3dec5" }}
            >
              Smart Voter
              <br />
              <span style={{ color: "rgba(227,222,197,0.65)" }}>
                Management System
              </span>
            </h1>
            <p
              className="text-lg sm:text-xl mb-10 leading-relaxed max-w-2xl mx-auto"
              style={{ color: "rgba(227,222,197,0.75)" }}
            >
              SurveyMitra helps political campaigns organize, analyze, and
              engage with voters across booths, wards, and constituencies — all
              in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onNavigate}
                size="lg"
                data-ocid="landing.hero.primary_button"
                className="text-base px-8 h-12"
                style={{ background: "#e3dec5", color: "#0b0854" }}
              >
                Sign In to Get Started
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="presentation"
          >
            <title>Decorative wave</title>
            <path
              d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z"
              fill="#f7f5ee"
            />
          </svg>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-14" style={{ background: "#f7f5ee" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-7 rounded-2xl border hover:shadow-card-hover transition-shadow"
                style={{
                  background: "white",
                  borderColor: "rgba(11,8,84,0.08)",
                  boxShadow: "0 2px 12px rgba(11,8,84,0.06)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "rgba(11,8,84,0.07)" }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: "#0b0854" }} />
                </div>
                <div
                  className="font-display text-2xl font-bold mb-1"
                  style={{ color: "#0b0854" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-sm"
                  style={{ color: "rgba(11,8,84,0.55)" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* See It In Action — Screenshot Showcase */}
      <section className="py-20" style={{ background: "#ffffff" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
              style={{ background: "rgba(11,8,84,0.07)", color: "#0b0854" }}
            >
              Product Preview
            </span>
            <h2
              className="font-display text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "#0b0854" }}
            >
              See It In Action
            </h2>
            <p className="text-lg" style={{ color: "rgba(11,8,84,0.6)" }}>
              Real data. Real insights. Real results.
            </p>
          </motion.div>

          <div className="space-y-24">
            {screenshots.map((item) => (
              <ScreenshotCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* VLP — Micro-Level Campaign Intelligence */}
      <section
        className="py-24"
        style={{
          background:
            "linear-gradient(135deg, #0b0854 0%, #1a1580 50%, #0d1a6e 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-5 font-semibold"
              style={{
                background: "rgba(227,222,197,0.12)",
                color: "#e3dec5",
                border: "1px solid rgba(227,222,197,0.25)",
              }}
            >
              <MapPinned className="w-3.5 h-3.5" />
              Village Level Program (VLP)
            </div>
            <h2
              className="font-display text-3xl sm:text-5xl font-bold mb-5 leading-tight"
              style={{ color: "#e3dec5" }}
            >
              Booth-Level Political Intelligence
            </h2>
            <p
              className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed"
              style={{ color: "rgba(227,222,197,0.7)" }}
            >
              Go beyond voter lists. VLP combines real voter data, 5-year
              election history, AI analysis, and field notes to give your
              campaign micro-level strategy for every single booth.
            </p>
          </motion.div>

          {/* VLP Dashboard Mock */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <div
              className="rounded-2xl overflow-hidden shadow-2xl border"
              style={{ borderColor: "rgba(227,222,197,0.2)" }}
            >
              {/* Browser chrome */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ background: "#0d0a60" }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: "#ff5f57" }}
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: "#febc2e" }}
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: "#28c840" }}
                />
                <div
                  className="flex-1 h-6 rounded ml-3 flex items-center px-3 text-xs"
                  style={{
                    background: "rgba(227,222,197,0.08)",
                    color: "rgba(227,222,197,0.5)",
                    fontSize: "11px",
                  }}
                >
                  surveymitra.app · Village Level Program
                </div>
              </div>
              <img
                src="/assets/generated/vlp-dashboard-mock.dim_1200x750.png"
                alt="VLP Dashboard — Booth-level election intelligence"
                className="w-full block"
              />
            </div>
            <p
              className="text-center text-sm mt-3"
              style={{ color: "rgba(227,222,197,0.45)" }}
            >
              VLP Dashboard — Election results, caste analysis, AI insights, and
              field notes in one view
            </p>
          </motion.div>

          {/* VLP Use Case Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {vlpUseCases.map((uc, i) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(227,222,197,0.06)",
                  border: "1px solid rgba(227,222,197,0.12)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${uc.color}30` }}
                >
                  <uc.icon className="w-6 h-6" style={{ color: uc.color }} />
                </div>
                <h3
                  className="font-bold text-base mb-2 leading-tight"
                  style={{ color: "#e3dec5" }}
                >
                  {uc.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(227,222,197,0.6)" }}
                >
                  {uc.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* VLP CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              onClick={onNavigate}
              size="lg"
              data-ocid="landing.vlp.primary_button"
              className="text-base px-8 h-12 font-semibold"
              style={{ background: "#e3dec5", color: "#0b0854" }}
            >
              Explore VLP Dashboard
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
            <p
              className="text-sm mt-3"
              style={{ color: "rgba(227,222,197,0.45)" }}
            >
              Sign in to access Village Level Program and all features
            </p>
          </motion.div>
        </div>
      </section>

      {/* Campaign Stories Image Section */}
      <section className="py-20" style={{ background: "#f7f5ee" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
              style={{ background: "rgba(11,8,84,0.07)", color: "#0b0854" }}
            >
              Trusted Platform
            </span>
            <h2
              className="font-display text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "#0b0854" }}
            >
              Trusted by Campaign Teams Across India
            </h2>
            <p className="text-lg" style={{ color: "rgba(11,8,84,0.6)" }}>
              From grassroots outreach to data-driven strategy — SurveyMitra
              powers it all
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                image: "/assets/generated/india-voting-booth.dim_800x500.jpg",
                caption: "Reach every polling booth",
                desc: "Map and track voter presence across all booths in your constituency",
              },
              {
                image:
                  "/assets/generated/india-campaign-analytics.dim_800x500.jpg",
                caption: "Data-driven campaign strategy",
                desc: "Visual analytics to identify swing voters, track sentiment, and allocate campaign resources",
              },
              {
                image: "/assets/generated/india-voter-outreach.dim_800x500.jpg",
                caption: "Connect with every voter",
                desc: "Personalized WhatsApp and SMS campaigns reaching each voter by name",
              },
            ].map((item, i) => (
              <motion.div
                key={item.caption}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-xl overflow-hidden shadow-lg group"
              >
                <div
                  className="relative overflow-hidden"
                  style={{ height: "220px" }}
                >
                  <img
                    src={item.image}
                    alt={item.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(11,8,84,0.85) 0%, rgba(11,8,84,0.2) 50%, transparent 100%)",
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg leading-tight">
                      {item.caption}
                    </h3>
                  </div>
                </div>
                <div
                  className="p-5"
                  style={{
                    background: "white",
                    borderTop: "1px solid rgba(11,8,84,0.07)",
                  }}
                >
                  <p
                    className="text-sm"
                    style={{ color: "rgba(11,8,84,0.65)" }}
                  >
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20" style={{ background: "white" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              className="font-display text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "#0b0854" }}
            >
              Built for Every Campaign Need
            </h2>
            <p className="text-lg" style={{ color: "rgba(11,8,84,0.65)" }}>
              Six powerful use cases to power your entire voter engagement
              strategy
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl border transition-all group"
                style={{
                  background: "white",
                  borderColor: "rgba(11,8,84,0.08)",
                  boxShadow: "0 2px 8px rgba(11,8,84,0.05)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderLeftWidth =
                    "3px";
                  (e.currentTarget as HTMLDivElement).style.borderLeftColor =
                    "#0b0854";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 8px 24px rgba(11,8,84,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderLeftWidth =
                    "1px";
                  (e.currentTarget as HTMLDivElement).style.borderLeftColor =
                    "rgba(11,8,84,0.08)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 2px 8px rgba(11,8,84,0.05)";
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(11,8,84,0.07)" }}
                >
                  <uc.icon className="w-6 h-6" style={{ color: uc.color }} />
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h3
                    className="font-bold text-base leading-tight"
                    style={{ color: "#0b0854" }}
                  >
                    {uc.title}
                  </h3>
                  <Badge
                    className="ml-2 shrink-0 text-xs"
                    style={{
                      background: "rgba(11,8,84,0.07)",
                      color: "#0b0854",
                      border: "none",
                    }}
                  >
                    {uc.badge}
                  </Badge>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(11,8,84,0.65)" }}
                >
                  {uc.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16" style={{ background: "#0b0854" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              className="font-display text-3xl font-bold mb-4"
              style={{ color: "#e3dec5" }}
            >
              Everything You Need
            </h2>
            <p style={{ color: "rgba(227,222,197,0.65)" }}>
              Platform-wide features that make SurveyMitra the complete solution
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl text-center"
                style={{
                  background: "rgba(227,222,197,0.08)",
                  border: "1px solid rgba(227,222,197,0.15)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "rgba(227,222,197,0.12)" }}
                >
                  <f.icon className="w-6 h-6" style={{ color: "#e3dec5" }} />
                </div>
                <h3 className="font-bold mb-2" style={{ color: "#e3dec5" }}>
                  {f.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "rgba(227,222,197,0.6)" }}
                >
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20" style={{ background: "#ffffff" }}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge
              className="mb-4 px-4 py-1 text-sm font-semibold"
              style={{
                background: "rgba(11,8,84,0.08)",
                color: "#0b0854",
                border: "1px solid rgba(11,8,84,0.15)",
              }}
            >
              Complete Feature Set
            </Badge>
            <h2
              className="font-display text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "#0b0854" }}
            >
              Everything Your Campaign Team Needs
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "rgba(11,8,84,0.6)" }}
            >
              From booth-level data entry to AI-driven election strategy —
              SurveyMitra gives your team the tools to win.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                name: "Voter Management",
                desc: "Add, edit, and search 3 lakh+ voter records with custom fields.",
                useCase:
                  "Campaign team adds 5,000 booth-level voters before election day with a single Excel upload.",
                color: "#1565c0",
              },
              {
                icon: BarChart3,
                name: "Advanced Analytics",
                desc: "9 filters (taluka, caste, religion, district, etc.) and 6 interactive charts.",
                useCase:
                  "Know exactly which caste dominates which booth to prioritize outreach and allocate resources.",
                color: "#6a1b9a",
              },
              {
                icon: MapPinned,
                name: "Village Level Program (VLP)",
                desc: "Micro-level political intelligence combining voter data, election history, AI insights.",
                useCase:
                  "Identify swing booths and weak zones before door-to-door campaigning starts.",
                color: "#0b0854",
              },
              {
                icon: TrendingUp,
                name: "Election Results Dashboard",
                desc: "5-year election history with trend charts, winner/runner-up cards, win probability.",
                useCase:
                  "Compare past margin data to predict which areas need extra attention this election cycle.",
                color: "#e65100",
              },
              {
                icon: Brain,
                name: "AI Insights",
                desc: "Win probability, Strong/Swing/Weak classification, caste influence analysis.",
                useCase:
                  "Get instant AI-driven strategy: focus on OBC voters in Booth 12 to swing the result.",
                color: "#00897b",
              },
              {
                icon: Notebook,
                name: "Field Notes",
                desc: "Add text/image/PDF notes tagged to taluka/village/booth for ground-level intel.",
                useCase:
                  "Field worker logs booth-level intel from the ground; visible instantly to the campaign manager.",
                color: "#2e7d32",
              },
              {
                icon: MessageCircle,
                name: "Bulk Messaging",
                desc: "WhatsApp message templates (male/female) sent to filtered voter list in one click.",
                useCase:
                  "Send personalized 'Please vote' messages to 2,000 selected voters in one click.",
                color: "#1565c0",
              },
              {
                icon: ClipboardList,
                name: "Task Manager",
                desc: "Assign tasks to field workers — follow-ups, visits, campaign activities.",
                useCase:
                  "Super Admin assigns 50 voter follow-up tasks to field agents before polling day.",
                color: "#6a1b9a",
              },
              {
                icon: FileSpreadsheet,
                name: "Excel Import/Export",
                desc: "Import voters via Excel template, export all data as JSON backup.",
                useCase:
                  "Download the template, fill 500 voter records offline, and upload in bulk to the system.",
                color: "#e65100",
              },
              {
                icon: Printer,
                name: "Label Printing",
                desc: "Print voter address labels for mail/distribution campaigns.",
                useCase:
                  "Print booth-wise address stickers for voter slips before door-to-door campaign.",
                color: "#00897b",
              },
              {
                icon: Shield,
                name: "Role-Based Access",
                desc: "3 roles: Super Admin, Data Entry, Viewer with granular permissions.",
                useCase:
                  "Field agents get Data Entry access; senior staff get full Admin control over all data.",
                color: "#2e7d32",
              },
              {
                icon: FileText,
                name: "Report Generation",
                desc: "Full VLP report with charts, AI insights, election history, field notes.",
                useCase:
                  "Print a complete booth-level strategy report before a campaign meeting or presentation.",
                color: "#1565c0",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: (idx % 6) * 0.07 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border p-6 flex flex-col gap-3 hover:shadow-lg transition-shadow"
                  style={{
                    background: "#faf9f5",
                    borderColor: "rgba(11,8,84,0.1)",
                    borderLeftWidth: "4px",
                    borderLeftColor: feature.color,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${feature.color}18` }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: feature.color }}
                      />
                    </div>
                    <h3
                      className="font-bold text-base"
                      style={{ color: "#0b0854" }}
                    >
                      {feature.name}
                    </h3>
                  </div>
                  <p
                    className="text-sm"
                    style={{ color: "rgba(11,8,84,0.65)" }}
                  >
                    {feature.desc}
                  </p>
                  <div
                    className="mt-auto pt-3 border-t text-xs"
                    style={{
                      borderColor: "rgba(11,8,84,0.08)",
                      color: "rgba(11,8,84,0.5)",
                    }}
                  >
                    <span
                      className="font-semibold"
                      style={{ color: feature.color }}
                    >
                      Use Case:{" "}
                    </span>
                    <span className="italic">{feature.useCase}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="relative py-24 overflow-hidden"
        style={{ background: "#e3dec5" }}
      >
        {/* Decorative dots pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(11,8,84,0.15) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 30% 50%, rgba(11,8,84,0.3) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(11,8,84,0.2) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div
              className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(11,8,84,0.1)" }}
            >
              <Vote className="w-8 h-8" style={{ color: "#0b0854" }} />
            </div>
            <h2
              className="font-display text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "#0b0854" }}
            >
              Ready to manage your voter base?
            </h2>
            <p className="text-lg mb-8" style={{ color: "rgba(11,8,84,0.65)" }}>
              Sign in to access the full SurveyMitra platform and start
              organizing your campaign today.
            </p>
            <Button
              onClick={onNavigate}
              size="lg"
              data-ocid="landing.cta.primary_button"
              className="text-base px-10 h-12 shadow-lg"
              style={{ background: "#0b0854", color: "#e3dec5" }}
            >
              Sign In to Get Started
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-6 text-center text-sm border-t"
        style={{
          background: "#0b0854",
          borderColor: "rgba(227,222,197,0.15)",
          color: "rgba(227,222,197,0.55)",
        }}
      >
        © {new Date().getFullYear()} SurveyMitra · Made by{" "}
        <span style={{ color: "rgba(227,222,197,0.8)", fontWeight: 600 }}>
          Tattva Innovation
        </span>
      </footer>
    </div>
  );
}

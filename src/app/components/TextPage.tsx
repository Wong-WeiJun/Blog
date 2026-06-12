import { ArrowLeft } from "lucide-react";

interface Props {
  onBack: () => void;
}

/* ── typography primitives ─── */

function PageH1({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontFamily: "'Fraunces', serif",
        fontWeight: 700,
        fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
        color: "#fff",
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
        margin: "0 0 12px",
      }}
    >
      {children}
    </h1>
  );
}

function PageH2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "'Fraunces', serif",
        fontWeight: 700,
        fontSize: "clamp(1.15rem, 2.2vw, 1.4rem)",
        color: "#fff",
        letterSpacing: "-0.015em",
        lineHeight: 1.3,
        margin: "48px 0 16px",
        paddingTop: "8px",
      }}
    >
      {children}
    </h2>
  );
}

function PageH3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: "'Fraunces', serif",
        fontWeight: 600,
        fontSize: "1.0625rem",
        color: "#e2e2e8",
        letterSpacing: "-0.01em",
        lineHeight: 1.35,
        margin: "28px 0 12px",
      }}
    >
      {children}
    </h3>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "1rem",
        lineHeight: 1.7,
        color: "rgba(255,255,255,0.72)",
        margin: "0 0 18px",
      }}
    >
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "1rem",
        lineHeight: 1.7,
        color: "rgba(255,255,255,0.72)",
        paddingLeft: "24px",
        margin: "0 0 18px",
      }}
    >
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: "8px" }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Metadata({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.75rem",
        color: "rgba(255,255,255,0.35)",
        margin: "0 0 48px",
      }}
    >
      {children}
    </p>
  );
}

/* ─── content sections ─── */

const SECTIONS = [
  {
    h2: "What information we collect",
    content: (
      <>
        <Para>
          We collect information that you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us. This may include your name, email address, and any other information you choose to provide.
        </Para>
        <Para>
          We also automatically collect certain information about your device and how you interact with our services, including:
        </Para>
        <BulletList
          items={[
            "IP address and browser type",
            "Device identifiers and operating system",
            "Pages visited and time spent on each page",
            "Referral URLs and interaction patterns",
          ]}
        />
      </>
    ),
  },
  {
    h2: "How we use your information",
    content: (
      <>
        <Para>
          We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to personalize your experience. Specifically, we may use your information for the following purposes:
        </Para>
        <BulletList
          items={[
            "To deliver the content and services you request",
            "To send you technical notices and support messages",
            "To respond to your comments and questions",
            "To analyze usage trends and optimize performance",
          ]}
        />
        <Para>
          We will never sell your personal information to third parties. We may share information with trusted service providers who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
        </Para>
      </>
    ),
  },
  {
    h2: "Cookies and tracking technologies",
    h3: "Types of cookies we use",
    content: (
      <>
        <Para>
          We use cookies and similar tracking technologies to track activity on our services and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
        </Para>
        <PageH3>Essential cookies</PageH3>
        <Para>
          These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services.
        </Para>
        <PageH3>Analytics cookies</PageH3>
        <Para>
          These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular.
        </Para>
        <PageH3>Functional cookies</PageH3>
        <Para>
          These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.
        </Para>
      </>
    ),
  },
  {
    h2: "Data retention and security",
    content: (
      <>
        <Para>
          We retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
        </Para>
        <Para>
          The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
        </Para>
      </>
    ),
  },
  {
    h2: "Your rights and choices",
    content: (
      <>
        <Para>
          Depending on your location, you may have certain rights regarding your personal information. These may include the right to:
        </Para>
        <BulletList
          items={[
            "Access the personal information we hold about you",
            "Request correction of inaccurate or incomplete information",
            "Request deletion of your personal information",
            "Object to or restrict the processing of your data",
            "Request a copy of your data in a portable format",
          ]}
        />
        <Para>
          To exercise any of these rights, please contact us using the information provided at the end of this policy. We will respond to your request within a reasonable timeframe.
        </Para>
      </>
    ),
  },
  {
    h2: "Third-party services",
    content: (
      <>
        <Para>
          Our services may contain links to third-party websites or services that are not owned or controlled by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
        </Para>
      </>
    ),
  },
  {
    h2: "Changes to this policy",
    content: (
      <>
        <Para>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this document.
        </Para>
        <Para>
          You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
        </Para>
      </>
    ),
  },
  {
    h2: "Contact us",
    content: (
      <>
        <Para>
          If you have any questions about this Privacy Policy, please contact us by email at{" "}
          <a
            href="mailto:hello@wong.dev"
            style={{
              color: "#a5b4fc",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#c3d0ff";
              e.currentTarget.style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#a5b4fc";
              e.currentTarget.style.textDecoration = "none";
            }}
          >
            hello@wong.dev
          </a>
          .
        </Para>
      </>
    ),
  },
];

/* ─── root ─── */

export function TextPage({ onBack }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #080a1a 0%, #0a0c1e 45%, #060818 100%)",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── top bar ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 60,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(8,10,26,0.95)",
          backdropFilter: "blur(12px)",
          height: "52px",
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          gap: "16px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.875rem",
            color: "rgba(255,255,255,0.45)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "#fff")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
          }
        >
          <ArrowLeft size={15} />
          Blog
        </button>
        <div
          style={{
            width: "1px",
            height: "18px",
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <span
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "#fff",
          }}
        >
          Privacy Policy
        </span>
      </div>

      {/* ── reading column ── */}
      <main
        style={{
          maxWidth: "65ch",
          margin: "0 auto",
          padding: "64px 32px 96px",
        }}
      >
        {/* header */}
        <PageH1>Privacy Policy</PageH1>
        <Metadata>Last Updated: June 12, 2026</Metadata>

        {/* sections */}
        {SECTIONS.map((section, i) => (
          <div key={i}>
            <PageH2>{section.h2}</PageH2>
            {section.content}
          </div>
        ))}
      </main>
    </div>
  );
}

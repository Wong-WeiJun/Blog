import { Eye, Clock, User, ArrowLeft, Share2, Bookmark, Twitter, Link2 } from "lucide-react";
import { ReadingProgress } from "./ReadingProgress";
import { TableOfContents, type TocItem } from "./TableOfContents";
import { CodeBlock, InlineCode } from "./CodeBlock";
import { CommentSection } from "./CommentSection";
import { useState } from "react";

const TOC: TocItem[] = [
  { id: "overview", label: "Overview", level: 2 },
  { id: "architecture", label: "Architecture", level: 2 },
  { id: "blue-green-explained", label: "Blue-Green Explained", level: 3 },
  { id: "terraform-setup", label: "Terraform Setup", level: 2 },
  { id: "target-groups", label: "Target Groups", level: 3 },
  { id: "weighted-routing", label: "Weighted Routing", level: 3 },
  { id: "ecs-service", label: "ECS Service Config", level: 3 },
  { id: "cloudwatch-alarms", label: "CloudWatch Alarms", level: 2 },
  { id: "rollback", label: "Auto-Rollback", level: 3 },
  { id: "ci-cd", label: "CI/CD Integration", level: 2 },
  { id: "gotchas", label: "Common Gotchas", level: 2 },
  { id: "conclusion", label: "Conclusion", level: 2 },
];

const TERRAFORM_MAIN = `resource "aws_lb_target_group" "blue" {
  name     = "\${var.service_name}-blue"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/health"
    interval            = 15
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  deregistration_delay = 30
}

resource "aws_lb_target_group" "green" {
  name     = "\${var.service_name}-green"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/health"
    interval            = 15
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  deregistration_delay = 30
}`;

const WEIGHTED_ROUTING = `resource "aws_lb_listener_rule" "weighted" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  action {
    type = "forward"

    forward {
      target_group {
        arn    = aws_lb_target_group.blue.arn
        weight = var.blue_weight  # 100 → 0 during switch
      }
      target_group {
        arn    = aws_lb_target_group.green.arn
        weight = var.green_weight # 0 → 100 during switch
      }
      stickiness {
        enabled  = true
        duration = 300
      }
    }
  }

  condition {
    host_header { values = [var.domain] }
  }
}`;

const GITHUB_ACTIONS = `name: Blue-Green Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ secrets.AWS_ROLE_ARN }}
          aws-region: ap-southeast-1

      # 1. Deploy to inactive target group (green)
      - name: Deploy to Green
        run: |
          aws ecs update-service \\
            --cluster \${{ env.CLUSTER }} \\
            --service \${{ env.SERVICE }}-green \\
            --task-definition \${{ env.TASK_DEF }}

      # 2. Wait for green to stabilize
      - name: Wait for Stability
        run: |
          aws ecs wait services-stable \\
            --cluster \${{ env.CLUSTER }} \\
            --services \${{ env.SERVICE }}-green

      # 3. Shift 10% traffic, watch alarms for 60s
      - name: Canary shift (10%)
        run: |
          terraform apply -var="blue_weight=90" \\
                          -var="green_weight=10" -auto-approve
          sleep 60

      # 4. Full cutover if alarms are OK
      - name: Full cutover
        run: |
          terraform apply -var="blue_weight=0" \\
                          -var="green_weight=100" -auto-approve`;

const CLOUDWATCH = `resource "aws_cloudwatch_metric_alarm" "p99_latency" {
  alarm_name          = "\${var.service_name}-p99-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "p99"
  threshold           = 2.0   # seconds
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
    TargetGroup  = aws_lb_target_group.green.arn_suffix
  }
}`;

function SectionHeading({ id, level, children }: { id: string; level: 2 | 3; children: React.ReactNode }) {
  const common: React.CSSProperties = {
    fontFamily: "'Fraunces', serif",
    color: "#fff",
    letterSpacing: "-0.015em",
    scrollMarginTop: "96px",
  };
  if (level === 2) {
    return (
      <h2
        id={id}
        style={{ ...common, fontSize: "clamp(1.4rem, 2.5vw, 1.75rem)", fontWeight: 700, marginTop: "48px", marginBottom: "16px", paddingTop: "8px" }}
      >
        {children}
      </h2>
    );
  }
  return (
    <h3
      id={id}
      style={{ ...common, fontSize: "1.125rem", fontWeight: 600, marginTop: "32px", marginBottom: "12px" }}
    >
      {children}
    </h3>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.0625rem", lineHeight: 1.8, color: "rgba(255,255,255,0.65)", margin: "0 0 18px" }}>
      {children}
    </p>
  );
}

function Callout({ type = "info", children }: { type?: "info" | "warn" | "tip"; children: React.ReactNode }) {
  const styles: Record<string, { bg: string; border: string; icon: string; label: string }> = {
    info: { bg: "rgba(80,70,229,0.1)", border: "rgba(80,70,229,0.3)", icon: "ℹ", label: "Note" },
    warn: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", icon: "⚠", label: "Warning" },
    tip:  { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)", icon: "✦", label: "Tip" },
  };
  const s = styles[type];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: "10px", padding: "14px 18px", margin: "20px 0", display: "flex", gap: "12px" }}>
      <span style={{ fontSize: "0.875rem", flexShrink: 0, marginTop: "2px" }}>{s.icon}</span>
      <div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>{s.label}</span>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", lineHeight: 1.65, color: "rgba(255,255,255,0.6)", margin: 0 }}>{children}</p>
      </div>
    </div>
  );
}

interface Props {
  onBack: () => void;
  onTagClick?: (tag: string) => void;
}

export function BlogPost({ onBack, onTagClick }: Props) {
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <ReadingProgress />

      {/* Back nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: "7px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.5)", background: "transparent", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
        >
          <ArrowLeft size={15} />
          Back to Blog
        </button>
      </div>

      {/* Article header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        {/* Tag pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
          {["Terraform", "AWS", "ECS", "DevOps"].map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick?.(tag)}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "#a5b4fc", background: "rgba(80,70,229,0.15)", border: "1px solid rgba(80,70,229,0.3)", borderRadius: "6px", padding: "4px 11px", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(80,70,229,0.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(80,70,229,0.15)")}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Title */}
        <h1
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.9rem, 5vw, 3rem)", lineHeight: 1.15, letterSpacing: "-0.02em", color: "#fff", margin: "0 0 18px" }}
        >
          Zero-Downtime Blue-Green Deployments with Terraform and AWS ECS
        </h1>

        {/* Subtitle */}
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.125rem", lineHeight: 1.7, color: "rgba(255,255,255,0.55)", margin: "0 0 28px", maxWidth: "680px" }}>
          Orchestrating seamless container deployments using weighted ALB target groups, Terraform modules, and CloudWatch alarms that auto-rollback on p99 latency spikes.
        </p>

        {/* Author row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(80,70,229,0.35)", border: "2px solid rgba(80,70,229,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: "1.1rem", fontWeight: 700, color: "#a5b4fc" }}>W</span>
            </div>
            <div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "#fff", margin: 0 }}>Wong</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>Jun 10, 2026</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
              <Clock size={12} />5 min read
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
              <Eye size={12} />2,847 views
            </div>
            {/* Share buttons */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                title="Share on Twitter (coming soon)"
                disabled
                style={{ padding: "7px", borderRadius: "7px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", cursor: "default", color: "rgba(255,255,255,0.25)", opacity: 0.5 }}
              >
                <Twitter size={14} />
              </button>
              <button
                title={copied ? "Copied!" : "Copy link"}
                onClick={handleCopyLink}
                style={{ padding: "7px", borderRadius: "7px", background: copied ? "rgba(80,70,229,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${copied ? "rgba(80,70,229,0.4)" : "rgba(255,255,255,0.09)"}`, cursor: "pointer", color: copied ? "#a5b4fc" : "rgba(255,255,255,0.45)", transition: "all 0.15s" }}
              >
                <Link2 size={14} />
              </button>
              <button
                title={bookmarked ? "Remove bookmark" : "Bookmark"}
                onClick={() => setBookmarked((b) => !b)}
                style={{ padding: "7px", borderRadius: "7px", background: bookmarked ? "rgba(80,70,229,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${bookmarked ? "rgba(80,70,229,0.4)" : "rgba(255,255,255,0.09)"}`, cursor: "pointer", color: bookmarked ? "#a5b4fc" : "rgba(255,255,255,0.45)", transition: "all 0.15s" }}
              >
                <Bookmark size={14} fill={bookmarked ? "#a5b4fc" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cover image */}
      <div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12"
        style={{ width: "100%" }}
      >
        <div
          style={{ borderRadius: "16px", overflow: "hidden", background: "linear-gradient(135deg, #0d0f24 0%, #0a1230 50%, #130d28 100%)", minHeight: "320px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 35% 50%, rgba(80,70,229,0.22) 0%, transparent 60%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 75% 30%, rgba(99,102,241,0.15) 0%, transparent 55%)" }} />
          {/* Terminal overlay */}
          <div style={{ position: "relative", zIndex: 1, background: "rgba(5,5,15,0.7)", border: "1px solid rgba(80,70,229,0.25)", borderRadius: "14px", padding: "22px 28px", backdropFilter: "blur(10px)", minWidth: "min(580px, 90vw)" }}>
            <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
              {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => <div key={c} style={{ width: "11px", height: "11px", borderRadius: "50%", background: c }} />)}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginLeft: "8px" }}>deploy.sh</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8125rem", lineHeight: 2, color: "rgba(255,255,255,0.7)" }}>
              <div><span style={{ color: "#6ee7b7" }}>$ </span><span style={{ color: "rgba(165,180,252,0.8)" }}>terraform</span> apply <span style={{ color: "#fcd34d" }}>-var</span>="blue_weight=0" <span style={{ color: "#fcd34d" }}>-var</span>="green_weight=100"</div>
              <div style={{ color: "rgba(255,255,255,0.35)" }}>  Plan: 1 to add, 2 to change, 0 to destroy.</div>
              <div><span style={{ color: "#6ee7b7" }}>✔</span> aws_lb_listener_rule.weighted: Modifications complete</div>
              <div><span style={{ color: "#6ee7b7" }}>✔</span> aws_cloudwatch_metric_alarm.p99_latency: Created</div>
              <div style={{ marginTop: "4px" }}><span style={{ color: "#6ee7b7" }}>Apply complete!</span> <span style={{ color: "rgba(255,255,255,0.4)" }}>Resources: 1 added, 2 changed, 0 destroyed.</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Body + TOC layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/*
          Flex row on xl+: article (72ch) + sticky TOC (220px), gap 96px.
          Flex col below xl: TOC accordion (xl:hidden) appears above article via DOM order.
        */}
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-center" style={{ gap: "96px" }}>
          {/* Single TOC render — desktop aside (xl:block) + mobile accordion (xl:hidden) */}
          <TableOfContents items={TOC} />

          {/* Reading column — pushed after TOC in DOM so mobile accordion sits above it */}
          <article style={{ flex: "0 1 72ch", minWidth: 0, maxWidth: "72ch", order: -1 }}>

            {/* ── BODY CONTENT ── */}
            <SectionHeading id="overview" level={2}>Overview</SectionHeading>
            <Para>
              Every time you deploy a new container image to production you're gambling. Even a well-tested build can break under real load, expose a config drift, or hit a downstream API that behaves differently than staging. The goal of blue-green deployments is to make that gamble reversible in under 30 seconds.
            </Para>
            <Para>
              In this post I'll walk through the exact Terraform configuration I use to run two ECS services — blue (current) and green (next) — behind a single Application Load Balancer, shift traffic between them using weighted listener rules, and auto-rollback when a <InlineCode>p99</InlineCode> latency CloudWatch alarm fires.
            </Para>

            <SectionHeading id="architecture" level={2}>Architecture</SectionHeading>
            <Para>
              The setup has three moving parts: two ECS services sharing the same task definition family, two ALB target groups each receiving a configurable traffic weight, and a set of CloudWatch alarms watching the green target group during the switch window.
            </Para>

            <SectionHeading id="blue-green-explained" level={3}>Blue-Green Explained</SectionHeading>
            <Para>
              "Blue" is always the live environment. "Green" receives the new build. Once green is healthy, you shift a small canary percentage of traffic (10%), observe for 60 seconds, then cut over completely. If an alarm fires during the canary window, Terraform re-applies the original weights. Blue never goes away until the post-deploy observation period clears.
            </Para>
            <Callout type="tip">
              Keep both target groups registered to the same ALB listener. Switching is purely a weight change on the forwarding rule — no DNS TTL, no ELB instance draining delays.
            </Callout>

            <SectionHeading id="terraform-setup" level={2}>Terraform Setup</SectionHeading>

            <SectionHeading id="target-groups" level={3}>Target Groups</SectionHeading>
            <Para>
              Each environment gets its own target group. The critical settings are <InlineCode>deregistration_delay</InlineCode> (match your ALB idle timeout, typically 30s) and a low <InlineCode>healthy_threshold</InlineCode> so new tasks register fast.
            </Para>
            <CodeBlock filename="modules/ecs-blue-green/main.tf" language="hcl" code={TERRAFORM_MAIN} />

            <SectionHeading id="weighted-routing" level={3}>Weighted Routing</SectionHeading>
            <Para>
              The listener rule uses a <InlineCode>forward</InlineCode> action with per-group weights. Variables <InlineCode>blue_weight</InlineCode> and <InlineCode>green_weight</InlineCode> are the only values you need to change to shift traffic — no resource replacements, just an in-place update.
            </Para>
            <CodeBlock filename="modules/ecs-blue-green/listener.tf" language="hcl" code={WEIGHTED_ROUTING} />
            <Callout type="warn">
              Enable session stickiness during the switch window. Without it, a single user's requests may alternate between blue and green mid-session, causing state inconsistencies for authenticated flows.
            </Callout>

            <SectionHeading id="ecs-service" level={3}>ECS Service Config</SectionHeading>
            <Para>
              Both ECS services use <InlineCode>deployment_maximum_percent = 200</InlineCode> and <InlineCode>deployment_minimum_healthy_percent = 100</InlineCode> so rolling updates within each color never drop capacity. The green service starts with <InlineCode>desired_count = 0</InlineCode> and scales up before the canary shift.
            </Para>

            <SectionHeading id="cloudwatch-alarms" level={2}>CloudWatch Alarms</SectionHeading>
            <Para>
              You need at minimum two alarms watching the green target group: p99 response time and 5xx error rate. Both use 60-second evaluation periods with a 2-period breach threshold so a transient spike doesn't trigger a false rollback.
            </Para>
            <CodeBlock filename="modules/ecs-blue-green/alarms.tf" language="hcl" code={CLOUDWATCH} />

            <SectionHeading id="rollback" level={3}>Auto-Rollback</SectionHeading>
            <Para>
              The CI step after each traffic shift polls <InlineCode>aws cloudwatch describe-alarms</InlineCode>. If either alarm enters <InlineCode>ALARM</InlineCode> state, the pipeline immediately re-applies with the original weights and exits non-zero, failing the deployment job and triggering a Slack alert.
            </Para>

            <SectionHeading id="ci-cd" level={2}>CI/CD Integration</SectionHeading>
            <Para>
              The GitHub Actions workflow below orchestrates the full flow: build → push image → deploy green → canary 10% → wait → full cutover. Each <InlineCode>terraform apply</InlineCode> is intentionally separate so the pipeline can roll back at any point.
            </Para>
            <CodeBlock filename=".github/workflows/deploy.yml" language="yaml" code={GITHUB_ACTIONS} />

            <SectionHeading id="gotchas" level={2}>Common Gotchas</SectionHeading>
            <Para>
              A few things that bit me before the setup stabilized:
            </Para>
            <ul style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.0625rem", lineHeight: 1.8, color: "rgba(255,255,255,0.6)", paddingLeft: "22px", margin: "0 0 18px" }}>
              <li style={{ marginBottom: "10px" }}><strong style={{ color: "rgba(255,255,255,0.85)" }}>Health check grace period</strong> — Set <InlineCode>health_check_grace_period_seconds</InlineCode> on the ECS service to at least your app startup time. A cold JVM or SSR bundle can take 15–20s to serve <InlineCode>/health</InlineCode>.</li>
              <li style={{ marginBottom: "10px" }}><strong style={{ color: "rgba(255,255,255,0.85)" }}>Security group overlap</strong> — Both target groups must be in the same SG that allows inbound from the ALB SG. Forgetting to add the green TG to the egress rule is the #1 cause of green tasks staying unhealthy.</li>
              <li style={{ marginBottom: "10px" }}><strong style={{ color: "rgba(255,255,255,0.85)" }}>Stickiness duration</strong> — 300 seconds (5 min) is fine for most apps. For long-lived WebSocket connections, match your max session length or use <InlineCode>LB_COOKIE</InlineCode> stickiness with explicit app-level affinity.</li>
              <li><strong style={{ color: "rgba(255,255,255,0.85)" }}>Weights must sum to 100</strong> — ALB validates this at apply time. Use a <InlineCode>validation</InlineCode> block in your Terraform variables to catch this before a plan hits AWS.</li>
            </ul>

            <SectionHeading id="conclusion" level={2}>Conclusion</SectionHeading>
            <Para>
              Blue-green with weighted ALB routing gives you a deployment strategy that's genuinely zero-downtime, measurably safe, and rollback-friendly. The Terraform module I described is about 200 lines — small enough to own fully and extend with additional alarm conditions as your SLOs mature.
            </Para>
            <Para>
              Next up I want to explore KEDA-based scaling during the canary window so the green fleet auto-scales to handle full traffic before the cutover completes. If you have questions or hit edge cases not covered here, drop a comment below.
            </Para>

            {/* Divider */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: "48px" }} />

            {/* Comments */}
            <CommentSection />
          </article>

        </div>
      </div>
    </>
  );
}

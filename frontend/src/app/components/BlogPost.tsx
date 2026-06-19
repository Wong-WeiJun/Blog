import type { ReactNode, CSSProperties } from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, Clock, ArrowLeft, Bookmark, Twitter, Link2 } from "lucide-react";
import { ReadingProgress } from "./ReadingProgress";
import { TableOfContents, type TocItem } from "./TableOfContents";
import { CodeBlock, InlineCode } from "./CodeBlock";
import { CommentSection } from "./CommentSection";
import type { Post } from "../../data/posts";

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

const TERRAFORM_MAIN = `resource "aws_lb_target_group" "blue" {\n  name     = "\${var.service_name}-blue"\n  port     = 8080\n  protocol = "HTTP"\n  vpc_id   = var.vpc_id\n\n  health_check {\n    path                = "/health"\n    interval            = 15\n    healthy_threshold   = 2\n    unhealthy_threshold = 3\n  }\n\n  deregistration_delay = 30\n}\n\nresource "aws_lb_target_group" "green" {\n  name     = "\${var.service_name}-green"\n  port     = 8080\n  protocol = "HTTP"\n  vpc_id   = var.vpc_id\n\n  health_check {\n    path                = "/health"\n    interval            = 15\n    healthy_threshold   = 2\n    unhealthy_threshold = 3\n  }\n\n  deregistration_delay = 30\n}`;

const WEIGHTED_ROUTING = `resource "aws_lb_listener_rule" "weighted" {\n  listener_arn = aws_lb_listener.https.arn\n  priority     = 100\n\n  action {\n    type = "forward"\n\n    forward {\n      target_group {\n        arn    = aws_lb_target_group.blue.arn\n        weight = var.blue_weight  # 100 → 0 during switch\n      }\n      target_group {\n        arn    = aws_lb_target_group.green.arn\n        weight = var.green_weight # 0 → 100 during switch\n      }\n      stickiness {\n        enabled  = true\n        duration = 300\n      }\n    }\n  }\n\n  condition {\n    host_header { values = [var.domain] }\n  }\n}`;

const GITHUB_ACTIONS = `name: Blue-Green Deploy\n\non:\n  push:\n    branches: [main]\n\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n\n      - name: Configure AWS Credentials\n        uses: aws-actions/configure-aws-credentials@v4\n        with:\n          role-to-assume: \${{ secrets.AWS_ROLE_ARN }}\n          aws-region: ap-southeast-1\n\n      # 1. Deploy to inactive target group (green)\n      - name: Deploy to Green\n        run: |\n          aws ecs update-service \\\n            --cluster \${{ env.CLUSTER }} \\\n            --service \${{ env.SERVICE }}-green \\\n            --task-definition \${{ env.TASK_DEF }}\n\n      # 2. Wait for green to stabilize\n      - name: Wait for Stability\n        run: |\n          aws ecs wait services-stable \\\n            --cluster \${{ env.CLUSTER }} \\\n            --services \${{ env.SERVICE }}-green\n\n      # 3. Shift 10% traffic, watch alarms for 60s\n      - name: Canary shift (10%)\n        run: |\n          terraform apply -var="blue_weight=90" \\\n                          -var="green_weight=10" -auto-approve\n          sleep 60\n\n      # 4. Full cutover if alarms are OK\n      - name: Full cutover\n        run: |\n          terraform apply -var="blue_weight=0" \\\n                          -var="green_weight=100" -auto-approve`;

const CLOUDWATCH = `resource "aws_cloudwatch_metric_alarm" "p99_latency" {\n  alarm_name          = "\${var.service_name}-p99-high"\n  comparison_operator = "GreaterThanThreshold"\n  evaluation_periods  = 2\n  metric_name         = "TargetResponseTime"\n  namespace           = "AWS/ApplicationELB"\n  period              = 60\n  statistic           = "p99"\n  threshold           = 2.0   # seconds\n  alarm_actions       = [aws_sns_topic.alerts.arn]\n\n  dimensions = {\n    LoadBalancer = aws_lb.main.arn_suffix\n    TargetGroup  = aws_lb_target_group.green.arn_suffix\n  }\n}`;

function SectionHeading({ id, level, children }: { id: string; level: 2 | 3; children: ReactNode }) {
  const common: CSSProperties = {
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

function Para({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.0625rem", lineHeight: 1.8, color: "rgba(255,255,255,0.65)", margin: "0 0 18px" }}>
      {children}
    </p>
  );
}

function Callout({ type = "info", children }: { type?: "info" | "warn" | "tip"; children: ReactNode }) {
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

export function BlogPost({ post }: { post: Post }) {
  const navigate = useNavigate();
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
          onClick={() => navigate("/")}
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
          {[post.tag, ...post.tags].slice(0, 4).map((tag) => (
            <Link
              key={tag}
              to={`/tag/${tag}`}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: post.tagColor, background: `${post.tagColor}18`, border: `1px solid ${post.tagColor}38`, borderRadius: "6px", padding: "4px 11px", textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = `${post.tagColor}30`)}
              onMouseLeave={(e) => (e.currentTarget.style.background = `${post.tagColor}18`)}
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.9rem, 5vw, 3rem)", lineHeight: 1.15, letterSpacing: "-0.02em", color: "#fff", margin: "0 0 18px" }}
        >
          {post.title}
        </h1>

        {/* Subtitle */}
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.125rem", lineHeight: 1.7, color: "rgba(255,255,255,0.55)", margin: "0 0 28px", maxWidth: "680px" }}>
          {post.excerpt || "Read this article to learn more."}
        </p>

        {/* Author row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(80,70,229,0.35)", border: "2px solid rgba(80,70,229,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: "1.1rem", fontWeight: 700, color: "#a5b4fc" }}>{post.author[0].toUpperCase()}</span>
            </div>
            <div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "#fff", margin: 0 }}>{post.author}</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>{post.date}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
              <Clock size={12} />{post.readTime}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
              <Eye size={12} />{post.views.toLocaleString()} views
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
              <div><span style={{ color: "#6ee7b7" }}>$ </span><span style={{ color: "rgba(165,180,252,0.8)" }}>terraform</span> apply <span style={{ color: "#fcd34d" }}>-var</span>=&quot;blue_weight=0&quot; <span style={{ color: "#fcd34d" }}>-var</span>=&quot;green_weight=100&quot;</div>
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
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-center" style={{ gap: "96px" }}>
          <TableOfContents items={TOC} />

          <article style={{ flex: "0 1 72ch", minWidth: 0, maxWidth: "72ch", order: -1 }}>
            <SectionHeading id="overview" level={2}>Overview</SectionHeading>
            <Para>
              Every time you deploy a new container image to production you&apos;re gambling. Even a well-tested build can break under real load, expose a config drift, or hit a downstream API that behaves differently than staging. The goal of blue-green deployments is to make that gamble reversible in under 30 seconds.
            </Para>
            <Para>
              In this post I&apos;ll walk through the exact Terraform configuration I use to run two ECS services — blue (current) and green (next) — behind a single Application Load Balancer, shift traffic between them using weighted listener rules, and auto-rollback when a <InlineCode>p99</InlineCode> latency CloudWatch alarm fires.
            </Para>

            <SectionHeading id="architecture" level={2}>Architecture</SectionHeading>
            <Para>
              The setup has three moving parts: two ECS services sharing the same task definition family, two ALB target groups each receiving a configurable traffic weight, and a set of CloudWatch alarms watching the green target group during the switch window.
            </Para>

            <SectionHeading id="blue-green-explained" level={3}>Blue-Green Explained</SectionHeading>
            <Para>
              &quot;Blue&quot; is always the live environment. &quot;Green&quot; receives the new build. Once green is healthy, you shift a small canary percentage of traffic (10%), observe for 60 seconds, then cut over completely. If an alarm fires during the canary window, Terraform re-applies the original weights. Blue never goes away until the post-deploy observation period clears.
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
              Enable session stickiness during the switch window. Without it, a single user&apos;s requests may alternate between blue and green mid-session, causing state inconsistencies for authenticated flows.
            </Callout>

            <SectionHeading id="ecs-service" level={3}>ECS Service Config</SectionHeading>
            <Para>
              Both ECS services use <InlineCode>deployment_maximum_percent = 200</InlineCode> and <InlineCode>deployment_minimum_healthy_percent = 100</InlineCode> so rolling updates within each color never drop capacity. The green service starts with <InlineCode>desired_count = 0</InlineCode> and scales up before the canary shift.
            </Para>

            <SectionHeading id="cloudwatch-alarms" level={2}>CloudWatch Alarms</SectionHeading>
            <Para>
              You need at minimum two alarms watching the green target group: p99 response time and 5xx error rate. Both use 60-second evaluation periods with a 2-period breach threshold so a transient spike doesn&apos;t trigger a false rollback.
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
              Blue-green with weighted ALB routing gives you a deployment strategy that&apos;s genuinely zero-downtime, measurably safe, and rollback-friendly. The Terraform module I described is about 200 lines — small enough to own fully and extend with additional alarm conditions as your SLOs mature.
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

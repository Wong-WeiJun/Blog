export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  tag: string;
  tagColor: string;
  date: string;
  readTime: string;
  status: "published" | "draft";
  views: number;
  author: string;
  color: string;
}

export interface Comment {
  id: number;
  author: string;
  isOwner: boolean;
  avatar: string;
  date: string;
  body: string;
  likes: number;
  liked: boolean;
  replies: Comment[];
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const mockPosts: Post[] = [
  {
    id: 1,
    slug: "zero-downtime-blue-green-deployments-terraform-aws-ecs",
    title: "Zero-Downtime Blue-Green Deployments with Terraform and AWS ECS",
    excerpt: "Exploring how to orchestrate seamless container deployments using Terraform modules, weighted target groups, and CloudWatch alarms that auto-rollback on p99 spike.",
    content: "",
    tags: ["Terraform", "AWS", "ECS", "DevOps"],
    tag: "Terraform",
    tagColor: "#8b5cf6",
    date: "Jun 10, 2026",
    readTime: "5 min",
    status: "published",
    views: 2847,
    author: "Your Name",
    color: "#8b5cf6",
  },
  {
    id: 2,
    slug: "multi-region-s3-replication-lifecycle-policies",
    title: "Setting Up a Multi-Region S3 Replication with Lifecycle Policies",
    excerpt: "A walkthrough of configuring cross-region replication rules, expiration policies, and intelligent-tiering to cut storage costs by 40%.",
    content: "",
    tags: ["AWS"],
    tag: "AWS",
    tagColor: "#f97316",
    date: "Jun 8, 2026",
    readTime: "7 min",
    status: "published",
    views: 2110,
    author: "Your Name",
    color: "#f97316",
  },
  {
    id: 3,
    slug: "multi-stage-docker-builds-shrinking-nodejs-images",
    title: "Multi-Stage Docker Builds: Shrinking Node.js Images from 1.2GB to 90MB",
    excerpt: "Using build-stage separation, .dockerignore tuning, and Alpine base images to produce lean production containers.",
    content: "",
    tags: ["Docker"],
    tag: "Docker",
    tagColor: "#06b6d4",
    date: "Jun 5, 2026",
    readTime: "5 min",
    status: "published",
    views: 1893,
    author: "Your Name",
    color: "#06b6d4",
  },
  {
    id: 4,
    slug: "github-actions-matrix-strategies-parallel-test-pipelines",
    title: "GitHub Actions Matrix Strategies for Parallel Test Pipelines",
    excerpt: "How to cut integration test wall time from 18 minutes to 4 minutes using matrix builds and artifact caching.",
    content: "",
    tags: ["CI/CD"],
    tag: "CI/CD",
    tagColor: "#22c55e",
    date: "May 29, 2026",
    readTime: "6 min",
    status: "published",
    views: 1540,
    author: "Your Name",
    color: "#22c55e",
  },
  {
    id: 5,
    slug: "horizontal-pod-autoscaling-custom-prometheus-metrics-k8s",
    title: "Horizontal Pod Autoscaling with Custom Prometheus Metrics in K8s",
    excerpt: "Going beyond CPU-based HPA — wiring up KEDA with a Prometheus adapter to scale on queue depth and request latency.",
    content: "",
    tags: ["Kubernetes"],
    tag: "Kubernetes",
    tagColor: "#5046e5",
    date: "May 22, 2026",
    readTime: "9 min",
    status: "published",
    views: 1204,
    author: "Your Name",
    color: "#5046e5",
  },
  {
    id: 6,
    slug: "managing-terraform-state-teams-s3-dynamodb-locking",
    title: "Managing Terraform State in Teams: S3 Backend + DynamoDB Locking",
    excerpt: "A production-safe remote state setup with encrypted S3, DynamoDB state locks, and workspace isolation per environment.",
    content: "",
    tags: ["Terraform"],
    tag: "Terraform",
    tagColor: "#8b5cf6",
    date: "May 15, 2026",
    readTime: "6 min",
    status: "published",
    views: 980,
    author: "Your Name",
    color: "#8b5cf6",
  },
  {
    id: 7,
    slug: "systemd-socket-activation-zero-downtime-service-reloads",
    title: "Systemd Socket Activation: Zero-Downtime Service Reloads",
    excerpt: "Leveraging socket activation and Type=notify to achieve seamless process handoffs without dropping a single connection.",
    content: "",
    tags: ["Linux"],
    tag: "Linux",
    tagColor: "#f59e0b",
    date: "May 9, 2026",
    readTime: "8 min",
    status: "published",
    views: 743,
    author: "Your Name",
    color: "#f59e0b",
  },
  {
    id: 8,
    slug: "keda-based-autoscaling-canary-deployments",
    title: "KEDA-Based Autoscaling During Canary Deployments",
    excerpt: "",
    content: "",
    tags: ["Kubernetes"],
    tag: "Kubernetes",
    tagColor: "#5046e5",
    date: "Jun 12, 2026",
    readTime: "",
    status: "draft",
    views: 0,
    author: "Your Name",
    color: "#5046e5",
  },
  {
    id: 9,
    slug: "cloudwatch-composite-alarms-multi-signal-rollback",
    title: "CloudWatch Composite Alarms for Multi-Signal Rollback",
    excerpt: "",
    content: "",
    tags: ["AWS"],
    tag: "AWS",
    tagColor: "#f97316",
    date: "Jun 11, 2026",
    readTime: "",
    status: "draft",
    views: 0,
    author: "Your Name",
    color: "#f97316",
  },
  {
    id: 10,
    slug: "building-lightweight-ci-pipeline-nix-github-actions",
    title: "Building a Lightweight CI Pipeline with Nix + GitHub Actions",
    excerpt: "",
    content: "",
    tags: ["CI/CD"],
    tag: "CI/CD",
    tagColor: "#22c55e",
    date: "Jun 9, 2026",
    readTime: "",
    status: "draft",
    views: 0,
    author: "Your Name",
    color: "#22c55e",
  },
];

export function getPostBySlug(slug: string): Post | undefined {
  return mockPosts.find((p) => p.slug === slug);
}

export function getPostById(id: number): Post | undefined {
  return mockPosts.find((p) => p.id === id);
}

export function getPostsByTag(tag: string): Post[] {
  return mockPosts.filter(
    (p) => p.tags.includes(tag) || p.tag === tag && p.status === "published"
  );
}

export function getPublishedPosts(): Post[] {
  return mockPosts.filter((p) => p.status === "published");
}

export function getAllTags(): { name: string; count: number; color: string }[] {
  const map = new Map<string, { name: string; count: number; color: string }>();
  for (const post of mockPosts) {
    if (post.status !== "published") continue;
    for (const tag of [post.tag, ...post.tags]) {
      const existing = map.get(tag);
      if (existing) {
        existing.count++;
      } else {
        map.set(tag, { name: tag, count: 1, color: post.tagColor });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function getArchiveMonths(): { month: string; count: number }[] {
  const map = new Map<string, number>();
  for (const post of mockPosts) {
    if (post.status !== "published") continue;
    const parts = post.date.split(" ");
    if (parts.length >= 2) {
      const month = `${parts[0]} ${parts[1]}`;
      map.set(month, (map.get(month) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => b.month.localeCompare(a.month));
}

export function getPopularPosts(limit = 5): Post[] {
  return [...mockPosts]
    .filter((p) => p.status === "published")
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 1,
    author: "Sarah Chen",
    isOwner: false,
    avatar: "SC",
    date: "Jun 11, 2026",
    body: "This is exactly the write-up I needed. I've been wrestling with the target group drain timeout causing 30-second blips during deploys. Setting `deregistration_delay` to match the ALB idle timeout finally clicked after reading your config.",
    likes: 14,
    liked: false,
    replies: [
      {
        id: 11,
        author: "Your Name",
        isOwner: true,
        avatar: "Y",
        date: "Jun 11, 2026",
        body: "Glad it helped! The drain timeout is the most common gotcha.",
        likes: 6,
        liked: false,
        replies: [],
      },
    ],
  },
  {
    id: 2,
    author: "Marcus Rivera",
    isOwner: false,
    avatar: "MR",
    date: "Jun 10, 2026",
    body: "Question: does this approach work with Fargate Spot capacity?",
    likes: 8,
    liked: false,
    replies: [
      {
        id: 21,
        author: "Your Name",
        isOwner: true,
        avatar: "Y",
        date: "Jun 10, 2026",
        body: "Great question — Spot interruptions send a 2-minute warning via ECS task-state events.",
        likes: 11,
        liked: false,
        replies: [],
      },
    ],
  },
];

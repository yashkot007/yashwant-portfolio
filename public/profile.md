# Yashwant Kotipalli

AI infrastructure engineer.

I'm Yashwant Kotipalli. I build GPU infrastructure at Oracle Cloud Infrastructure, with work spanning infrastructure health probes, multi-agent orchestration, and GPU kernel development and optimization. Previously, I owned distributed service modernization and production operations at Amazon ReCommerce.

Location: Seattle
Canonical website: [Yashwant Kotipalli](https://yashwantkotipalli.com/)
Last reviewed: 2026-10-07

Public formats: [Human portfolio](./) · [JSON](./profile.json) · [Reading guide](./llms.txt)

## Current role

Senior Member of Technical Staff at Oracle Cloud Infrastructure · 2025-08 — present

## Engineering work

### GPU infrastructure health.

Oracle OCI · Deployed

Designed and deployed long-running probing agents that detect and surface low-level GPU infrastructure issues.

- Engineering focus: Infrastructure observability and operational diagnosis beneath the application layer.
- Current related work: Developing a GPU-validation control plane; professional scope also includes GPU kernel development and optimization.

Evidence basis: Professional summary from the selected resume and LinkedIn profile.

### Orchestration for infrastructure transitions.

Oracle OCI · Shipped

Architected, shipped and managed a multi-agent orchestration harness for high-priority internal system transitions.

- Individual responsibility: Architecture, delivery and management of the harness.
- Lifecycle: The transition harness is shipped; GPU-validation control-plane work is described as in development.

Evidence basis: Professional summary from the selected resume.

### Service modernization with production ownership.

Amazon ReCommerce · Delivered and operated

Core service redesign and JDK 17 migrations, with a migration process for service and data-access layers across at least three core services.

- Operating responsibility: Production operations accompanied service delivery and migration work.
- Engineering practice: Peer review and intern mentoring alongside responsibility for distributed services.

Evidence basis: Professional summary from the selected resume and LinkedIn profile.

## Public code and engineering notes

### [A one-second boundary in cron validation.](https://github.com/openclaw/openclaw/pull/81731)

Merged contribution · Merged 2026-06-28

Corrected a validation edge case that could rebase a valid future cron slot. The merged patch adds regression coverage for exact-second schedules.

#### Preserving a valid future schedule.

OpenClaw's maintenance path checks whether a persisted future timestamp is a valid cron slot before deciding to repair it. The validator asked for the previous scheduled run at candidate + 1 ms.

Croner's second-granular schedules normalize that probe back to the candidate's second, so the lookup could return the preceding slot. A valid exact-second timestamp then appeared invalid. Existing guards protected nearby future runs; timestamps two or more intervals beyond the natural next slot could still be rebased unexpectedly.

The patch moves the probe to candidate + 1,000 ms, past the candidate's second and consistent with cursor steps elsewhere in the service. The added regression exercises maintenance with a daily 09:00 Pacific/Honolulu schedule and asserts that its valid future timestamp remains unchanged.

- [Implementation](https://github.com/openclaw/openclaw/blob/e99f254f1cd98b59b92003ad33a6b440c4d6e2da/src/cron/service/jobs.ts)
- [Regression](https://github.com/openclaw/openclaw/blob/e99f254f1cd98b59b92003ad33a6b440c4d6e2da/src/cron/service.jobs.test.ts)

AI-assisted drafting with Claude is disclosed in the pull request. Local reproduction and red-to-green testing are contributor-reported; the linked code and regression were inspected, rather than rerun, for this portfolio review.

Evidence basis: Merged public pull request and inspected implementation and regression. Inspected 2026-10-07.

### [Durable work, bounded authority.](https://github.com/yashkot007/accord)

Independent experimental prototype

An independent TypeScript agent workspace exploring durable task history, versioned updates, reviewed context and scoped permissions.

#### State that outlives a single conversation.

Accord records progress as append-only task history and checks the expected version before accepting new reports. Request receipts recover uncertain saves without turning an old receipt into new authority.

The public tests cover competing updates, changed retries, permission revocation and rollback. These make the authority and consistency boundaries inspectable alongside the implementation.

- [Workspace implementation](https://github.com/yashkot007/accord/blob/be27881d2892da0fd71fbd5abe4957444ad846ba/lib/workspace.ts)
- [Authority lifecycle tests](https://github.com/yashkot007/accord/blob/be27881d2892da0fd71fbd5abe4957444ad846ba/tests/authority-lifecycle.test.mjs)
- [Task history tests](https://github.com/yashkot007/accord/blob/be27881d2892da0fd71fbd5abe4957444ad846ba/tests/task-history.test.mjs)
- [Project scope](https://github.com/yashkot007/accord/blob/be27881d2892da0fd71fbd5abe4957444ad846ba/README.md)

Experimental implementation with a private deployment. Authentication belongs to a person's account; agent profiles are not independent security principals. The service does not wake or run external assistants. Source and tests were inspected, not executed, for this review.

Evidence basis: Inspected public source, tests and project documentation. Inspected 2026-10-07.

## Experience

### Oracle Cloud Infrastructure

Senior Member of Technical Staff · 2025-08 — present

GPU infrastructure health, transition orchestration and kernel development and optimization for AI workloads.

Completed contributions:

- Designed and deployed long-running probing agents that detect and surface low-level GPU infrastructure issues.
- Architected, shipped and managed a multi-agent orchestration harness for high-priority internal system transitions.

Ongoing work:

- Developing a GPU-validation control plane.

Professional scope:

- GPU kernel development and performance optimization for AI workloads.

### Amazon

Software Development Engineer · 2022-07 — 2025-08

Distributed services, JDK 17 modernization and production operations in ReCommerce.

Contributions:

- Core service redesign and JDK 17 migrations in ReCommerce.
- Migration planning for service and data-access layers across at least three core services.
- Production operations, peer review and intern mentoring.

### Deloitte US

Machine Learning Engineer · 2021-07 — 2022-06

Application engineering for Tennessee's eligibility and benefits services.

Contributions:

- Application delivery and integration across multiple access channels for Tennessee public-service systems.

### Georgia Institute of Technology

AI Research Scholar (Computer Vision) · 2019-06 — 2019-11

Visual odometry and SLAM benchmark analysis at the Intelligent Vision and Automation Lab.

Contributions:

- Benchmark analysis for visual odometry and SLAM algorithms.

## Technical practice

### Languages

C++ · Rust · Python · Java

### GPU systems

GPU kernels · CUDA

### Systems practice

Distributed systems · GPU infrastructure health · Infrastructure orchestration · Production operations

## Current focus

Inference performance and kernel engineering.

Inference performance and deeper kernel engineering are active areas of study and career focus, building on professional GPU infrastructure work.

- Inference: How do prompt length, output length and concurrency change time to first token, inter-token latency and completed-request throughput?
- Kernels: How can profiler evidence guide memory, compute and launch optimizations without violating numerical correctness across supported shapes and dtypes?
- Infrastructure: What evidence supports a GPU health diagnosis, and how should orchestration respond to stale signals or partial failure?

Reading and study: [Fanout](https://fanout.sh/) · [Intuitive AI Academy](https://www.intuitiveai.academy/)

## Background

I'm based in Seattle. My work has moved from computer-vision benchmarking at Georgia Tech to production services at Amazon and GPU infrastructure at Oracle. The common thread is making system behavior understandable and owning the work through operation.

## Education

- M.S. Information Systems · Northeastern University · 2022
- B.Tech. Computer Science Engineering · Bennett University · 2020

## Contact

For technical conversations about AI infrastructure, GPU systems and production engineering.

- [GitHub](https://github.com/yashkot007)
- [LinkedIn](https://www.linkedin.com/in/yashwant-kotipalli)
- [X](https://x.com/Yshwntktpl)
- [Email](mailto:yashwant7kotipalli@gmail.com)

## Source basis

- Owner-provided resume; selected timeline · professional\_self\_report
- [LinkedIn professional profile](https://www.linkedin.com/in/yashwant-kotipalli) · professional\_self\_report
- Public implementation, regression and project documentation linked in each public work item · inspected\_public\_code

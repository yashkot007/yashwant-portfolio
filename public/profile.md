# Yashwant Kotipalli

AI Infrastructure

I build AI infrastructure for GPU fleets at Oracle Cloud Infrastructure. My work spans fleet health, diagnostic workflows, repair orchestration and communication across substrate and overlay networks. Previously, I owned distributed services at Amazon ReCommerce. My current focus is inference optimization and scaling: scheduling, KV-cache behavior and latency–throughput trade-offs.

Location: Seattle
Canonical website: [Yashwant Kotipalli](https://yashwantkotipalli.com/)
Last reviewed: 2026-10-27

Public formats: [Human portfolio](./) · [JSON](./profile.json) · [Reading guide](./llms.txt)

## Current role

Core Infrastructure Engineer at Oracle Cloud Infrastructure · 2025-08 — present

## GPU Fleet Management and Performance

### GPU fleet health and repair.

Oracle OCI · Production services

Engineered and maintained GPU fleet health and repair services, with diagnostic workflows that surface potential hardware and infrastructure faults.

- Operating objectives: 97.5% GPU availability SLO and a ≤24-hour P90 repair-time target.
- Hardware scope: H100, H200 and B200 GPUs, and GB200/GB300 platforms.
- On-call responsibility: Coordinated repair escalations and customer handoffs with data center operations and hardware teams.
- Diagnostic workflows: GPU diagnostic recipes, fault classifications and workflows using host attributes and repair history; long-running probes surface low-level infrastructure issues.

Evidence basis: Professional summary from the October 2026 résumé and current LinkedIn profile. SLO and repair-time values are operating objectives, not measured outcomes.

### Repair-case transition orchestration.

Oracle OCI · Shipped

Shipped a multi-agent orchestration harness for GPU repair-case transitions, supporting host recovery workflows.

- My contribution: Developed and shipped the repair-transition harness.
- Workflow scope: GPU repair-case transitions and host recovery workflows.
- In development: A GPU-validation control plane and hardware digital twin for validation workflows and hardware onboarding.

Evidence basis: Professional summary from the October 2026 résumé and current LinkedIn profile. The repair-transition harness is shipped; the validation control plane and hardware digital twin remain in development.

### Compact telemetry. Detectable reporting gaps.

Oracle OCI · Implemented

Refactored GPU fleet telemetry collection to retain compact host/device records, limit memory overhead and detect interrupted SmartNIC reporting.

- Data representation: Compact host and device records in the fleet telemetry collection path.
- Resource constraint: Limit collection memory overhead while retaining the records needed for fleet monitoring.
- Signal integrity: Missing-data alerts identify interrupted reporting from SmartNICs.

Evidence basis: Professional self-report in the latest inference-engineering résumé; no measured memory reduction is asserted.

## Inference Optimization and Scaling

Current technical focus

I’m deepening my work on the serving path: request scheduling, KV-cache capacity and GPU execution across prefill and decode. This is my next specialization, grounded in production GPU infrastructure and distributed-service ownership.

- Scheduling: Continuous batching, queueing and workload shape: prompt lengths, output lengths, request arrivals and concurrency.
- Memory: KV-cache capacity, paged allocation and the trade-offs around prefill/decode disaggregation.
- Measurement: Time to first token, inter-token latency, output-token throughput and p95/p99 latency under a declared workload and latency constraints.
- Profiling: System traces, CPU/GPU overlap and bottleneck attribution; numerical and quality checks when evaluating FP8/INT8 or kernel-level changes.

Technical references: [vLLM benchmarking](https://docs.vllm.ai/en/latest/cli/bench/serve/) · [NVIDIA GenAI-Perf](https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/perf_benchmark/genai-perf-README.html) · [Fanout](https://fanout.sh/) · [Intuitive AI Academy](https://www.intuitiveai.academy/)

## Experience

### Oracle Cloud Infrastructure

Core Infrastructure Engineer · 2025-08 — present

GPU fleet health, fault diagnosis, repair orchestration and communication across substrate and overlay networks.

Current responsibilities:

- Define GPU diagnostic recipes and fault classifications, and build workflows that use GPU-host attributes and repair history to surface potential infrastructure faults.
- Develop and troubleshoot cross-platform communication across substrate and overlay networks, including workflows close to GPU hardware.

Delivered work:

- Engineered and maintained GPU fleet health and repair services supporting H100, H200 and B200 GPUs, and GB200/GB300 platforms.
- Shipped a multi-agent orchestration harness for GPU repair-case transitions.
- Refactored telemetry collection to retain compact host/device records, limit memory overhead and detect interrupted SmartNIC reporting.
- Coordinated repair escalations and customer handoffs with data center operations and hardware teams during on-call.
- Designed and deployed long-running GPU infrastructure health probes.

Developed systems:

- Developed a Slack-integrated agent for GPU on-call and security queues, designed around tag-triggered triage workflows.

In development:

- Developing a GPU-validation control plane and hardware digital twin to automate validation and hardware onboarding across GPU configurations.

Operating objectives:

- GPU availability SLO: 97.5%
- P90 repair-time target: ≤24 hours

### Amazon

Software Development Engineer · 2022-07 — 2025-08

Distributed-service delivery, systems redesign and production operations in Amazon ReCommerce.

Contributions:

- Owned 11 engineering projects and contributed to three new revenue channels.
- Handled approximately 450 operational tickets, including high-severity incidents, with LLM-assisted triage and diagnostic workflows evolving from 2024 through 2025.
- Contributed approximately 450 peer code reviews and mentored interns through full project delivery and conversion to full-time roles.
- Delivered core-service modernization and JDK 17 migrations, including a migration process for service and data-access layers across at least three core services.

### Deloitte US

Machine Learning Engineer · 2021-07 — 2022-06

End-to-end ML applications, an ICR backend, CI/CD and data-pipeline optimization for eligibility and benefits services.

Contributions:

- Delivered ML applications supporting Tennessee Department of Human Services workflows serving more than two million individuals across seven access channels.
- Developed an ICR ML backend and CI/CD pipelines, and optimized data pipelines and database queries.

### Georgia Institute of Technology

AI Research Scholar (Computer Vision) · 2019-06 — 2019-11

Visual odometry and SLAM benchmark analysis at the Intelligent Vision and Automation Lab.

Contributions:

- Analyzed benchmark behavior for visual odometry and SLAM algorithms.
- Investigated autonomous navigation with Turtlebot in simulation and physical trials.

## Technical practice

Inference frameworks, performance methods and the infrastructure stack behind my current direction.

### Inference stack

PyTorch · vLLM · TensorRT-LLM

### Inference mechanisms

Continuous batching · KV-cache management · PagedAttention · FP8/INT8 quantization · Speculative decoding · Prefill/decode · Disaggregated inference

### Performance & observability

Model benchmarking · GPU profiling · Nsight Systems · GPU kernels · Prometheus · Grafana · OpenTelemetry

### Cloud & infrastructure

Kubernetes · OCI · AWS · Docker · Terraform · CI/CD

### Languages & systems

Python · Java · Rust · C++ · Linux · Distributed systems · Substrate/overlay networking

### Fleet operations

GPU fleet health · Diagnostic & repair orchestration · Workflow state management · GPU fault diagnosis · Diagnostic recipes & fault classification · Infrastructure health probes

## Public code and engineering notes

### [Persistence, concurrency and stale frame state.](https://github.com/garrytan/gstack/pull/1391)

Shipped in v1.30.0.0

Contributed three browser-runtime reliability fixes covering console-log persistence, concurrent state-file writes and stale iframe references. Credited in the release changelog.

#### Three fixes at runtime state boundaries.

Console flushing referenced a tracker that had never been declared. Initializing the missing cursor restores periodic console-log persistence; a source-level regression guard checks that referenced flush trackers have matching declarations.

State-file updates used atomic rename but shared one temporary filename. Per-process temporary paths with a random suffix prevent writers from colliding on that intermediate file. Final-state replacement retains last-writer-wins behavior.

Detached-iframe recovery cleared the active frame but retained its reference map. Clearing those references at the same boundary aligns recovery with main-frame navigation. Logic tests cover detached, attached and no-frame states, plus navigation symmetry.

- [Release credit](https://github.com/garrytan/gstack/blob/00f966b3ec97b0deb7562bd92f51a86187032224/CHANGELOG.md)
- [Persistence and state writes](https://github.com/garrytan/gstack/blob/00f966b3ec97b0deb7562bd92f51a86187032224/browse/src/server.ts)
- [Frame-state cleanup](https://github.com/garrytan/gstack/blob/00f966b3ec97b0deb7562bd92f51a86187032224/browse/src/tab-session.ts)
- [Flush-tracker regression](https://github.com/garrytan/gstack/blob/00f966b3ec97b0deb7562bd92f51a86187032224/browse/test/server-flush-trackers.test.ts)
- [State-file regression](https://github.com/garrytan/gstack/blob/00f966b3ec97b0deb7562bd92f51a86187032224/browse/test/server-tmp-state-path.test.ts)
- [Frame-detachment regressions](https://github.com/garrytan/gstack/blob/00f966b3ec97b0deb7562bd92f51a86187032224/browse/test/tab-session-frame-detach.test.ts)

Original contribution PRs #1309, #1310 and #1311 were closed after the fixes shipped through release PR #1391. Their descriptions disclose AI-assisted development and contributor-reported reproduction and test runs. Release source and regression tests were inspected, not executed, for this review.

Evidence basis: Original authored PRs, maintainer shipping confirmations, merged release PR, and inspected release implementation, regression tests and changelog. Inspected 2026-10-27.

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

## Background

I’m based in Seattle. My work has moved from computer-vision benchmarking at Georgia Tech and ML applications at Deloitte to distributed services at Amazon and GPU infrastructure at Oracle. I’m carrying that production foundation into inference serving and performance engineering.

## Education

- M.S. Information Systems · Northeastern University · 2022
- B.Tech. Computer Science Engineering · Bennett University · 2020

## Contact

Interested in mid-level and senior engineering roles in inference serving, GPU performance and AI infrastructure.

- [GitHub](https://github.com/yashkot007)
- [LinkedIn](https://www.linkedin.com/in/yashwant-kotipalli)
- [X](https://x.com/Yshwntktpl)
- [Email](mailto:yashwant7kotipalli@gmail.com)

## Source basis

- Owner-provided inference-engineering résumé, October 14, 2026 · professional\_self\_report
- [LinkedIn professional profile, reviewed October 27, 2026](https://www.linkedin.com/in/yashwant-kotipalli) · professional\_self\_report
- Owner-confirmed C++ and GPU-kernel skills · owner\_confirmation
- Public implementation, regression and project documentation linked in each public work item; inspection dates are recorded per item · inspected\_public\_code

## Evidence interpretation

Inference tools and mechanisms are listed in the October 2026 résumé. C++ and GPU kernels were additionally confirmed by the owner; the current LinkedIn profile also identifies C++ and Rust in the hands-on stack and describes the diagnostic and networking responsibilities. This inventory does not establish production inference deployment, kernel implementations or measured serving results.

Current technical focus and résumé-listed skills. No public inference-serving benchmark, profiling report or kernel implementation is available as of this review; no serving speedup or production serving ownership is claimed.

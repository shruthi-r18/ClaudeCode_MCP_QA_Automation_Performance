# ClaudeCode_MCP_QA_Automation_Performance
End-to-end API performance testing —  using Apache JMeter, the JMeter MCP Server, and Claude Code

A demonstration project showing how to use Claude Code and Apache JMeter 
together to generate, run, and report on performance tests for a REST API.

All prompts used to generate the code and tests are included in this repository.

---

## 📺 Watch the Video

[Link to YouTube Video]

---

## 🔎 What This Project Covers

- Building a custom JMeter MCP Server that connects Claude Code to Apache JMeter
- Setting up a Spring Boot REST API as the application under test
- Using Claude Code to generate six types of performance tests:
  - Smoke Test — basic sanity check under minimal load
  - Load Test — normal expected traffic
  - Spike Test — sudden burst of users
  - Stress Test — beyond normal operating capacity
  - Endurance Test — sustained load over time
  - Breakpoint Test — finding the system's breaking point
- Running all six tests manually from the command line
- Generating a single HTML dashboard report for stakeholders

---

## 📁 Project Structure
```
project-root/
│
├── jmeter-mcp-server/          # Custom MCP Server
│   ├── src/
│   │   └── index.ts            # Entry point — 11 tools registered here
│   ├── build/
│   │   └── index.js            # Compiled output — what actually runs
│   ├── package.json            # Dependencies
│   └── tsconfig.json           # TypeScript configuration
│
├── product-api/                # Spring Boot REST API
│   ├── src/
│   └── build/libs/
│       └── product-api-1.0.0.jar
│
├── performance-tests/          # All JMeter tests and results
│   ├── test-plans/
│   │   ├── smoke/
│   │   │   └── smoke-test.jmx
│   │   ├── load/
│   │   │   └── load-test.jmx
│   │   ├── spike/
│   │   │   └── spike-test.jmx
│   │   ├── stress/
│   │   │   └── stress-test.jmx
│   │   ├── endurance/
│   │   │   └── endurance-test.jmx
│   │   └── breakpoint/
│   │       └── breakpoint-test.jmx
│   │
│   └── results/
│       ├── smoke-report/
│       ├── load-report/
│       ├── spike-report/
│       ├── stress-report/
│       ├── endurance-report/
│       └── breakpoint-report/
│
└── prompts/                    # All Claude Code prompts used in the video
    ├── mcp-server-prompt.md
    ├── api-prompt.md
    ├── smoke-test-prompt.md
    ├── load-test-prompt.md
    ├── spike-test-prompt.md
    ├── stress-test-prompt.md
    ├── endurance-test-prompt.md
    ├── breakpoint-test-prompt.md
    └── dashboard-report-prompt.md
```

---

## 🔗 API Endpoints Tested

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/products | Retrieve all products |
| GET | /api/inventory/{productId} | Check inventory for a product |
| POST | /api/orders | Create a new order |
| POST | /api/products/price-update | Update a product price |

---

## 📊 Test Configuration

| Test | Users | Ramp-Up | Duration | Purpose |
|---|---|---|---|---|
| Smoke | 5 | 5 sec | 60 sec | Basic sanity check |
| Load | 20 | 20 sec | 120 sec | Normal traffic |
| Spike | 50 | 5 sec | 60 sec | Sudden burst |
| Stress | 40 | 30 sec | 120 sec | Beyond capacity |
| Endurance | 15 | 15 sec | 300 sec | Sustained stability |
| Breakpoint | 60 | 60 sec | 180 sec | Find breaking point |

---


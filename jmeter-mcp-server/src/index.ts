import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { parseString, Builder } from "xml2js";
import { execSync } from "child_process";
import { glob } from "glob";

// ─────────────────────────────────────────────
// Resolve JMETER_HOME
// ─────────────────────────────────────────────
const JMETER_HOME = process.env.JMETER_HOME || "C:\\apache-jmeter-5.6.3";
const JMETER_BIN = path.join(JMETER_HOME, "bin", process.platform === "win32" ? "jmeter.bat" : "jmeter");

// ═════════════════════════════════════════════
// CREATE MCP SERVER
// ═════════════════════════════════════════════
const server = new McpServer({
  name: "jmeter-mcp-server",
  version: "1.0.0",
});


// ═════════════════════════════════════════════
// START THE SERVER
// ═════════════════════════════════════════════
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("JMeter MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});


// ─────────────────────────────────────────────
// TOOL 1: create_test_plan
// Creates a new .jmx file with a TestPlan
// and a default ThreadGroup
// ─────────────────────────────────────────────
server.tool(
  "create_test_plan",
  "Create a new JMeter test plan with a default thread group",
  {
    name: z.string().describe("Name of the test plan"),
    outputfile: z.string().describe("Path where to save the .jmx file"),
    targethost: z.string().describe("Target host for HTTP requests"),
    targetport: z.number().optional().default(80).describe("Target port (default: 80)"),
    numthreads: z.number().optional().default(1).describe("Number of threads/users"),
  },
  async ({ name, outputfile, targethost, targetport, numthreads }) => {
    const plan = {
      jmeterTestPlan: {
        $: { version: "1.2", properties: "5.0", jmeter: "5.6.3" },
        hashTree: [
          {
            TestPlan: [
              {
                $: {
                  guiclass: "TestPlanGui",
                  testclass: "TestPlan",
                  testname: name,
                  enabled: "true",
                },
                stringProp: [
                  { $: { name: "TestPlan.comments" }, _: "" },
                  { $: { name: "TestPlan.user_define_classpath" }, _: "" },
                ],
                boolProp: [
                  { $: { name: "TestPlan.functional_mode" }, _: "false" },
                  { $: { name: "TestPlan.tearDown_on_shutdown" }, _: "true" },
                  { $: { name: "TestPlan.serialize_threadgroups" }, _: "false" },
                ],
                elementProp: [
                  {
                    $: {
                      name: "TestPlan.user_defined_variables",
                      elementType: "Arguments",
                      guiclass: "ArgumentsPanel",
                      testclass: "Arguments",
                      testname: "User Defined Variables",
                      enabled: "true",
                    },
                    collectionProp: [{ $: { name: "Arguments.arguments" } }],
                  },
                ],
              },
            ],
            hashTree: [
              {
                ThreadGroup: [
                  {
                    $: {
                      guiclass: "ThreadGroupGui",
                      testclass: "ThreadGroup",
                      testname: "Thread Group",
                      enabled: "true",
                    },
                    stringProp: [
                      { $: { name: "ThreadGroup.on_sample_error" }, _: "continue" },
                      { $: { name: "ThreadGroup.num_threads" }, _: String(numthreads) },
                      { $: { name: "ThreadGroup.ramp_time" }, _: "1" },
                      { $: { name: "ThreadGroup.duration" }, _: "" },
                      { $: { name: "ThreadGroup.delay" }, _: "" },
                    ],
                    boolProp: [
                      { $: { name: "ThreadGroup.scheduler" }, _: "false" },
                      { $: { name: "ThreadGroup.same_user_on_next_iteration" }, _: "true" },
                    ],
                    elementProp: [
                      {
                        $: {
                          name: "ThreadGroup.main_controller",
                          elementType: "LoopController",
                          guiclass: "LoopControlPanel",
                          testclass: "LoopController",
                          testname: "Loop Controller",
                          enabled: "true",
                        },
                        boolProp: [
                          { $: { name: "LoopController.continue_forever" }, _: "false" },
                        ],
                        stringProp: [
                          { $: { name: "LoopController.loops" }, _: "1" },
                        ],
                      },
                    ],
                  },
                ],
                ConfigTestElement: [
                  {
                    $: {
                      guiclass: "HttpDefaultsGui",
                      testclass: "ConfigTestElement",
                      testname: "HTTP Request Defaults",
                      enabled: "true",
                    },
                    elementProp: [
                      {
                        $: {
                          name: "HTTPsampler.Arguments",
                          elementType: "Arguments",
                          guiclass: "HTTPArgumentsPanel",
                          testclass: "Arguments",
                          testname: "User Defined Variables",
                          enabled: "true",
                        },
                        collectionProp: [{ $: { name: "Arguments.arguments" } }],
                      },
                    ],
                    stringProp: [
                      { $: { name: "HTTPSampler.domain" }, _: targethost },
                      { $: { name: "HTTPSampler.port" }, _: String(targetport) },
                      { $: { name: "HTTPSampler.protocol" }, _: "http" },
                    ],
                  },
                ],
                hashTree: [{}],
              },
            ],
          },
        ],
      },
    };

    const dir = path.dirname(outputfile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    writeTestPlan(outputfile, plan);

    return {
      content: [
        {
          type: "text" as const,
          text: `Test plan "${name}" created successfully at: ${outputfile}\nTarget: ${targethost}:${targetport}\nThreads: ${numthreads}`,
        },
      ],
    };
  }
);

// ─────────────────────────────────────────────
// TOOL 2: list_tests
// Lists all .jmx files in a directory
// ─────────────────────────────────────────────
server.tool(
  "list_tests",
  "List all JMeter test files (.jmx) in a directory",
  {
    directory: z.string().describe("Directory to search for .jmx files"),
  },
  async ({ directory }) => {
    const pattern = path.join(directory, "**/*.jmx").replace(/\\/g, "/");
    const files = await glob(pattern);

    if (files.length === 0) {
      return {
        content: [{ type: "text" as const, text: `No .jmx files found in: ${directory}` }],
      };
    }

    const list = files.map((f, i) => `${i + 1}. ${f}`).join("\n");
    return {
      content: [{ type: "text" as const, text: `Found ${files.length} test file(s):\n${list}` }],
    };
  }
);

// ─────────────────────────────────────────────
// TOOL 3: read_test_file
// Parses and displays structure of a .jmx file
// ─────────────────────────────────────────────
server.tool(
  "read_test_file",
  "Read and parse a JMeter test file to show its structure",
  {
    testfile: z.string().describe("Path to the .jmx file"),
  },
  async ({ testfile }) => {
    const plan = await readTestPlan(testfile);
    return {
      content: [
        { type: "text" as const, text: JSON.stringify(plan, null, 2) },
      ],
    };
  }
);

// ─────────────────────────────────────────────
// TOOL 4: add_http_sampler
// Adds an HTTP Request sampler to the test plan
// ─────────────────────────────────────────────
server.tool(
  "add_http_sampler",
  "Add an HTTP request sampler to an existing test plan",
  {
    testfile: z.string().describe("Path to the .jmx file"),
    name: z.string().describe("Name for the HTTP sampler"),
    path: z.string().describe("URL path (e.g., /api/users)"),
    method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]).describe("HTTP method"),
    domain: z.string().optional().describe("Target domain (optional, inherits from defaults)"),
    port: z.number().optional().describe("Target port (optional)"),
    protocol: z.enum(["http", "https"]).optional().default("http").describe("Protocol"),
    contentType: z.string().optional().describe("Content-Type header value"),
    body: z.string().optional().describe("Request body for POST/PUT/PATCH"),
    headers: z
      .array(z.object({ name: z.string(), value: z.string() }))
      .optional()
      .describe("HTTP headers to include"),
    followRedirects: z.boolean().optional().default(true).describe("Follow redirects"),
    useKeepalive: z.boolean().optional().default(true).describe("Use keep-alive"),
  },
  async ({ testfile, name, path: urlPath, method, domain, port, protocol, contentType, body, headers, followRedirects, useKeepalive }) => {
    const plan = await readTestPlan(testfile);
    const threadHashTree = getThreadGroupHashTree(plan);
    const inner = threadHashTree[0];

    // Build the HTTPSampler element
    const sampler: any = {
      $: {
        guiclass: "HttpTestSampleGui",
        testclass: "HTTPSamplerProxy",
        testname: name,
        enabled: "true",
      },
      elementProp: [
        {
          $: {
            name: "HTTPsampler.Arguments",
            elementType: "Arguments",
            guiclass: "HTTPArgumentsPanel",
            testclass: "Arguments",
            enabled: "true",
          },
          collectionProp: [{ $: { name: "Arguments.arguments" } }],
        },
      ],
      stringProp: [
        { $: { name: "HTTPSampler.method" }, _: method },
        { $: { name: "HTTPSampler.path" }, _: urlPath },
        { $: { name: "HTTPSampler.protocol" }, _: protocol || "" },
        ...(domain ? [{ $: { name: "HTTPSampler.domain" }, _: domain }] : []),
        ...(port ? [{ $: { name: "HTTPSampler.port" }, _: String(port) }] : []),
      ],
      boolProp: [
        { $: { name: "HTTPSampler.follow_redirects" }, _: String(followRedirects) },
        { $: { name: "HTTPSampler.use_keepalive" }, _: String(useKeepalive) },
        { $: { name: "HTTPSampler.postBodyRaw" }, _: body ? "true" : "false" },
      ],
    };

    // Add body if provided
    if (body) {
      sampler.elementProp[0].collectionProp[0].elementProp = [
        {
          $: { name: "", elementType: "HTTPArgument" },
          boolProp: [{ $: { name: "HTTPArgument.always_encode" }, _: "false" }],
          stringProp: [
            { $: { name: "Argument.value" }, _: body },
            { $: { name: "Argument.metadata" }, _: "=" },
          ],
        },
      ];
    }

    // Add sampler to the plan
    if (!inner.HTTPSamplerProxy) inner.HTTPSamplerProxy = [];
    inner.HTTPSamplerProxy.push(sampler);

    // Add Header Manager if headers or contentType provided
    const allHeaders: Array<{ name: string; value: string }> = [];
    if (contentType) allHeaders.push({ name: "Content-Type", value: contentType });
    if (headers) allHeaders.push(...headers);

    if (allHeaders.length > 0) {
      const headerManager: any = {
        $: {
          guiclass: "HeaderPanel",
          testclass: "HeaderManager",
          testname: `${name} - Headers`,
          enabled: "true",
        },
        collectionProp: [
          {
            $: { name: "HeaderManager.headers" },
            elementProp: allHeaders.map((h) => ({
              $: { name: "", elementType: "Header" },
              stringProp: [
                { $: { name: "Header.name" }, _: h.name },
                { $: { name: "Header.value" }, _: h.value },
              ],
            })),
          },
        ],
      };

      if (!inner.HeaderManager) inner.HeaderManager = [];
      inner.HeaderManager.push(headerManager);
    }

    // Ensure hashTree entries exist for the new elements
    if (!inner.hashTree) inner.hashTree = [];
    inner.hashTree.push({});
    if (allHeaders.length > 0) inner.hashTree.push({});

    writeTestPlan(testfile, plan);

    return {
      content: [
        {
          type: "text" as const,
          text: `HTTP sampler "${name}" added: ${method} ${urlPath}${body ? " (with body)" : ""}${allHeaders.length > 0 ? ` (${allHeaders.length} header(s))` : ""}`,
        },
      ],
    };
  }
);

// ─────────────────────────────────────────────
// TOOL 5: add_assertion
// Adds response assertions to a sampler
// ─────────────────────────────────────────────
server.tool(
  "add_assertion",
  "Add an assertion to validate responses",
  {
    testfile: z.string().describe("Path to the .jmx file"),
    samplerName: z.string().describe("Name of the HTTP sampler to add assertion to"),
    type: z.enum(["response_code", "duration", "contains", "matches"]).describe("Assertion type"),
    value: z.string().describe("Assertion value (e.g., '200', '5000', 'success')"),
    name: z.string().optional().describe("Optional name for the assertion"),
  },
  async ({ testfile, samplerName, type, value, name: assertionName }) => {
    const plan = await readTestPlan(testfile);
    const threadHashTree = getThreadGroupHashTree(plan);
    const inner = threadHashTree[0];

    const displayName = assertionName || `${type} assertion: ${value}`;

    if (type === "duration") {
      // Duration Assertion
      const assertion = {
        $: {
          guiclass: "DurationAssertionGui",
          testclass: "DurationAssertion",
          testname: displayName,
          enabled: "true",
        },
        stringProp: [
          { $: { name: "DurationAssertion.duration" }, _: value },
        ],
      };

      if (!inner.DurationAssertion) inner.DurationAssertion = [];
      inner.DurationAssertion.push(assertion);
    } else {
      // Response Assertion (response_code, contains, matches)
      let testType = "2"; // contains (substring)
      let testField = "Assertion.response_data";

      if (type === "response_code") {
        testField = "Assertion.response_code";
        testType = "8"; // equals
      } else if (type === "matches") {
        testType = "1"; // regex match
      }

      const assertion = {
        $: {
          guiclass: "AssertionGui",
          testclass: "ResponseAssertion",
          testname: displayName,
          enabled: "true",
        },
        collectionProp: [
          {
            $: { name: "Asserion.test_strings" },
            stringProp: [{ $: { name: "0" }, _: value }],
          },
        ],
        stringProp: [
          { $: { name: "Assertion.test_field" }, _: testField },
          { $: { name: "Assertion.test_type" }, _: testType },
          { $: { name: "Assertion.custom_message" }, _: "" },
        ],
      };

      if (!inner.ResponseAssertion) inner.ResponseAssertion = [];
      inner.ResponseAssertion.push(assertion);
    }

    if (!inner.hashTree) inner.hashTree = [];
    inner.hashTree.push({});

    writeTestPlan(testfile, plan);

    return {
      content: [
        {
          type: "text" as const,
          text: `Assertion added to "${samplerName}": ${type} = ${value}`,
        },
      ],
    };
  }
);

// ─────────────────────────────────────────────
// TOOL 6: add_timer
// Adds think time / delays between requests
// ─────────────────────────────────────────────
server.tool(
  "add_timer",
  "Add a timer for think time / delays between requests",
  {
    testfile: z.string().describe("Path to the .jmx file"),
    type: z.enum(["constant", "uniform_random", "gaussian_random"]).describe("Timer type"),
    delay: z.number().describe("Base delay in milliseconds"),
    range: z.number().optional().describe("Random range in ms (for random timers)"),
    name: z.string().optional().describe("Optional name for the timer"),
  },
  async ({ testfile, type, delay, range, name: timerName }) => {
    const plan = await readTestPlan(testfile);
    const threadHashTree = getThreadGroupHashTree(plan);
    const inner = threadHashTree[0];

    const displayName = timerName || `${type} timer (${delay}ms)`;

    if (type === "constant") {
      const timer = {
        $: {
          guiclass: "ConstantTimerGui",
          testclass: "ConstantTimer",
          testname: displayName,
          enabled: "true",
        },
        stringProp: [
          { $: { name: "ConstantTimer.delay" }, _: String(delay) },
        ],
      };
      if (!inner.ConstantTimer) inner.ConstantTimer = [];
      inner.ConstantTimer.push(timer);
    } else if (type === "uniform_random") {
      const timer = {
        $: {
          guiclass: "UniformRandomTimerGui",
          testclass: "UniformRandomTimer",
          testname: displayName,
          enabled: "true",
        },
        stringProp: [
          { $: { name: "ConstantTimer.delay" }, _: String(delay) },
          { $: { name: "RandomTimer.range" }, _: String(range || 100) },
        ],
      };
      if (!inner.UniformRandomTimer) inner.UniformRandomTimer = [];
      inner.UniformRandomTimer.push(timer);
    } else {
      const timer = {
        $: {
          guiclass: "GaussianRandomTimerGui",
          testclass: "GaussianRandomTimer",
          testname: displayName,
          enabled: "true",
        },
        stringProp: [
          { $: { name: "ConstantTimer.delay" }, _: String(delay) },
          { $: { name: "RandomTimer.range" }, _: String(range || 100) },
        ],
      };
      if (!inner.GaussianRandomTimer) inner.GaussianRandomTimer = [];
      inner.GaussianRandomTimer.push(timer);
    }

    if (!inner.hashTree) inner.hashTree = [];
    inner.hashTree.push({});

    writeTestPlan(testfile, plan);

    return {
      content: [
        {
          type: "text" as const,
          text: `Timer added: ${displayName}`,
        },
      ],
    };
  }
);

// ─────────────────────────────────────────────
// TOOL 7: add_csv_data_config
// Adds CSV Data Set Config for parameterized testing
// ─────────────────────────────────────────────
server.tool(
  "add_csv_data_config",
  "Add a CSV Data Set Config for data-driven testing",
  {
    testfile: z.string().describe("Path to the .jmx file"),
    filename: z.string().describe("Path to the CSV file"),
    variableNames: z.string().describe("Comma-separated variable names (e.g., 'username,password')"),
    delimiter: z.string().optional().default(",").describe("Field delimiter"),
    ignoreFirstLine: z.boolean().optional().default(false).describe("Skip header row"),
    recycle: z.boolean().optional().default(true).describe("Recycle data at end"),
    stopThread: z.boolean().optional().default(false).describe("Stop thread at end of file"),
    sharingMode: z
      .enum(["shareMode.all", "shareMode.group", "shareMode.thread"])
      .optional()
      .default("shareMode.all")
      .describe("How data is shared between threads"),
    name: z.string().optional().describe("Optional name"),
  },
  async ({ testfile, filename, variableNames, delimiter, ignoreFirstLine, recycle, stopThread, sharingMode, name: csvName }) => {
    const plan = await readTestPlan(testfile);
    const threadHashTree = getThreadGroupHashTree(plan);
    const inner = threadHashTree[0];

    const displayName = csvName || `CSV Data: ${path.basename(filename)}`;

    const csvConfig = {
      $: {
        guiclass: "TestBeanGUI",
        testclass: "CSVDataSet",
        testname: displayName,
        enabled: "true",
      },
      stringProp: [
        { $: { name: "filename" }, _: filename },
        { $: { name: "variableNames" }, _: variableNames },
        { $: { name: "delimiter" }, _: delimiter },
        { $: { name: "fileEncoding" }, _: "UTF-8" },
        { $: { name: "shareMode" }, _: sharingMode },
      ],
      boolProp: [
        { $: { name: "ignoreFirstLine" }, _: String(ignoreFirstLine) },
        { $: { name: "recycle" }, _: String(recycle) },
        { $: { name: "stopThread" }, _: String(stopThread) },
        { $: { name: "quotedData" }, _: "false" },
      ],
    };

    if (!inner.CSVDataSet) inner.CSVDataSet = [];
    inner.CSVDataSet.push(csvConfig);

    if (!inner.hashTree) inner.hashTree = [];
    inner.hashTree.push({});

    writeTestPlan(testfile, plan);

    return {
      content: [
        {
          type: "text" as const,
          text: `CSV Data Set added: ${displayName}\nFile: ${filename}\nVariables: ${variableNames}`,
        },
      ],
    };
  }
);

// ─────────────────────────────────────────────
// TOOL 8: update_thread_group
// Modifies thread group settings
// ─────────────────────────────────────────────
server.tool(
  "update_thread_group",
  "Update thread group settings (threads, ramp-up, loops, duration)",
  {
    testfile: z.string().describe("Path to the .jmx file"),
    numThreads: z.number().optional().describe("Number of threads (virtual users)"),
    rampTime: z.number().optional().describe("Ramp-up time in seconds"),
    loops: z.number().optional().describe("Loop count (-1 for infinite)"),
    duration: z.number().optional().describe("Test duration in seconds"),
    delay: z.number().optional().describe("Startup delay in seconds"),
    scheduler: z.boolean().optional().describe("Enable/disable scheduler"),
  },
  async ({ testfile, numThreads, rampTime, loops, duration, delay, scheduler }) => {
    const plan = await readTestPlan(testfile);
    const outerHashTree = plan.jmeterTestPlan.hashTree[0].hashTree[0];
    const threadGroup = outerHashTree.ThreadGroup[0];

    const updates: string[] = [];

    // Helper to update a stringProp by name
    function setStringProp(propName: string, value: string) {
      const props = threadGroup.stringProp as any[];
      const prop = props.find((p: any) => p.$.name === propName);
      if (prop) {
        prop._ = value;
      } else {
        props.push({ $: { name: propName }, _: value });
      }
    }

    function setBoolProp(propName: string, value: string) {
      if (!threadGroup.boolProp) threadGroup.boolProp = [];
      const props = threadGroup.boolProp as any[];
      const prop = props.find((p: any) => p.$.name === propName);
      if (prop) {
        prop._ = value;
      } else {
        props.push({ $: { name: propName }, _: value });
      }
    }

    if (numThreads !== undefined) {
      setStringProp("ThreadGroup.num_threads", String(numThreads));
      updates.push(`threads=${numThreads}`);
    }
    if (rampTime !== undefined) {
      setStringProp("ThreadGroup.ramp_time", String(rampTime));
      updates.push(`ramp-up=${rampTime}s`);
    }
    if (loops !== undefined) {
      const loopCtrl = threadGroup.elementProp[0];
      const loopProps = loopCtrl.stringProp as any[];
      const loopProp = loopProps.find((p: any) => p.$.name === "LoopController.loops");
      if (loopProp) loopProp._ = String(loops);
      if (loops === -1) {
        const contProp = loopCtrl.boolProp?.find(
          (p: any) => p.$.name === "LoopController.continue_forever"
        );
        if (contProp) contProp._ = "true";
      }
      updates.push(`loops=${loops}`);
    }
    if (duration !== undefined) {
      setStringProp("ThreadGroup.duration", String(duration));
      setBoolProp("ThreadGroup.scheduler", "true");
      updates.push(`duration=${duration}s`);
    }
    if (delay !== undefined) {
      setStringProp("ThreadGroup.delay", String(delay));
      updates.push(`delay=${delay}s`);
    }
    if (scheduler !== undefined) {
      setBoolProp("ThreadGroup.scheduler", String(scheduler));
      updates.push(`scheduler=${scheduler}`);
    }

    writeTestPlan(testfile, plan);

    return {
      content: [
        {
          type: "text" as const,
          text: `Thread group updated: ${updates.join(", ")}`,
        },
      ],
    };
  }
);

// ─────────────────────────────────────────────
// TOOL 9: delete_element
// Deletes an element from the test plan by name
// ─────────────────────────────────────────────
server.tool(
  "delete_element",
  "Delete an element from a test plan by name",
  {
    testfile: z.string().describe("Path to the .jmx file"),
    elementName: z.string().describe("Name of the element to delete"),
  },
  async ({ testfile, elementName }) => {
    const plan = await readTestPlan(testfile);
    const threadHashTree = getThreadGroupHashTree(plan);
    const inner = threadHashTree[0];
    let deleted = false;

    // Search all element types in the inner hashTree
    for (const key of Object.keys(inner)) {
      if (key === "$" || key === "hashTree") continue;
      const elements = inner[key] as any[];
      if (!Array.isArray(elements)) continue;

      const idx = elements.findIndex((el: any) => el.$?.testname === elementName);
      if (idx !== -1) {
        elements.splice(idx, 1);
        if (elements.length === 0) delete inner[key];
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      return {
        content: [{ type: "text" as const, text: `Element "${elementName}" not found in test plan.` }],
      };
    }

    writeTestPlan(testfile, plan);

    return {
      content: [{ type: "text" as const, text: `Element "${elementName}" deleted successfully.` }],
    };
  }
);

// ─────────────────────────────────────────────
// TOOL 10: run_test
// Executes a JMeter test plan in non-GUI mode
// ─────────────────────────────────────────────
server.tool(
  "run_test",
  "Run a JMeter test plan and return results",
  {
    testfile: z.string().describe("Path to the .jmx test file"),
    outputdir: z.string().optional().describe("Output directory for results"),
  },
  async ({ testfile, outputdir }) => {
    const resultsDir = outputdir || path.join(path.dirname(testfile), "results");
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const resultsFile = path.join(resultsDir, `results-${timestamp}.jtl`);

    const cmd = `"${JMETER_BIN}" -n -t "${testfile}" -l "${resultsFile}" -e -o "${path.join(resultsDir, `report-${timestamp}`)}"`;
    const timeout = 360000; // 6 minute timeout

    try {
      const output = execSync(cmd, {
        timeout: timeout, // 6 minute timeout
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Test executed successfully!\nResults: ${resultsFile}\nReport: ${path.join(resultsDir, `report-${timestamp}`)}\n\nJMeter Output:\n${output}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Test execution failed:\n${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}\n\ncurrent_timeout: ${timeout}`,
          },
        ],
      };
    }
  }
);

// ─────────────────────────────────────────────
// TOOL 11: generate_report
// Generates an HTML dashboard from .jtl results
// ─────────────────────────────────────────────
server.tool(
  "generate_report",
  "Generate an HTML report from JMeter test results",
  {
    inputdir: z.string().describe("Directory containing .jtl or .csv results"),
    outputdir: z.string().describe("Output directory for the HTML report"),
  },
  async ({ inputdir, outputdir }) => {
    // Find the most recent .jtl file
    const pattern = path.join(inputdir, "**/*.jtl").replace(/\\/g, "/");
    const files = await glob(pattern);

    if (files.length === 0) {
      return {
        content: [{ type: "text" as const, text: `No .jtl result files found in: ${inputdir}` }],
      };
    }

    const latestFile = files.sort().pop()!;

    if (fs.existsSync(outputdir)) {
      fs.rmSync(outputdir, { recursive: true });
    }
    fs.mkdirSync(outputdir, { recursive: true });

    const cmd = `"${JMETER_BIN}" -g "${latestFile}" -o "${outputdir}"`;

    try {
      execSync(cmd, { timeout: 120000, encoding: "utf-8" });
      return {
        content: [
          {
            type: "text" as const,
            text: `HTML report generated successfully!\nInput: ${latestFile}\nReport: ${outputdir}\n\nOpen ${path.join(outputdir, "index.html")} in a browser to view.`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Report generation failed:\n${error.message}`,
          },
        ],
      };
    }
  }
);

// ─────────────────────────────────────────────
// Helper: Promisify xml2js parseString
// ─────────────────────────────────────────────
function parseXml(xml: string): Promise<any> {
  return new Promise((resolve, reject) => {
    parseString(xml, { explicitArray: true }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// ─────────────────────────────────────────────
// Helper: Build XML from JS object
// ─────────────────────────────────────────────
function buildXml(obj: any): string {
  const builder = new Builder({ xmldec: { version: "1.0", encoding: "UTF-8" } });
  return builder.buildObject(obj);
}

// ─────────────────────────────────────────────
// Helper: Read and parse a .jmx file
// ─────────────────────────────────────────────
async function readTestPlan(filePath: string): Promise<any> {
  const content = fs.readFileSync(filePath, "utf-8");
  return parseXml(content);
}

// ─────────────────────────────────────────────
// Helper: Write JS object back to .jmx file
// ─────────────────────────────────────────────
function writeTestPlan(filePath: string, plan: any): void {
  const xml = buildXml(plan);
  fs.writeFileSync(filePath, xml, "utf-8");
}

// ─────────────────────────────────────────────
// Helper: Get the inner hashTree (ThreadGroup level)
// JMX structure:
//   jmeterTestPlan > hashTree[0] > hashTree[0]
//     → TestPlan sits here
//     → hashTree[0] under it contains ThreadGroup + its hashTree
// ─────────────────────────────────────────────
function getThreadGroupHashTree(plan: any): any[] {
  const outerHashTree = plan.jmeterTestPlan.hashTree[0].hashTree[0];
  if (!outerHashTree.hashTree) {
    outerHashTree.hashTree = [{}];
  }
  // xml2js round-trips empty {} as "" — normalize back to objects
  outerHashTree.hashTree = outerHashTree.hashTree.map((entry: any) =>
    typeof entry === "string" ? {} : entry
  );
  return outerHashTree.hashTree;
}
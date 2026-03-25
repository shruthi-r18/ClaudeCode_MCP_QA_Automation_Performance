JMeter MCP Server Prompt
1   Create a fully functional MCP server for Apache JMeter that supports:
    Creating and configuring test plans
    Adding thread groups with configurable users, ramp-up, and duration
    Adding HTTP request samplers
    Adding listeners for result collection (HTML reports, aggregate reports)
    Running tests and generating reports
    Basic assertions and validators
2   Include complete setup instructions and configuration files
3   Show how to connect this MCP server to Claude Code

------------------------------------------------------------------------------------------
Rest API Prompt
1   Generate a Spring Boot (Gradle) REST API with these endpoints:
    GET /api/products - Browse all products
    GET /api/inventory/{productId} - Check inventory status for a product
    POST /api/orders - Create a new order
    POST /api/products/price-update - Update product price
    Include proper request/response models and error handling
2    Create a JSON data file with at least 20 sample products including:
    Product ID, name, price, stock status, category
    No database required - use in-memory storage
3    Provide instructions to:
    Build and run the API locally
    Test each endpoint manually (with curl commands or browser URLs)
    Expected responses for verification


------------------------------------------------------------------------------------------
🔵 Smoke Test Prompt

Context: I'm setting up performance testing for order and inventory management API.
Note: Only generate test configuration. Do not execute any tests.

Generate Performance Test Configuration

1. Create JMeter test case for Smoke Test with the following specifications:
		5 users
		Purpose: Validate system behavior under expected normal traffic. Determines if the application meets performance SLAs.
2. For the smoke test, specify:
        1. Thread count, ramp-up time, and duration
		2. API endpoints to test 
		3. Reasonable performance thresholds for pass/fail criteria (suggest industry-standard values)
3. Provide:
		1. Complete .jmx file configuration
		2. Recommended directory structure for organizing test plans and results
		3. File naming conventions for test plans, results
		

------------------------------------------------------------------------------------------
🔵 Load Test Prompt
 
Context: I'm setting up performance testing for order and inventory management API.
Note: Only generate test configuration. Do not execute any tests.

Generate Performance Test Configuration

1. Create JMeter test case for Load Test with the following specifications:
        20 users
        Purpose: Validate system behavior under expected normal traffic. 
        Determines if the application meets performance SLAs.

2. For the load test, specify:
        1. Thread count: 20 users
           Ramp-up time: 20 seconds
           Duration: 120 seconds
           Loop count: 1
           Think time: 300 milliseconds
        2. API endpoints to test:
           - GET  /api/products
           - GET  /api/inventory/{productId}
           - POST /api/orders
           - POST /api/products/price-update
        3. Reasonable performance thresholds for pass/fail criteria 
           (suggest industry-standard values)

3. Provide:
        1. Complete .jmx file configuration
        2. Recommended directory structure for organizing test plans and results
        3. File naming conventions for test plans, results
		
------------------------------------------------------------------------------------------
🔵 Spike Test Prompt
Context: I'm setting up performance testing for order and inventory management API.
Note: Only generate test configuration. Do not execute any tests.

Generate Performance Test Configuration

1. Create JMeter test case for Spike Test with the following specifications:
        50 users
        Purpose: Validate system behavior under sudden bursts of traffic.
        Determines how the application handles and recovers from unexpected 
        traffic spikes.

2. For the spike test, specify:
        1. Thread count: 50 users
           Ramp-up time: 5 seconds
           Duration: 60 seconds
           Loop count: 1
           Think time: 300 milliseconds
        2. API endpoints to test:
           - GET  /api/products
           - GET  /api/inventory/{productId}
           - POST /api/orders
           - POST /api/products/price-update
        3. Reasonable performance thresholds for pass/fail criteria
           (suggest industry-standard values)

3. Provide:
        1. Complete .jmx file configuration
        2. Recommended directory structure for organizing test plans and results
        3. File naming conventions for test plans, results

------------------------------------------------------------------------------------------
🟠 Stress Test Prompt
Context: I'm setting up performance testing for order and inventory management API.
Note: Only generate test configuration. Do not execute any tests.

Generate Performance Test Configuration

1. Create JMeter test case for Stress Test with the following specifications:
        40 users
        Purpose: Validate system behavior beyond normal operating capacity.
        Determines the breaking point of the application and how it behaves
        under extreme conditions.

2. For the stress test, specify:
        1. Thread count: 40 users
           Ramp-up time: 30 seconds
           Duration: 120 seconds
           Loop count: 1
           Think time: 300 milliseconds
        2. API endpoints to test:
           - GET  /api/products
           - GET  /api/inventory/{productId}
           - POST /api/orders
           - POST /api/products/price-update
        3. Reasonable performance thresholds for pass/fail criteria
           (suggest industry-standard values)

3. Provide:
        1. Complete .jmx file configuration
        2. Recommended directory structure for organizing test plans and results
        3. File naming conventions for test plans, results


------------------------------------------------------------------------------------------
🟣 Endurance Test Prompt
Context: I'm setting up performance testing for order and inventory management API.
Note: Only generate test configuration. Do not execute any tests.

Generate Performance Test Configuration

1. Create JMeter test case for Endurance Test with the following specifications:
        15 users
        Purpose: Validate system stability under sustained load over an 
        extended period. Identifies memory leaks, resource exhaustion, 
        and gradual performance degradation over time.

2. For the endurance test, specify:
        1. Thread count: 15 users
           Ramp-up time: 15 seconds
           Duration: 300 seconds
           Loop count: 1
           Think time: 300 milliseconds
        2. API endpoints to test:
           - GET  /api/products
           - GET  /api/inventory/{productId}
           - POST /api/orders
           - POST /api/products/price-update
        3. Reasonable performance thresholds for pass/fail criteria
           (suggest industry-standard values)

3. Provide:
        1. Complete .jmx file configuration
        2. Recommended directory structure for organizing test plans and results
        3. File naming conventions for test plans, results

------------------------------------------------------------------------------------------
🔴 Breakpoint Test Prompt
Context: I'm setting up performance testing for order and inventory management API.
Note: Only generate test configuration. Do not execute any tests.

Generate Performance Test Configuration

1. Create JMeter test case for Breakpoint Test with the following specifications:
        60 users
        Purpose: Identify the exact point at which the system fails or 
        performance becomes unacceptable. Determines the maximum capacity 
        the application can handle before breaking down.

2. For the breakpoint test, specify:
        1. Thread count: 60 users
           Ramp-up time: 60 seconds
           Duration: 180 seconds
           Loop count: 1
           Think time: 300 milliseconds
        2. API endpoints to test:
           - GET  /api/products
           - GET  /api/inventory/{productId}
           - POST /api/orders
           - POST /api/products/price-update
        3. Reasonable performance thresholds for pass/fail criteria
           (suggest industry-standard values)

3. Provide:
        1. Complete .jmx file configuration
        2. Recommended directory structure for organizing test plans and results
        3. File naming conventions for test plans, results


------------------------------------------------------------------------------------------
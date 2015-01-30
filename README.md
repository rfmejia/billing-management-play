Billing Management Application - Nooovle
========================================

Nooovle's web application solution for Hobbies of Asia, Inc. Uses the Play! Framework on Scala for API services, Slick and H2 for database services, and AngularJS with Bootstrap for its UI Client.

## System Requirements

- Java Runtime 8 or higher
- Scala 2.10.x or higher

## Developer's Installation

1. Setup the required development kits (Java, Scala)
2. Set up  **Typesafe Activator** 1.2.10 or higher
3. Clone project source and run command *activator* on the root directory to enter the REPL
4. Edit *conf/application.conf*, particlarly the 'db.default.*' settings
	- Note: If using a database other than **H2**, make sure that your JDBC driver is visible in the compiler's libraries path
5. Run the application using the command *run* within the REPL
6. Using an HTTP Client, perform a GET request on (http://localhost:8080/setupTestEnvironment) to initialize the database
7. Navigate to the web application at http://localhost:8080


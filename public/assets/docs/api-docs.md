# API Documentation
as of *2015.03.02*

- [Profiles](#profiles)
- [Roles](#roles)
- [API Interface](#routes)
- [Changelog](#changelog)
- [Tasks](#tasks)

---

<a id="profiles"></a>
## Profiles

*To be completed*

<a id="roles"></a>
## Roles

Worflow roles start with a capital letter. Only administrators are allowed to change roles

- `Ad` => `administrator` role
- `Ap` => `approver` role
- `C`  => `checker` role
- `E`  => `encoder` role
- `c`  => Currently logged on user
- `x`  => User assigned to the document
- `*`  => any role

<a id="routes"></a>
## API Interface

All routes (except authentication routes) must supply an authentication token. See the [authentication](#routes/auth) section for details.

Also, all request (if any) and response bodies are returned as `application/json` documents; set the `Content-type` HTTP header when sending requests with a body.

Request bodies are expected to conform to the supplied templates.

### Entry point and documentation

| Method | URL            | Parameters | Permissions | Description |
|--------|----------------|------------|-------------|-------------|
| GET    | /api           |            | `*`         | Service document listing resource collections and special links
| GET    | /api/docs      |            | `*`         | Link to API documentation (unimplemented)
| GET    | /api/mailboxes |            | `*`         | Lists mailboxes in a logical hierarchy

#### Tenants

| Method   | URL              | Parameters    | Permissions | Description |
|----------|------------------|---------------|-------------|-------------|
| GET      | /api/tenants     | offset, limit | `*`         | Summarize tenants (w/ pagination) |
| GET      | /api/tenants/:id | tenant ID     | `*`         | Show full tenant info
| POST     | /api/tenants     |               | `*`         | Create a new tenant using `create` template shown in /api/tenants
| PUT      | /api/tenants/:id | tenant ID     | `*`         | Update tenant using `edit` template shown in /api/tenants/:id
| DELETE   | /api/tenants/:id | tenant ID     | `Ad`        | Remove tenant from system (isolated deletion)

#### Users

User IDs in this system are email addresses. These cannot be changed.

| Method   | URL                        | Parameters    | Permissions | Description |
|----------|----------------------------|---------------|-------------|-------------|
| GET      | /api/users                 | offset, limit | `*`         | Summarize all users
| GET      | /api/users/me              |               | `c`         | Show full info about currently logged on user
| GET      | /api/users/:id             | user ID       | `*`         | Show full user info
| PUT      | /api/users/:id             | user ID       | `c`, `Ad`   | Edit user info using `edit` template shown in /api/users/:id
| DELETE   | /api/users/:id             | user ID       | `Ad`        | Remove user from system (isolated deletion)
| PUT      | /api/admin/users/:id/roles | user ID       | `Ad`        | Edit user roles

#### Documents

Documents are created for a specific tenant/month combination, hence these fields cannot be edited after creation.

| Method   | URL                         | Parameters              | Permissions | Description |
|----------|-----------------------------|-------------------------|-------------|-------------|
| GET      | /api/documents              | *See table below*       | `*`         | Summarize all documents, sorted by latest creation date
| GET      | /api/documents/:id          | document ID             | `*`         | Show full document info
| POST     | /api/documents              |                         | `*`         | Create document using `create` template shown in /api/documents
| PUT      | /api/documents/:id          | document ID             | `*`         | Edit document using `edit` template shown in /api/documents/:id
| DELETE   | /api/documents/:id          | document ID             | 1, `Ad`     | Remove document from system
| GET      | /api/documents/:id/logs     | document ID             | `*`         | Show activity logs made to document
| POST     | /api/documents/:id/:box     | document ID, mailbox ID | `*`         | Transfer document into another box in the workflow
| PUT      | /api/documents/:id/assigned | document ID             | `*`         | Assign document to the currently logged on user
| DELETE   | /api/documents/:id/assigned | document ID             | 2, `Ad`     | Remove document assignment

1 - Currently logged on user and document is in `drafts` mailbox

2 - Currently logged on user

##### Query parameters for /api/documents

| Parameter  | Type       | Values  | Default | Description |
|------------|------------|---------|---------|-------------|
| offset     | Int        | 0+      | 0       | Skip `offset` results from start of listing
| limit      | Int        | 1+      | 10      | Limit the number of results returned
| mailbox    | Mailbox ID |         |         | Return results within the specified mailbox only
| creator    | User ID    |         |         | Return results created by the specified user only
| assigned   | User ID    |         |         | Return results assigned to the specified user only
| forTenant  | Tenant ID  |         |         | Return results for the specified tenant only
| forMonth   | DateTime   | yyyy-mm |         | Return results for the specified month only
| isPaid     | Boolean    |         |         | Flag for documents fully paid for
| others     | Boolean    |         |         | Flag for documents not created by the currently owned user only
| isAssigned | Boolean    |         |         | Flag for documents created by the currently owned user only

#### Templates

| Method   | URL                     | Parameters    | Permissions | Description |
|----------|-------------------------|---------------|-------------|-------------|
| GET      | /api/templates          | offset, limit | `*`         | Show all document templates available in the system
| GET      | /api/templates/:docType | docType       | `*`         | Show particular document type


#### Reports

Documents are created for a specific tenant/month combination, hence these fields cannot be edited after creation.

| Method   | URL                       | Parameters    | Permissions | Description |
|----------|---------------------------|---------------|-------------|-------------|
| GET      | /api/reports              | year, month   | `*`         | Show report; if year or month is missing, a listing of available reports is shown instead

<a id="routes/auth"></a>
#### Authentication

##### Authentication API

| Method   | URL                        | Parameters         | Permissions | Description |
|----------|----------------------------|--------------------|-------------|-------------|
| POST     | /api/authenticate/userpass | username, password | `*`         | Authenticate username and password (sent as form data) and return a token

The following sections are default routes supplied by [SecureSocial](http://securesocial.ws/). These are HTML pages that should not be treated as API calls.

##### Login page

	GET      /login
	GET      /logout

##### User registration and password handling

	GET      /admin/invite
	POST     /admin/invite
	GET      /signup/:token
	POST     /signup/:token
	GET      /password
	POST     /password

##### Reset password

	GET      /reset
	POST     /reset
	GET      /reset/:mailToken
	POST     /reset/:mailToken

##### Providers entry points

	GET      /authenticate/:provider
	POST     /authenticate/:provider


<a id="changelog"></a>
## Changelog

- v0.2 (t. 2015-03-19, r.)

	- User invitation workflow
	- Monthly reports API
	- Additional document filters
	- Authorization per action
	- Document logs

- v0.1 (r. 2015.03.02)

	- Working draft


<a id="tasks"></a>
## Tasks

### API

- [ ] Prefix admin-only routes with */api/admin*, and...
- [ ] ...perform **token authentication and authorization** on all routes
- [x] Create and use typesafe roles
- [x] Separate link for role admin with User editing
- [x] Remove editing of `roles` field from PUT /users/:userId
- [x] Separate link for document un/assignment
- [x] Remove editing of `assigned` field from PUT /api/documents/:id
- [x] Add user invitation accessible only by the admin role
- [x] Allow access to user invitation when there is no user with an admin role
- [x] Add mailbox filtering using on top-level boxes (pending, delivered)
- [x] Add descriptive error messages in JSON when returning Forbidden responses

### Backend

- [x] Generate serial number upon approval
- [ ] Limited deletion **after issuing serial number** (must not be permanently deleted)
- [x] Log document updates (as specific as possible)
- [x] Audit cascade deletions in models
- [x] Changed amountPaid from double to JsObject, as the basis of reports
- [x] Eliminate in-memory document filtering by moving relevant fields into database model
- [x] Remove title from document model
- [x] Use typesafe serial number in document model
- [ ] Create/use separate DB for user accounts (to survive database refreshes, increase security, etc.)
- [x] Figure out a way to put the isPaid flag inside the database to correctly filter docs
- [-] Migrate Slick to use PostgreSQL or MySQL 

### Logging

- [x] Setup logservice API
- [x] Separate logging folder into YYYY/MM/DD
- [ ] Change logging to save into S3 or to insert into a database

### Testing

- [ ] Transfer data manipulation logic into services (leave controllers as HTTP-only tasks)
- [ ] Write automated tests for API
- [ ] Write test scripts for each 
- [ ] Setup Jenkins in @deadpool
- [ ] Generate test data
- [ ] Add action to inject test data

### Authentication

- [x] Customize login page
- [x] Show signup (invite) routes to administrators only

### Authorization

#### Users

- [x] Restrict deletion of user to admin role
- [x] Restrict editing of roles to admin role

#### Tenants

- [x] Restrict deletion of tenant to admin role

#### Documents

- [x] Restrict document editing to assigned user
- [x] Restrict **document unlocking** to **assigned user**, or...
- [x] ...to **admin role** (locking is unrestricted)
- [x] Restrict document mailbox movement to assigned user **with the appropriate workflow role**
- [x] Restrict **document deletion** to **assigned user when in drafts mailbox**, or...
- [x] ...to **admin role**
- [x] Unassign document after moving mailbox
- [x] Prevent assigning if someone is already assigned

### Reports

- [x] Summary of the *TOTAL* Rental, Electricity, Water, CUSA charged *every month*
- [x] Summary of the *PAID* Rental, Electricity, Water, CUSA *every month*
- [x] Summary of the *UNPAID* Rental, Electricity, Water, CUSA *every month*

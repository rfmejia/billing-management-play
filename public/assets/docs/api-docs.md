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

| Method | URL            | Parameters | Roles | Description |
|--------|----------------|------------|-------|-------------|
| GET    | /api           |            | `*`     | Service document listing resource collections and special links
| GET    | /api/docs      |            | `*`     | Link to API documentation (unimplemented)
| GET    | /api/mailboxes |            | `*`     | Lists mailboxes in a logical hierarchy

#### Tenants

| Method   | URL              | Parameters    | Roles | Description |
|----------|------------------|---------------|-------|-------------|
| GET      | /api/tenants     | offset, limit | `*`     | Summarize tenants (w/ pagination) |
| GET      | /api/tenants/:id | tenant ID     | `*`     | Show full tenant info
| POST     | /api/tenants     |               | `*`     | Create a new tenant using `create` template shown in /api/tenants
| PUT      | /api/tenants/:id | tenant ID     | `*`     | Update tenant using `edit` template shown in /api/tenants/:id
| DELETE   | /api/tenants/:id | tenant ID     | `Ad`    | Remove tenant from system (isolated deletion)

#### Users

User IDs in this system are email addresses. These cannot be changed.

| Method   | URL            | Parameters    | Roles | Description |
|----------|----------------|---------------|-------|-------------|
| GET      | /api/users     | offset, limit | `*`     | Summarize all users
| GET      | /api/users/me  |               | `c`     | Show full info about currently logged on user
| GET      | /api/users/:id | user ID       | `*`     | Show full user info
| PUT      | /api/users/:id | user ID       | `c`, `Ad` | Edit user info using `edit` template shown in /api/users/:id
| DELETE   | /api/users/:id | user ID       | `*`     | Remove user from system (isolated deletion)

#### Documents

Documents are created for a specific tenant/month combination, hence these fields cannot be edited after creation.

| Method   | URL                     | Parameters              | Roles | Description |
|----------|-------------------------|-------------------------|-------|-------------|
| GET      | /api/documents          | *See table below*       | `*`   | Summarize all documents, sorted by latest creation date
| GET      | /api/documents/:id      | Document ID             | `*`   | Show full document info
| POST     | /api/documents          |                         | `*`   | Create document using `create` template shown in /api/documents
| PUT      | /api/documents/:id      | Document ID             | `*`   | Edit document using `edit` template shown in /api/documents/:id
| DELETE   | /api/documents/:id      | Document ID             | `*`   | Remove document from system
| GET      | /api/documents/:id/logs | Document ID             | `*`   | Show activity logs made to document
| POST     | /api/documents/:id/:box | Document ID, Mailbox ID | `*`   | Transfer document into another box in the workflow

##### Query parameters for /api/documents

| Parameter  | Type       | Values  | Default | Description |
|------------|------------|---------|---------|-------------|
| offset     | Int        | 0+      | 0       | Skip `offset` results from start of listing
| limit      | Int        | 1+      | 10      | Limit the number of results returned
| mailbox    | Mailbox ID |         | -       | Return results within the specified mailbox only
| creator    | User ID    |         | -       | Return results created by the specified user only
| assigned   | User ID    |         | -       | Return results assigned to the specified user only
| forTenant  | Tenant ID  |         | -       | Return results for the specified tenant only
| forMonth   | DateTime   | YYYY-MM | -       | Return results for the specified month only
| isPaid     | Boolean    |         | -       | Flag for documents fully paid for
| others     | Boolean    |         | -       | Flag for documents not created by the currently owned user only
| isAssigned | Boolean    |         | -       | Flag for documents created by the currently owned user only

#### Templates

| Method   | URL                     | Parameters    | Roles   | Description |
|----------|-------------------------|---------------|---------|-------------|
| GET      | /api/templates          | offset, limit | `*`     | Show all document templates available in the system
| GET      | /api/templates/:docType | docType       | `*`     | Show particular document type

<a id="routes/auth"></a>
#### Authentication

##### Authentication API

| Method   | URL                     | Parameters    | Roles   | Description |
|----------|-------------------------|---------------|---------|-------------|
POST     /api/authenticate/:provider   @securesocial.controllers.LoginApi.authenticate(provider, builder = "token")

The following sections are default routes supplied by [SecureSocial](http://securesocial.ws/). These are HTML pages that should not be treated as API calls.

##### Login page

	GET      /login
	GET      /logout

##### User registration and password handling

	GET      /signup
	POST     /signup
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

	Beta version for initial user acceptance testing

- v0.1 (r. 2015.03.02)

	Working draft

<a id="tasks"></a>
## Tasks

### API

- [ ] Prefix admin-only routes with */api/admin*, and...
- [ ] ...perform **token authentication and authorization** on all routes
- [ ] Separate link for role admin with User editing
- [ ] Separate link for document un/assignment

### Backend

- [ ] Generate serial number upon approval
- [ ] Log document updates (as specific as possible)
- [ ] Limited deletion **after issuing serial number** (must not be permanently deleted)

### Authentication

- [ ] Customize login page
- [ ] Show signup (invite) routes to administrators only

### Authorization

#### Users

- [ ] Restrict deletion of user to admin role

#### Tenants

- [ ] Restrict deletion of tenant to admin role

#### Documents

- [ ] Restrict document editing to assigned user
- [ ] Restrict **document unlocking** to **assigned user**, or...
- [ ] ...to **admin role** (locking is unrestricted)
- [ ] Restrict document mailbox movement to assigned user **with the appropriate workflow role**
- [ ] Restrict **document deletion** to **assigned user when in drafts mailbox**, or...
- [ ] ...to **admin role**

### Reports

- [ ] Summary of the *TOTAL* Rental, Electricity, Water, CUSA charged *every month*
- [ ] Summary of the *PAID* Rental, Electricity, Water, CUSA *every month*
- [ ] Summary of the *UNPAID* Rental, Electricity, Water, CUSA *every month*

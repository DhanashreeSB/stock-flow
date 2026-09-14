# Stock Flow API Contract

This document defines the REST contract for a future Spring Boot backend. The current repository is a React/Vite frontend and does not contain a Spring source tree yet.

## Base URL

```text
/api/v1
```

Use plural resource names, HTTP verbs for actions, and path parameters for resource identity. Do not put verbs in normal CRUD URLs.

## Endpoint Summary

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/orders` | List orders with filtering and pagination |
| `POST` | `/orders` | Create an order |
| `GET` | `/orders/{orderId}` | Get one order |
| `PATCH` | `/orders/{orderId}` | Edit mutable order fields |
| `PATCH` | `/orders/{orderId}/status` | Move an order through its workflow |
| `DELETE` | `/orders/{orderId}` | Delete an order when permitted |
| `GET` | `/customers` | List known customers for order entry |
| `GET` | `/customers/{customerId}` | Get customer history |
| `GET` | `/fixtures` | List fixture inventory |
| `PATCH` | `/fixtures/{fixtureId}/stock` | Issue or restock inventory |
| `GET` | `/analytics/profit` | Get monthly profit analytics |
| `GET` | `/settings/store-rates` | Get pricing and tax rates |
| `PUT` | `/settings/store-rates` | Replace pricing and tax rates |
| `GET` | `/settings/retention-policy` | Get retention settings |
| `PUT` | `/settings/retention-policy` | Replace retention settings |
| `POST` | `/orders/{orderId}/notifications` | Send an order notification |

## Orders

### List orders

```http
GET /api/v1/orders?status=ready&search=patel&page=0&size=20&sort=createdAt,desc
```

Supported filters should include `status`, `customerId`, `search`, `createdFrom`, `createdTo`, `page`, `size`, and `sort`.

Suggested response:

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

### Create an order

```http
POST /api/v1/orders
Content-Type: application/json
```

Request body:

```json
{
  "customer": {
    "name": "Ramesh Patil",
    "phoneNumber": "9765432190"
  },
  "items": [
    {
      "productType": "indian_wafers",
      "variety": "Potato Wafers - Classic Salted",
      "quantityKg": 10,
      "spicesProvidedByCustomer": false,
      "spiceDetails": ""
    }
  ],
  "container": {
    "type": "steel_dabba",
    "description": "Medium stainless steel dabba"
  },
  "storageLocation": "Rack A - Shelf 1",
  "specialNotes": "",
  "paymentStatus": "pending",
  "paymentMethod": "cash"
}
```

The server should calculate `baseTotal`, `spiceTotal`, `taxAmount`, and `totalAmount` from current store rates. Clients should not be trusted to submit calculated totals.

Suggested response:

```json
{
  "id": "ORD-4920",
  "customer": {
    "id": "CUS-1001",
    "name": "Ramesh Patil",
    "phoneNumber": "9765432190"
  },
  "items": [
    {
      "id": "ITM-9001",
      "productType": "indian_wafers",
      "productName": "Potato Wafers - Classic Salted",
      "variety": "Potato Wafers - Classic Salted",
      "quantityKg": 10,
      "spicesProvidedByCustomer": false,
      "spiceDetails": "",
      "baseRatePerKg": 65,
      "spiceCostPerKg": 25,
      "itemTotal": 900
    }
  ],
  "baseTotal": 650,
  "spiceTotal": 250,
  "taxAmount": 45,
  "discountAmount": 0,
  "totalAmount": 945,
  "container": {
    "type": "steel_dabba",
    "description": "Medium stainless steel dabba"
  },
  "storageLocation": "Rack A - Shelf 1",
  "specialNotes": "",
  "createdAt": "2026-09-14T14:00:00Z",
  "status": "received",
  "statusHistory": [
    {
      "status": "received",
      "timestamp": "2026-09-14T14:00:00Z",
      "note": "Order received at counter"
    }
  ],
  "notificationSent": false,
  "paymentStatus": "pending",
  "paymentMethod": "cash"
}
```

### Update order status

```http
PATCH /api/v1/orders/ORD-4920/status
Content-Type: application/json
```

```json
{
  "status": "ready",
  "note": "Drying and packaging completed"
}
```

Valid workflow statuses are `received`, `in_production`, `ready`, and `collected`. The service should validate allowed transitions and append a status-history record in the same transaction.

## Customers

The customer selector in the frontend needs a lightweight endpoint:

```http
GET /api/v1/customers?search=ramesh&page=0&size=20
```

Suggested response:

```json
{
  "content": [
    {
      "id": "CUS-1001",
      "name": "Ramesh Patil",
      "phoneNumber": "9765432190",
      "lastOrderAt": "2026-09-14T14:00:00Z",
      "orderCount": 4
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

Use the normalized phone number as a unique business key. Selecting a customer in the UI should use `customer.id`; the server remains authoritative for the name and phone number.

## Fixtures and Stock

```http
GET /api/v1/fixtures?category=wafers&status=low
PATCH /api/v1/fixtures/BIN-A101/stock
```

Stock request:

```json
{
  "quantityKg": 25,
  "operation": "restock",
  "note": "Morning delivery"
}
```

`operation` should be either `issue` or `restock`. The service must reject negative resulting stock and stock above capacity, and calculate the resulting fixture status server-side.

## Notifications

```http
POST /api/v1/orders/ORD-4920/notifications
Content-Type: application/json
```

```json
{
  "channel": "whatsapp",
  "language": "en"
}
```

Suggested response:

```json
{
  "id": "NOTIF-2001",
  "orderId": "ORD-4920",
  "channel": "whatsapp",
  "recipientPhone": "9765432190",
  "status": "delivered",
  "sentAt": "2026-09-14T14:05:00Z",
  "messagePreview": "Anita Stores: Hello Ramesh Patil..."
}
```

## Analytics and Settings

```http
GET /api/v1/analytics/profit?from=2026-04&to=2026-09
GET /api/v1/settings/store-rates
PUT /api/v1/settings/store-rates
GET /api/v1/settings/retention-policy
PUT /api/v1/settings/retention-policy
```

Store rates request:

```json
{
  "wafersBaseRatePerKg": 65,
  "wafersSpiceChargePerKg": 25,
  "vermicelliBaseRatePerKg": 55,
  "vermicelliSpiceChargePerKg": 20,
  "taxPercent": 5
}
```

Retention policy request:

```json
{
  "autoDeleteAfter6Months": true,
  "retentionDays": 180
}
```

## Error Format

Use one consistent error envelope from Spring exception handlers:

```json
{
  "timestamp": "2026-09-14T14:00:00Z",
  "status": 422,
  "code": "ORDER_INVALID_STATUS_TRANSITION",
  "message": "An order in 'received' status cannot be marked 'collected'.",
  "path": "/api/v1/orders/ORD-4920/status",
  "fieldErrors": []
}
```

Recommended HTTP statuses: `200` for reads and updates, `201` for creation, `204` for deletion, `400` for malformed input, `404` for missing resources, `409` for business conflicts, and `422` for validation failures.

## Current Mock Data and JSON Source

The current seed data is located in:

- `src/data/initialData.ts`: `initialOrders`, `initialFixtures`, `initialStoreRates`, and `initialRetentionSettings`.
- `src/types.ts`: the TypeScript interfaces that define the current object shape.
- `src/utils/storage.ts`: browser persistence and the local-storage keys.

The application initializes orders and fixtures into `localStorage` when no saved data exists:

```text
anita_stores_orders_v1
anita_stores_fixtures_v1
anita_stores_rates_v1
anita_stores_retention_v1
```

The values under those keys are JSON arrays/objects matching the interfaces in `src/types.ts`. The browser state can therefore be exported with `JSON.stringify(JSON.parse(localStorage.getItem('anita_stores_orders_v1') ?? '[]'), null, 2)`. For the Spring migration, prefer the request/response DTOs above over exposing the current frontend `Order` entity directly.

## Suggested Spring Package Layout

```text
com.example.stockflow
  controller/
  service/
  repository/
  domain/
  dto/
    order/
    customer/
    fixture/
    settings/
    notification/
  exception/
  mapper/
```

Use separate request and response DTOs, Bean Validation (`@NotBlank`, `@Positive`, `@Pattern`), transactions for order creation/status changes/stock changes, and a global `@RestControllerAdvice` for the error envelope.

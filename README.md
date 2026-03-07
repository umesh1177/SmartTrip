# 🌍 SmartTrip — Intelligent Travel Planning Platform

> A full-stack MERN application that guides travelers from destination discovery all the way through live trip navigation — with B2B partnerships, real-time cab service, verified reviews, and AI-powered recommendations.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Live Demo](#live-demo)
- [Features by Phase](#features-by-phase)
- [User Tier System](#user-tier-system)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Models](#database-models)
- [API Documentation](#api-documentation)
- [B2B Partner System](#b2b-partner-system)
- [Real-Time System](#real-time-system)
- [Security](#security)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [Admin Dashboard](#admin-dashboard)
- [Payment Integration](#payment-integration)
- [External APIs Used](#external-apis-used)
- [Background Jobs](#background-jobs)
- [Contributing](#contributing)

---

## 🎯 Project Overview

SmartTrip solves a real problem — most people don't know which travel destination suits them best. No platform exists that recommends places based on personal preferences like budget, season, travel type, fitness level, and more.

SmartTrip fills this gap by:

- Suggesting destinations using smart multi-level filters
- Allowing full trip planning (hotels, transport, guides) in one place
- Providing live in-trip assistance with real-time cab booking
- Showing public transport routes step by step
- Displaying verified user reviews with real photos
- Recommending nearby partner stores and restaurants during the trip
- Suggesting nearby places to visit when budget and time remain at end of trip

The platform runs on a **freemium model** for users and a **B2B subscription model** for hotels, stores, and guides.

---

## 🌐 Live Demo

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Admin Dashboard: `http://localhost:5173/admin/dashboard`
- Hotel Partner Portal: `http://localhost:5173/hotel-partner/dashboard`

---

## 🚀 Features by Phase

### Phase 1 — Destination Discovery & Authentication

| Feature | Guest | Free | Premium |
|---|---|---|---|
| View destination cards | 6 cards | All cards | All cards |
| Basic filters (category, budget, season) | ✅ | ✅ | ✅ |
| Advanced filters (climate, duration, activities) | ❌ | ✅ | ✅ |
| Premium filters (photography, fitness, facilities) | ❌ | ❌ | ✅ |
| Save favourite places | ❌ | Max 10 | Unlimited |
| Plan trips | ❌ | 1 free trip | 5 trips/cycle |
| Dynamic search (any city worldwide) | ❌ | ✅ | ✅ |

**Filter Categories:**

- **Guest (not logged in):** Place Type, City/State/Country, Best Time, Entry Fee
- **Free User:** All guest filters + Crowd Level, Family Friendly, Duration, Distance, Season, Activity Type, Indoor/Outdoor, Accessibility, Sort
- **Premium User:** All free filters + Photography Score, Accommodation, Food Options, Age Suitability, Fitness Level, Guided Tours, Pet Friendly, Parking, Facilities, Transport Mode, Budget Estimator

**Subscription Plans:**
- Monthly: $9.99/month
- Yearly: $79.99/year (save 33%)

---

### Phase 2 — Travel Planning Ecosystem

- **Hotel Recommendations** — B2B partner hotels shown first with "Recommended" badge
- **Transport Booking** — Search flights (Amadeus), trains (RailwayAPI), buses with external booking links
- **Guide Marketplace** — Rapido-style guide booking. Guides earn 85%, SmartTrip takes 15%
- **5-Step Trip Wizard** — Destination → Hotel → Transport → Guide → Summary
- **Smart Notifications** — Trip reminders at 7 days, 3 days, 1 day, and day-of
- **Budget Tracker** — Track spend on hotel, transport, guides, food, shopping
- **B2B Store Recommendations** — Partner restaurants and shops recommended near destination
- **Trip Limits** — Free: 1 trip lifetime. Premium: 5 trips per billing cycle (resets on renewal)

---

### Phase 3 — Live Trip Navigation

- **Real-Time Cab Booking** — Socket.IO powered. OTP verification, live driver tracking on map
- **Public Transport Navigation** — Google Maps Directions API shows bus numbers, metro lines step by step
- **Verified User Reviews** — Only users who completed a trip to that destination can review
- **Photo Upload** — Review photos uploaded to Cloudinary
- **Trip Activity Timeline** — Every action logged: cabs, check-ins, store visits, reviews
- **Smart Budget Tracker** — Live budget breakdown with alerts at 80% and 90% spent
- **Time-Based Store Recommendations** — Breakfast cafes in morning, lunch spots at noon, dinner places in evening (partner stores only)
- **End-of-Trip Suggestions** — If budget and time remain on last day, suggest nearby places reachable within remaining budget
- **Progressive Web App (PWA)** — Installable, offline support, push notifications

---

## 👥 User Tier System

### Guest (Not Logged In)
- View 6 featured destination cards
- Use 4 basic filters
- View pricing page
- Cannot save, plan, or book anything

### Free User ($0)
- View all destination cards
- Use 13 filters
- Save up to 10 places
- Plan 1 trip (lifetime)
- See 5 hotel options
- Search trains and buses
- Book cabs
- Post verified reviews after visiting

### Premium User ($9.99/month or $79.99/year)
- Everything in Free plus:
- All 25+ advanced and premium filters
- Unlimited saved places
- Plan up to 5 trips per billing cycle
- See all hotels with full details
- Search flights via Amadeus API
- Book guides from marketplace
- End-of-trip nearby suggestions
- Smart time-based partner recommendations
- Priority support

### Guide (Role: guide)
- Register with documents → admin verifies
- Accept or reject booking requests
- Manage availability calendar
- Earn 85% of booking fee

### Cab Driver (Role: driver)
- Register with vehicle + documents → admin verifies
- Go online/offline, receive ride requests via Socket.IO
- Accept/decline requests (30-second window)
- Update live GPS location every 10 seconds
- Earn 85% per completed ride

### Hotel Partner (Role: hotel_partner)
- Register business details
- Subscribe to listing plan ($49/$99/$149 per month)
- Submit hotel information form
- Admin reviews and approves
- Hotel shown as "Recommended" to users planning trips

### B2B Store Partner
- Restaurants, shops, pharmacies pay to be recommended
- Shown in nearby results during user's active trip
- Basic: $29/month, Featured: $59/month

### Admin (Role: admin)
- Full access to admin dashboard
- Verify guides and drivers
- Review and approve hotel applications
- Manage places, users, trips, reviews
- View revenue and subscription analytics

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| React Router DOM | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Axios | HTTP client with interceptors |
| Socket.IO Client | Real-time cab tracking |
| Recharts | Admin dashboard charts |
| React Hot Toast | Notification toasts |
| @react-google-maps/api | Map and location features |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB Atlas | Primary database |
| Mongoose | ODM for MongoDB |
| Socket.IO | Real-time event handling |
| JWT + bcryptjs | Authentication and password hashing |
| Stripe | Payment processing |
| Cloudinary + Multer | Media storage and upload |
| Nodemailer | Email notifications |
| node-cron | Background scheduled jobs |
| node-cache | In-memory API response caching |

### Security
| Package | Purpose |
|---|---|
| Helmet | Secure HTTP headers |
| express-rate-limit | Rate limiting per IP |
| express-mongo-sanitize | NoSQL injection prevention |
| xss-clean | XSS attack prevention |
| hpp | HTTP parameter pollution prevention |
| Node crypto (AES-256) | Encrypting sensitive data at rest |

### External APIs
| API | Purpose | Cost |
|---|---|---|
| Stripe | Payments and subscriptions | Free dev mode |
| Google Maps Directions | Public transit routing | Free tier |
| Google Places | Nearby stores and stops | Free tier |
| Amadeus | Flight search | Free tier (1000 req/day) |
| OpenTripMap | Dynamic place search worldwide | Free (1000 req/day) |
| Unsplash | Place photos | Free (50 req/hour) |
| OpenStreetMap Nominatim | City to coordinates | Free, unlimited |
| Cloudinary | Image hosting | Free tier |
| RailwayAPI | Train search | Free tier |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT LAYER                     │
│  React Web App │ PWA Mobile │ Driver App │ B2B Portal│
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS + WSS (Socket.IO)
┌──────────────────────▼──────────────────────────────┐
│                  SECURITY GATEWAY                   │
│  Helmet │ CORS │ Rate Limiter │ XSS │ MongoSanitize │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  AUTH MIDDLEWARE                    │
│  JWT Verify │ Refresh Token │ Role Guard            │
│  Trip Limit Middleware │ Input Validator            │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│               BACKEND SERVICES LAYER                │
│  Places │ Hotels │ Cabs │ Guides │ Transit           │
│  Trips  │ Reviews│ Notifications │ Payments          │
│  B2B    │ Uploads│ Recommendations │ End-of-Trip     │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                    DATA LAYER                       │
│  MongoDB Atlas │ Cloudinary │ Nodemailer            │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│               EXTERNAL SERVICES                     │
│  Stripe │ Amadeus │ Google Maps │ OpenTripMap       │
│  Unsplash │ RailwayAPI │ OpenStreetMap │ Cloudinary  │
└─────────────────────────────────────────────────────┘
```

**Real-Time Layer (Socket.IO rooms):**
- `user:{userId}` — ride updates and notifications to specific user
- `driver:{driverId}` — driver-specific messages
- `city:{cityName}` — broadcast new ride requests to all online drivers in city

---

## 🗄 Database Models

| Model | Purpose |
|---|---|
| User | All user types — free, premium, guide, driver, hotel_partner, admin |
| Place | Travel destinations with 30+ filterable fields |
| TripPlan | Full trip with hotel, transport, guides, budget tracker |
| Hotel | Hotel listings — both partner and non-partner |
| HotelApplication | Hotel info submitted by partners awaiting admin approval |
| Guide | Guide profiles with availability and specializations |
| CabDriver | Driver profiles with vehicle info and live location |
| CabRide | Individual ride with status, OTP, fare, tracking |
| Review | Verified user reviews with photos and tags |
| Store | Partner restaurants and shops for nearby recommendations |
| B2BPartner | Business subscription records |
| Subscription | User subscription history |
| TripActivity | Every action logged during a trip |
| Notification | In-app and email notifications |

**Key Schema Highlights:**

- `Place` model has 30+ filter fields covering category, budget, season, climate, bestFor, activities, photographyScore, fitnessLevel, facilities, and more
- `CabDriver.currentLocation` uses MongoDB 2dsphere index for geospatial queries
- `User.bankDetails` (guide/driver) is AES-256-CBC encrypted before storing
- `CabRide.otp` is bcrypt hashed before storing in database
- `Review.tripPlanId` links to TripPlan to verify the user actually visited

---

## 📡 API Documentation

**Base URL:** `/api/v1`

### Authentication
```
POST   /api/auth/register          Register (roles: free, guide, driver)
POST   /api/auth/login             Login → returns JWT + sets refresh cookie
POST   /api/auth/refresh           Refresh access token
GET    /api/auth/me                Get current user profile
POST   /api/auth/logout            Clear refresh token
```

### Places
```
GET    /api/places                 Get places (tiered by auth level)
GET    /api/places/search?q=delhi  Dynamic worldwide search
GET    /api/places/:id             Single place details
POST   /api/places/save/:id        Save place to favourites
DELETE /api/places/save/:id        Remove from favourites
GET    /api/places/saved           All saved places
GET    /api/places/:id/realtime    Crowd level, recent photos
```

### Trips
```
POST   /api/trips                  Create trip (limit enforced)
GET    /api/trips                  All my trips
GET    /api/trips/:id              Single trip details
PUT    /api/trips/:id              Update trip
GET    /api/trips/:id/timeline     Activity timeline by day
POST   /api/trips/:id/activate     Start live trip mode
GET    /api/trips/:id/end-suggestions  Nearby suggestions (premium)
GET    /api/trips/stats            Trip usage stats
```

### Hotels
```
GET    /api/hotels?placeId=xxx     Hotels for destination (partners first)
GET    /api/hotels/:id             Hotel details
```

### Transport
```
GET    /api/transport/flights      Search flights (premium only)
GET    /api/transport/trains       Search trains
GET    /api/transport/buses        Search buses
POST   /api/trips/:id/transport    Add booking to trip
```

### Guides
```
POST   /api/guides/register        Apply as guide
GET    /api/guides?city=xxx        Browse guides
POST   /api/guides/:id/request     Request guide (premium)
PUT    /api/guides/bookings/:id/accept   Guide accepts
PUT    /api/guides/bookings/:id/reject   Guide rejects
GET    /api/guides/my-bookings     Guide's booking list
```

### Cabs
```
POST   /api/cab/request            Request a cab
GET    /api/cab/active-ride        Current active ride
PUT    /api/cab/:id/accept         Driver accepts (driver role)
PUT    /api/cab/:id/start          Verify OTP, start ride (driver)
PUT    /api/cab/:id/end            End ride (driver)
PUT    /api/cab/:id/rate           Rate driver
```

### Public Transit
```
GET    /api/transit/routes         Step-by-step transit directions
GET    /api/transit/nearby-stops   Nearest bus/metro stops
GET    /api/transit/metro-map      City metro map
```

### Reviews
```
POST   /api/reviews                Post review (verified visit only)
GET    /api/reviews/place/:id      Reviews for a place
PUT    /api/reviews/:id/helpful    Vote helpful
DELETE /api/reviews/:id            Delete own review
```

### Subscriptions
```
POST   /api/subscription/checkout  Create Stripe checkout
POST   /api/subscription/webhook   Stripe webhook
GET    /api/subscription/status    Current subscription
POST   /api/subscription/cancel    Cancel subscription
```

### Hotel Partner
```
POST   /api/hotel-partner/register    Register as hotel partner
GET    /api/hotel-partner/dashboard   Partner dashboard data
POST   /api/hotel-partner/subscribe   Create subscription checkout
POST   /api/hotel-partner/apply       Submit hotel info form
GET    /api/hotel-partner/application Application status
GET    /api/hotel-partner/analytics   Referrals and click stats
```

### Admin (admin role required)
```
GET    /api/admin/stats                    Dashboard statistics
GET    /api/admin/users                    All users
PUT    /api/admin/users/:id/role           Change user role
PUT    /api/admin/users/:id/ban            Ban user
GET    /api/admin/hotels                   All hotels
POST   /api/admin/hotels                   Add hotel manually
PUT    /api/admin/hotels/:id/toggle-partner Toggle partner status
GET    /api/admin/places                   All places
POST   /api/admin/places                   Add place
PUT    /api/admin/places/:id/featured      Toggle featured
PUT    /api/admin/places/:id/trending      Toggle trending
GET    /api/admin/trips                    All trips
GET    /api/admin/guides                   All guides
PUT    /api/admin/guides/:id/verify        Verify guide
GET    /api/admin/drivers                  All drivers
PUT    /api/admin/drivers/:id/verify       Verify driver
GET    /api/admin/reviews                  All reviews
PUT    /api/admin/reviews/:id/approve      Approve review
PUT    /api/admin/reviews/:id/reject       Reject review
GET    /api/admin/hotel-applications       Hotel partner applications
PUT    /api/admin/hotel-applications/:id/approve   Approve application
PUT    /api/admin/hotel-applications/:id/reject    Reject application
PUT    /api/admin/hotel-applications/:id/revision  Request changes
GET    /api/admin/revenue                  Revenue and subscriptions
```

---

## 💼 B2B Partner System

SmartTrip has two B2B revenue streams:

### Hotel Partners
Hotels pay a monthly subscription to be recommended to users:

| Plan | Price | Placement | Features |
|---|---|---|---|
| Basic | $49/month | Listed in results | Standard listing, basic analytics |
| Featured | $99/month | Top of results | "Recommended" badge, full analytics |
| Premium | $149/month | #1 placement | "Premium Partner" badge, dedicated manager |

**Hotel Partner Flow:**
1. Hotel owner registers at `/hotel-partner/register`
2. Chooses subscription plan → Stripe payment
3. Fills hotel information form (name, location, amenities, photos, pricing)
4. Admin reviews application in admin dashboard
5. Admin approves → hotel auto-created in database as partner
6. Hotel appears first when users plan trips to that city

### Store Partners
Restaurants, cafes, shops, pharmacies pay to appear in nearby recommendations:

| Plan | Price | Features |
|---|---|---|
| Basic | $29/month | Listed in nearby results |
| Featured | $59/month | Top placement with "Partner" badge |

Store recommendations are time-based:
- 7am–10am → Breakfast cafes and restaurants
- 12pm–2pm → Lunch spots
- 5pm–8pm → Dinner and shopping
- 8pm–10pm → Evening experiences

### Guide Partners
Independent tour guides join the platform:
- Guides earn **85%** of every booking
- SmartTrip takes **15%** commission
- Admin verifies guides before they can accept bookings

### Cab Drivers
- Drivers earn **85%** per completed ride
- SmartTrip takes **15%** commission
- Geospatial matching finds nearest available driver

---

## ⚡ Real-Time System

SmartTrip uses Socket.IO for real-time cab booking.

### Socket.IO Room Structure
```
user:{userId}       Receive ride updates and notifications
driver:{driverId}   Driver-specific messages  
city:{cityName}     Broadcast ride requests to all online drivers
```

### Cab Booking Flow
```
User requests cab
      ↓
MongoDB $near query finds drivers within 5km
      ↓
"new_ride_request" emitted to city:{cityName} room
      ↓
Driver app shows popup with 30-second countdown
      ↓
Driver accepts → OTP generated → user receives driver info
      ↓
Driver location emitted every 5 seconds → user sees live map
      ↓
User shares OTP with driver → driver enters OTP → ride starts
      ↓
Ride ends → fare added to trip budget tracker → user rates driver
```

### Events Reference

**Client → Server:**
- `request_cab` — user requests cab
- `accept_ride` — driver accepts a request
- `update_location` — driver sends GPS every 5 seconds
- `driver_arrived` — driver marks arrived at pickup
- `start_ride` — driver verifies OTP and starts
- `end_ride` — driver completes ride
- `driver_online` / `driver_offline` — driver availability toggle

**Server → Client:**
- `new_ride_request` — sent to all drivers in city
- `ride_accepted` — sent to user with driver details and OTP
- `driver_location_update` — live GPS to user
- `driver_arrived` — "Your driver is here!"
- `ride_completed` — fare summary to user
- `trip_notification` — reminders, suggestions, alerts

---

## 🔐 Security

### Layer 1 — Network
- `helmet()` sets CSP, HSTS, X-Frame-Options
- CORS restricted to `FRONTEND_URL` env variable only
- Rate limits: 100 req/15min general, 10 for auth, 5 for payments

### Layer 2 — Input
- `express-mongo-sanitize` prevents NoSQL injection
- `xss-clean` strips script tags from all inputs
- `hpp` prevents HTTP parameter pollution
- `express-validator` validates all fields

### Layer 3 — Authentication
- Passwords: bcryptjs with salt rounds 12
- Access token: 15-minute expiry, stored in React memory only
- Refresh token: 7-day expiry, httpOnly + Secure + SameSite cookie
- Refresh token hashed before storing in database

### Layer 4 — Authorization
- Role-based middleware: free, premium, guide, driver, hotel_partner, admin
- Trip limits enforced server-side (not just frontend)
- Users can only access their own trips, rides, and reviews
- Reviews verified against tripPlanId — visit confirmation required

### Layer 5 — Payments
- Stripe Checkout — no raw card data handled by our server
- Every webhook verifies Stripe signature before processing
- Idempotency keys prevent duplicate charges

### Layer 6 — Data Encryption
- Guide and driver bank details: AES-256-CBC encrypted at rest
- Cab OTP: bcrypt hashed before storing
- Encryption key in `.env` only, never in code

---

## 📁 Project Structure

```
smarttrip/
│
├── client/                          React + Vite frontend
│   ├── public/
│   │   ├── manifest.json            PWA manifest
│   │   └── sw.js                    Service Worker
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── PlaceCard.jsx
│       │   ├── FilterSidebar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── NotificationBell.jsx
│       │   ├── SearchBar.jsx
│       │   ├── EndOfTripSuggestions.jsx
│       │   └── ActiveTripBanner.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── CabContext.jsx
│       ├── hooks/
│       │   ├── useSocket.js
│       │   └── useGeolocation.js
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Explore.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Pricing.jsx
│       │   ├── PaymentSuccess.jsx
│       │   ├── SavedPlaces.jsx
│       │   ├── TripPlanner.jsx
│       │   ├── MyTrips.jsx
│       │   ├── TripTimeline.jsx
│       │   ├── BookCab.jsx
│       │   ├── PublicTransport.jsx
│       │   ├── WriteReview.jsx
│       │   ├── GuideDashboard.jsx
│       │   ├── DriverApp.jsx
│       │   ├── DriverRegister.jsx
│       │   ├── admin/
│       │   │   ├── AdminDashboard.jsx
│       │   │   └── HotelApplicationsPanel.jsx
│       │   └── hotelPartner/
│       │       ├── HotelPartnerRegister.jsx
│       │       └── HotelPartnerDashboard.jsx
│       ├── utils/
│       │   ├── axios.js             Interceptors and token refresh
│       │   └── imageUtils.js        Fallback images
│       └── App.jsx                  Router configuration
│
└── server/                          Node.js + Express backend
    ├── config/
    │   ├── db.js                    MongoDB connection
    │   ├── cloudinary.js            Cloudinary setup
    │   ├── apiConfig.js             External API keys
    │   └── transportConfig.js       Amadeus setup
    ├── controllers/
    │   ├── authController.js
    │   ├── placeController.js
    │   ├── tripController.js
    │   ├── hotelController.js
    │   ├── hotelPartnerController.js
    │   ├── guideController.js
    │   ├── cabController.js
    │   ├── driverController.js
    │   ├── transportController.js
    │   ├── reviewController.js
    │   ├── nearbyController.js
    │   ├── notificationController.js
    │   ├── subscriptionController.js
    │   ├── b2bController.js
    │   ├── activityController.js
    │   ├── endOfTripController.js
    │   └── adminController.js
    ├── middleware/
    │   ├── auth.js                  JWT verify and role guard
    │   ├── adminMiddleware.js        Admin-only access
    │   ├── hotelPartnerMiddleware.js Hotel partner access
    │   ├── tripLimitMiddleware.js    Trip creation limits
    │   └── roleMiddleware.js         Role-based access
    ├── models/
    │   ├── User.js
    │   ├── Place.js
    │   ├── TripPlan.js
    │   ├── Hotel.js
    │   ├── HotelApplication.js
    │   ├── Guide.js
    │   ├── CabDriver.js
    │   ├── CabRide.js
    │   ├── Store.js
    │   ├── Review.js
    │   ├── Subscription.js
    │   ├── B2BPartner.js
    │   ├── TripActivity.js
    │   └── Notification.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── placeRoutes.js
    │   ├── tripRoutes.js
    │   ├── hotelRoutes.js
    │   ├── hotelPartnerRoutes.js
    │   ├── guideRoutes.js
    │   ├── cabRoutes.js
    │   ├── driverRoutes.js
    │   ├── transportRoutes.js
    │   ├── reviewRoutes.js
    │   ├── nearbyRoutes.js
    │   ├── notificationRoutes.js
    │   ├── subscriptionRoutes.js
    │   ├── b2bRoutes.js
    │   ├── publicTransportRoutes.js
    │   └── adminRoutes.js
    ├── services/
    │   ├── socketService.js         Socket.IO rooms and events
    │   ├── notificationService.js   Email and in-app notifications
    │   ├── dynamicPlaceService.js   OpenTripMap + Unsplash integration
    │   ├── cacheService.js          node-cache wrapper
    │   └── endOfTripService.js      Nearby suggestions engine
    ├── jobs/
    │   └── cronJobs.js              All scheduled background tasks
    ├── utils/
    │   ├── encryption.js            AES-256 helpers
    │   ├── fareCalculator.js        Cab fare calculation
    │   ├── placeUtils.js            Category detection helpers
    │   └── placesData.js            Curated 100+ places fallback data
    ├── scripts/
    │   └── updatePlacesWithFilters.js  Seed script
    ├── .env                         Environment variables (not committed)
    ├── .env.example                 Template for env variables
    └── server.js                    Express + Socket.IO + cron setup
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `server/` directory:

```env
# ── SERVER ──
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# ── DATABASE ──
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smarttrip

# ── AUTH ──
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
ENCRYPTION_KEY=your_32_character_aes_key_here
ADMIN_SECRET_KEY=smarttrip_admin_2024

# ── STRIPE (USER SUBSCRIPTIONS) ──
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── STRIPE (HOTEL PARTNER) ──
STRIPE_HOTEL_WEBHOOK_SECRET=whsec_...
HOTEL_BASIC_PRICE_ID=price_...
HOTEL_FEATURED_PRICE_ID=price_...
HOTEL_PREMIUM_PRICE_ID=price_...

# ── CLOUDINARY ──
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── EXTERNAL APIS ──
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
RAILWAY_API_KEY=your_railway_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_key
GOOGLE_PLACES_API_KEY=your_google_places_key
OPENTRIPMAP_API_KEY=your_opentripmap_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# ── EMAIL ──
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_gmail_app_password

# ── WEB PUSH (PWA) ──
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18 or higher
- MongoDB Atlas account (free tier works)
- npm or yarn

### Step 1 — Clone the Repository
```bash
git clone https://github.com/yourusername/smarttrip.git
cd smarttrip
```

### Step 2 — Install Backend Dependencies
```bash
cd server
npm install
```

### Step 3 — Install Frontend Dependencies
```bash
cd ../client
npm install
```

### Step 4 — Configure Environment Variables
```bash
cd ../server
cp .env.example .env
# Edit .env with your actual values
```

### Step 5 — Seed the Database
```bash
cd server
node scripts/updatePlacesWithFilters.js
```

### Step 6 — Get Free API Keys

| API | Registration Link | Time |
|---|---|---|
| OpenTripMap | https://opentripmap.io/register | 2 min |
| Unsplash | https://unsplash.com/developers | 3 min |
| Amadeus | https://developers.amadeus.com | 5 min |
| Google Maps | https://console.cloud.google.com | 5 min |
| Cloudinary | https://cloudinary.com/users/register | 2 min |

---

## ▶️ Running the Project

### Development Mode

**Start Backend:**
```bash
cd server
npm run dev
# Server runs at http://localhost:5000
```

**Start Frontend:**
```bash
cd client
npm run dev
# App runs at http://localhost:5173
```

### Production Mode

**Build Frontend:**
```bash
cd client
npm run build
```

**Start Backend (production):**
```bash
cd server
NODE_ENV=production npm start
```

---

## 🖥 Admin Dashboard

Access the admin dashboard at `/admin/dashboard`.

To create an admin account, register with the admin secret key:

```json
POST /api/auth/register
{
  "name": "Admin Name",
  "email": "admin@smarttrip.com",
  "password": "SecurePass123!",
  "role": "admin",
  "adminSecretKey": "smarttrip_admin_2024"
}
```

**Admin Dashboard Sections:**
1. **Overview** — Stats cards, revenue chart, user distribution pie chart, pending actions
2. **Places Management** — Add, edit, delete places. Toggle featured and trending.
3. **Hotels Management** — Add partner hotels manually. Toggle partner status and tier.
4. **Hotel Applications** — Review hotel partner applications. Approve auto-creates hotel listing.
5. **Users Management** — View all users, change roles, ban accounts.
6. **Trips Management** — View all trips by status. See full trip details.
7. **Guides Management** — Verify or reject guide applications.
8. **Drivers Management** — Verify or reject driver applications with document review.
9. **Reviews Management** — Approve or reject user reviews.
10. **Revenue & Subscriptions** — Monthly revenue chart, subscription list.

---

## 💳 Payment Integration

SmartTrip uses **Stripe** for all payments.

### User Subscriptions
- Monthly Plan: $9.99/month
- Yearly Plan: $79.99/year
- Webhook event: `checkout.session.completed` → upgrades user to premium
- Renewal event: `invoice.payment_succeeded` → resets premiumTripsUsed to 0
- Cancellation: `customer.subscription.deleted` → downgrades to free

### Hotel Partner Subscriptions
- Basic: $49/month
- Featured: $99/month
- Premium: $149/month
- Separate webhook secret for hotel partner events

### Testing Payments (Stripe Test Mode)
Use these test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires auth: `4000 0025 0000 3155`

---

## ⏰ Background Jobs

All cron jobs run in `server/jobs/cronJobs.js`:

| Schedule | Job | Description |
|---|---|---|
| Every 1 hour | Notification Scheduler | Sends due trip reminders via email and in-app |
| Every 1 hour | Store Recommendations | Time-based partner store suggestions for active trips |
| Every 6 hours | End-of-Trip Engine | Suggests nearby places for remaining budget and time |
| Every 24 hours | Trip Deactivator | Marks expired trips as completed |
| On Stripe webhook | Trip Reset | Resets premiumTripsUsed to 0 on subscription renewal |

**Trip Reminder Schedule:**
- 7 days before: "Your trip to [Destination] is in 7 days!"
- 3 days before: "3 days to go! Check your hotel and transport details"
- 1 day before: "Tomorrow is the day! Your complete trip summary"
- Day of trip: "Have an amazing trip to [Destination]! 🌍"

---

## 🌐 External APIs Used

### OpenTripMap (Dynamic Place Search)
- Used for: Finding tourist attractions for any city worldwide
- Free tier: 1000 requests/day
- Endpoint: `https://api.opentripmap.com/0.1/en/places/radius`
- Results cached for 1 hour using node-cache

### Unsplash (Place Photos)
- Used for: Getting real photos for dynamically searched places
- Free tier: 50 requests/hour
- Results cached to minimize API calls

### OpenStreetMap Nominatim (Geocoding)
- Used for: Converting city names to lat/lng coordinates
- Completely free, no API key required
- Rate limit: 1 request/second (handled by caching)

### Google Maps Directions (Transit)
- Used for: Step-by-step public transport routing
- Returns: Bus numbers, metro lines, walking steps, timing

### Amadeus (Flights)
- Used for: Flight search for premium users
- Free tier: 1000 requests/day
- Graceful fallback if API key not configured

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- Use async/await for all asynchronous operations
- Add try/catch to every controller function
- Validate all inputs with express-validator
- Never commit `.env` files
- Add console.log only for development, remove for production

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

Built with ❤️ for travelers by the SmartTrip team.

**SmartTrip** — *Find your perfect destination. Plan your perfect trip.*

---

*Last updated: March 2026*

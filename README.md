# SAFE_HER

**An AI-Powered Safety App for Women**

We chose this topic because safety is not a privilege; it is a basic right. Every day, many women feel unsafe while traveling, walking alone, or even in familiar places. The biggest problem is not just danger, but the lack of instant help at the right moment.

Most existing solutions are slow, complicated, or depend too much on manual action. In real stressful situations, a person may not even get the chance to react. That’s why we created something smart, fast, and reliable—an app that can protect even when the user cannot consciously ask for help.

Our goal is simple: to turn fear into confidence and make every woman feel safe, anytime, anywhere.

---

## Key Features

- **Safety-Based Route Options (AI Risk Scoring)**: Suggests not only the shortest but the safest route. It calculates risk using nearby unsafe reports, the time of day, and the frequency of incidents that occurred on that route or place. We use AI to help the user understand why the route is risky. Risk score ranges from 0 to 100 (Safe / Moderate / High).
- **Real-Time Unsafe Area Heatmap**: Displays high-risk zones visually on the map. Intensity increases with the number of incidents and updates dynamically based on reports, helping users avoid dangerous or suspicious areas proactively.
- **SOS Emergency (One-Tap or Voice Speech)**: Sends your current live location via SMS to your selected emergency contacts. It generates Google Maps tracking links, designed specifically for high-stress situations.
- **Community Safety Reporting**: Users can mark unsafe areas and report incidents. These get reviewed within 24 hours to verify their authenticity.
- **Safety Assistant Chat**: An integrated assistant that provides immediate safety steps, preventive tips, and context-aware advice, guiding users through stressful situations.
- **Smart Night-Time Protection Mode**: Automatically activates enhanced safety functionalities during night hours, including auto-enabling location sharing.

## Unique Selling Proposition (USP)

- **Voice-Activated SOS (Premium)**: Trigger emergency help with a simple code word like "Bachao".
- **Trip Mode + Snatch Detection (Premium)**: Detects sudden abnormal movement and activates a fake shutdown screen while secretly recording video and sending the live location.
- **Smart Route Lock**: Instantly triggers alerts if your route deviates unexpectedly.
- **Guardian on Demand (Volunteer-based)**: Book a real-time safety companion when feeling vulnerable.
- **Safety Score Marketplace**: Discover and navigate through verified "safe zones" and trusted businesses.
- **Gamified Safety (Daily Rewards)**: Users earn points for reporting unsafe areas and consistently choosing safer routes.

## Revenue Model

- **B2B Corporate Tie-ups**: Companies subscribe to provide advanced safety solutions for their employees.
- **Government & NGO Partnerships**: Collaborative funding for large-scale deployment and access to anonymized safety data.
- **Verified Driver Program**: Cab drivers pay to receive a "Safe Verified" badge, leading to higher trust and more bookings.
- **Local Business Listings**: Businesses pay to be featured as "Safe Spot Verified" on our map.

---

## Project Structure

```text
HackIndia_safe_her/
│
├── client/                  # React Native / Expo Frontend
│   ├── app/
│   │   └── (tabs)/
│   │       ├── _layout.tsx
│   │       ├── help.tsx
│   │       ├── home.tsx
│   │       ├── map.tsx
│   │       └── settings.tsx
│   ├── assets/
│   ├── components/
│   └── package.json
│
└── server/                  # Golang Backend
    ├── cmd/
    │   └── server/
    │       └── main.go
    ├── internal/
    │   ├── ai/              # AI integrations
    │   ├── database/        # Database connections
    │   ├── handlers/        # API Handlers
    │   ├── middlewares/     # Authentication & Server Middlewares
    │   ├── models/          # Data Models
    │   ├── routes/          # API Routes
    │   └── websocket/       # Real-time WebSockets
    ├── pkg/                 # Helpers
    ├── services/            # Business Logic
    └── go.mod
```

---

## How to Set Up Locally

### Prerequisites
- [Go](https://go.dev/doc/install) (1.20 or later)
- [Node.js](https://nodejs.org/) (v16 or later)
- [PostgreSQL](https://www.postgresql.org/) (or your preferred database, as configured)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### 1. Clone the Repository
```bash
git clone git@github.com:nishidhx/HackIndia_safe_her.git
cd HackIndia_safe_her
```

### 2. Backend Setup (Golang)
```bash
# Navigate to the server directory
cd server

# Install dependencies
go mod tidy

# Set up your environment variables
# Create a .env file based on the provided configuration (e.g., DB connection, JWT secret)

# Run the server
go run cmd/server/main.go
```
*The backend server will start (usually on port 8080).*

### 3. Frontend Setup (React Native / Expo)
```bash
# Open a new terminal and navigate to the client directory
cd client

# Install Node dependencies
npm install

# make android folder
npx expo prebuild

# Start the Expo development server
npx expo start or npm run start
```
*Use the Expo Go app on your phone to scan the QR code and test the app live, or press `a` to run on an Android emulator / `i` to run on an iOS simulator.*
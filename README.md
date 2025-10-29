# 🌿 GreenForce – Sustainability Dashboard with Agentic AI & IBM watsonx Orchestrate

GreenForce is a **demo project** that uses **agentic AI** and **IBM watsonx Orchestrate** to monitor environmental metrics and trigger sustainability workflows automatically. It’s built with **Next.js + TypeScript** (frontend with IBM Carbon Design System) and **FastAPI** (Python backend).

## 🧩 Project Structure

```

greenforce/
├── backend/               # Python FastAPI backend
│   ├── main.py
│   ├── orchestrate_agent.py
│   ├── .env
│   ├── pyproject.toml
│   └── .venv/ (managed by uv)
└── frontend/              # Next.js + TypeScript frontend
├── pages/
│   └── index.tsx
├── components/
│   └── MetricCard.tsx
├── styles/
│   └── globals.scss
├── package.json
├── tsconfig.json
└── pages/_app.tsx

```

## ⚙️ Prerequisites

- Node.js ≥ 18.x
- Python ≥ 3.10
- `uv` package manager

## 🏃‍♂️ Running the Project

### 1️⃣ Backend Setup

1. Navigate to the backend folder:

```bash
  cd backend
```

2. Install dependencies:

```bash
  uv install
```

3. Create a `.env` file:

```bash
  cp .env.example .env
```

Fill in your IBM credentials:

```env
  IBM_ORCH_URL=https://api.ibm.com/watsonx/orchestrate/v1/workflows
  IBM_API_KEY=<your_ibm_api_key>
  IBM_TOKEN_URL=https://iam.cloud.ibm.com/identity/token
```

4. Run the backend server:

```bash
  uv run main:app
```

The backend will be running at [http://localhost:8000](http://localhost:8000).

### 2️⃣ Frontend Setup

1. Navigate to the frontend folder:

```bash
  cd frontend
```

2. Install Node dependencies:

```bash
  npm install
```

3. Start the frontend server:

```bash
  npm run dev
```

The frontend will be running at [http://localhost:3000](http://localhost:3000).

## 🖥️ Usage

1. Open [http://localhost:3000](http://localhost:3000)
2. You will see the **GreenForce Dashboard** with three metrics:

   * CO₂ Emissions (tons)
   * Waste Level (%)
   * Energy Usage (kWh)
3. Click **“Analyze & Trigger Workflows”**

   * The backend analyzes the metrics
   * IBM watsonx Orchestrate workflows are triggered automatically
4. Triggered workflows will display in a Carbon `Tile` below the button

## 🧰 Key Technologies

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Frontend | Next.js 14 + TypeScript + IBM Carbon Design |
| Backend  | Python 3.10 + FastAPI + Requests            |
| AI Logic | Agentic AI reasoning on sustainability data |
| Workflow | IBM watsonx Orchestrate                     |

## 🔧 Folder Highlights

* **backend/orchestrate_agent.py** – Handles agentic AI reasoning and triggers IBM Orchestrate workflows.
* **frontend/components/MetricCard.tsx** – Reusable UI component for displaying metrics.
* **frontend/pages/index.tsx** – Main dashboard page with Carbon Design System components.
* **frontend/styles/globals.scss** – Custom styles + Carbon theme overrides.

## 🚀 Next Steps (Optional)

* Add **Carbon DataTable** to visualize metric trends over time.
* Add **ProgressBar** to show workflow completion percentages.
* Containerize with **Docker + docker-compose** for one-command startup.
* Deploy backend to **IBM Cloud Functions** or **Cloud Run**.

## 📦 Deployment

1. Build frontend for production:

```bash
  cd frontend
  npm run build
  npm run start
```

2. Backend can be deployed to **IBM Cloud**.

## ⚖️ License

MIT License – feel free to reuse and adapt for hackathons and demos.
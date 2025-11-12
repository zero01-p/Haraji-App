Haraji

A mobile-first web app cashier and tax assistant for Nigerian MSMEs.

1. What Haraji Does

Haraji is a mobile-first web application that transforms a smartphone into a simple point-of-sale (cashier) system that automatically calculates tax obligations for Micro, Small, and Medium Enterprises (MSMEs) in Nigeria.

It is designed to demystify tax compliance for entrepreneurs with low-to-moderate digital literacy, turning fear and complexity into clarity and control. The app is fully bilingual (English and Hausa) to maximize accessibility.

The Problem We Solve

Nigeria's 39.6 million MSMEs contribute 50% of the GDP but often operate in a cash-heavy, manual world. Tax compliance is a major pain point due to:

Fear & Complexity: The Nigerian tax system is difficult to navigate, leading to stress and avoidance.

Manual Bookkeeping: Most tracking is done with pen and paper, which is error-prone and time-consuming.

Financial Risk: Failure to comply can result in crippling penalties that threaten livelihoods.

Market Gap: Existing digital tools are often too complex (bookkeeping-focused) or too expensive (traditional accountants).

The new 2026 tax laws will amplify this problem, creating an urgent need for a simple, accessible solution. Haraji is that solution.

Key Features

Simple Transaction Tracking: Easily log sales and expenses with a "cashier-first" interface.

Automated Tax Estimation: Automatically calculates estimated liabilities (e.g., CIT, VAT, Development Levy) based on financial records.

Bilingual Interface: Full, seamless support for both English and Hausa.

Educational Hub: Simple, accessible learning resources on taxes, financial literacy, and MSME support.

Data Export: Download transaction history as a CSV file for reporting.

Tax Deadline Notifications: Receive alerts for important filing dates.

2. Technical Overview

This project is a web application built with standard, "vanilla" web technologies, ensuring it is lightweight and accessible on any device with a web browser. It utilizes Firebase for backend services.

Core Tech Stack:

Frontend: HTML5, CSS3, JavaScript (ES6+)

Backend (BaaS): Firebase (Auth, Firestore, Functions)

3. 🚀 Setup and Installation

Follow these instructions to get the project running on your local machine for development and testing.

1. Prerequisites

Ensure you have the following software installed on your system:

Node.js (v18 or newer recommended) - This is used to run a simple local web server.

A modern web browser (e.g., Chrome, Firefox, Safari).

2. Clone the Repository

git clone [https://github.com/your-organization/haraji-app.git](https://github.com/your-organization/haraji-app.git)
cd haraji


3. Configure Environment

This project uses Firebase for its backend. You will need to create a config.js file to store your Firebase credentials.

In the root of the project, create a file named config.js.

Add your Firebase project configuration to this file. You can get this from the Firebase Console by creating a new project and adding a "Web" app.

config.js

// IMPORTANT: This file should be listed in your .gitignore to avoid committing secret keys!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};


Ensure your main index.html file (or relevant JavaScript file) imports this config:

<!-- Add this to your index.html before your main app.js -->
<script src="config.js"></script>
<script src="app.js"></script> 


4. Run the Application

To run the web app, you should use a local server. This avoids issues with browser security (CORS) that can happen when loading files directly from the filesystem (file:///...).

A simple way to do this is using the serve package:

Install serve globally (you only need to do this once):

npm install -g serve


From within the haraji project directory, run:

serve


Open your browser and navigate to the URL it provides (usually http://localhost:3000).

You can now use and test the Haraji web app locally!

4. 🤝 Contributing

We welcome contributions to Haraji! Please read our CONTRIBUTING.md file for details on our code of conduct, bug reporting, and the process for submitting pull requests.

5. 📝 License

This project is licensed under the MIT License. See the LICENSE file for full details.

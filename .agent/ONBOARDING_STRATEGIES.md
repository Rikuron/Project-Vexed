# Approaches to User Guidance (Solving the Blank Canvas)

The goal is to solve the "blank canvas" problem for new users—helping them understand what Vexed is and how to use it—without unnecessarily compromising your minimal, ChatGPT-like interface. 

Here are the high-level approaches you can take, ranging from heavy (traditional) to light (minimal):

## 1. The Dedicated Landing Page
**What it is:** A traditional marketing page (e.g., the root `/` route) that explains the value proposition, shows screenshots, and clearly outlines the two sides of the platform (Posters vs. Solvers) before the user ever enters the actual app (which could live at `/app`).
**Pros:** 
- Great for SEO and sharing on social media.
- Gives you unlimited space to explain the platform.
- Allows the actual app interface to remain 100% minimal since all education happens before they enter.
**Cons:** 
- Adds friction; users have to read a page and click "Launch App" or "Login" to get to the core experience.

## 2. A Formal Onboarding Process (The "Setup Flow")
**What it is:** A one-time, step-by-step wizard that users go through immediately after signing up, but before they see the main app. It could ask them to identify their role (Poster or Solver) and guide them through submitting their first problem as part of the setup.
**Pros:** 
- Ensures every registered user understands their role and how the app works.
- Highly interactive and can be used to gather initial data (e.g., "What technologies do you use?").
**Cons:** 
- Requires building a separate set of screens and managing "has_onboarded" state in your database.

## 3. Implicit UI Cues (The "ChatGPT" Approach)
**What it is:** Using the "empty state" of the app to educate the user. This means dynamic placeholders in the input box, or 3-4 clickable "Example Vexations" hovering above the text input. The app itself is the landing page.
**Pros:** 
- Zero friction. The user is instantly in the app.
- Strictly maintains the absolute minimal design.
**Cons:** 
- Might not be enough context for non-technical users to grasp the complex "Solver" side of the platform just by looking at a text box.

## 4. The Interactive Sandbox (Try Before You Sign Up)
**What it is:** The homepage *is* the app, but pre-populated with dummy/demo data. Unauthenticated users can play around, see how Vexations look, type in the box, or click a solution. The moment they try to actually submit or vote, a "Sign up to continue" modal appears.
**Pros:** 
- "Show, don't tell." Users get the "Aha!" moment immediately by playing with the product.
- Highly engaging and modern.
**Cons:** 
- Can be technically complex to implement (handling anonymous/demo state vs. real database state).

## 5. In-App Tooltips / Joyride Tour
**What it is:** The user is dropped directly into the minimal app, but the screen dims, and a sequence of spotlights highlights exactly what to do (e.g., "1. Type your problem here", "2. See solutions here").
**Pros:** 
- Teaches the user *in context* on the actual interface they will be using.
**Cons:** 
- Many users instinctively close or skip these tours because they feel intrusive.

## 6. The "Hero Video" Overlay
**What it is:** The root URL shows your minimal app interface, but it's blurred out or overlaid with a beautiful, 15-second looping video/GIF showing a cursor typing a problem and developers answering it. Below it is a single "Get Started" button.
**Pros:** 
- Highly visual and feels very premium.
- Explains the platform perfectly without requiring the user to read paragraphs of text.
**Cons:** 
- Requires creating, editing, and updating a high-quality video asset whenever the UI changes.

---
**Summary:**
If your supervisor wants to maximize clarity for *all* types of visitors, a **Dedicated Landing Page (1)** is the safest bet. If you want to aggressively protect your minimal aesthetic, **Implicit UI Cues (3)** or the **Interactive Sandbox (4)** are the most modern, seamless ways to do it.

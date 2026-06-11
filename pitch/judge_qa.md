# Judge Q&A Prep — Zenway (RailMind Sentinel)

### Q1: Why use a pure math formula instead of a deep learning model for the crowd surge score?
**A:** In high-risk safety environments like railway operations, explainability is a legal and operational requirement. If a platform is marked "Critical," the station master and security forces must know *why* (e.g. "three delayed trains converging, adding 1,320 passengers"). A black-box neural network cannot explain its output dynamically, making audit and rapid trust impossible. Furthermore, pure math calculations have zero inference cost and compile in microseconds.

---

### Q2: What happens if Gemini or Bhashini APIs go down during a live surge event?
**A:** Zenway is built with a **Fast Recovery** policy. If external LLM or translation APIs fail, the system falls back to locally-cached emergency templates based on the station and platform. The platform remains fully functional, and a "Cached Mode" warning lights up on the dashboard. The pipeline never crashes.

---

### Q3: How do you verify passenger numbers?
**A:** Zenway uses ticket booking averages from Indian Railways reservation database APIs (IRCTC/FOIS class breakdowns). Each train class has historical passenger densities (e.g. Sleeper coaches carry roughly 80 passengers, AC coaches 72). By multiplying coach configuration counts, we determine estimated train volumes.

---

### Q4: Why is there a "Confirm & Broadcast" button instead of automated broadcasting?
**A:** Automatically broadcasting emergency alerts or moving RPF forces without operator validation can trigger widespread station panic, leading to stampedes or confusion. Keeping a human (the station master) in control ensures that the digital prediction matches the real-world station status before broadcast keys are triggered.

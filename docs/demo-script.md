# Interactive Judging Demo Script — Zenway (RailMind Sentinel)

Follow these steps to evaluate the Zenway platform:

---

## Scenario 1: Normal Operations
1. Load the dashboard in your browser with `?demo=true&scenario=normal`.
2. Observe the **glowing status indicator** reading `JUDGE DEMO MODE — Scenario: NORMAL`.
3. Note that the **circular risk gauge** remains at `25%` (level: Normal, Green).
4. Verify the **incoming trains list** shows all trains on time (no active delays).
5. Hover or click on the risk gauge to open the **Explainability Audit** and observe the formula outputting `25%` based purely on typical off-peak base load.

---

## Scenario 2: Elevated Congestion
1. Select **Elevated** from the dropdown menu in the control panel.
2. Press **Run Scenario** to begin the simulation playback.
3. Watch the scrubber advance from `0` to `60` seconds (representing 2 hours of virtual time).
4. Observe the train delays updating: two trains are delayed by 30 minutes.
5. Watch the circular risk gauge climb from `35%` to `58%` (level: Elevated, Amber).
6. Verify that no alert cards or PA scripts are triggered (since the score does not cross 76).

---

## Scenario 3: Critical Surge Mitigation (The New Delhi Stampede Replay)
1. Select **Critical** from the dropdown menu.
2. Click the **Reset** button to start the clock at `0` seconds.
3. Click **Run Scenario** and watch the timeline scrub:
   - **0s (10:00 AM):** Trains delayed slightly. Risk score is `45%` (Normal).
   - **15s (10:30 AM):** Delays compound to 25 mins. Score climbs to `68%` (Elevated, Amber).
   - **30s (11:00 AM):** Delays compound to 30-45 mins. Three massive trains converge on Platform 1. The score hits `91%` (Critical, Red).
4. Immediately at `30s`, observe the **Critical Alert Card** flash onto the screen:
   - Read the Gemini-generated **Mitigation Summary** and the **5 Required Dispatch Procedures**.
   - Note the **AI Confidence Score**.
5. Expand the **AI Reasoning Trace** at the bottom of the card to see the actual inputs and outputs of each LangGraph node.
6. Click **Listen PA Audio** in the Bhashini PA Panel and listen to the announcement read aloud by your browser. Switch tabs (Hindi, Bengali, etc.) and hear the translation play!
7. Click the big red **Confirm & Broadcast Alert** button. Observe the badge change to `Broadcast Initiated` (satisfying the Human-in-Control gate).
8. Scroll down to the **Audit Log Console** to see the chronological chain of events logged.
9. Click **Live Mode** to exit the demo and view live simulated updates.

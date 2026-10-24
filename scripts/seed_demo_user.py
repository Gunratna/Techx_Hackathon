"""Seed fictional history through the running deterministic analyzer; no AI service."""
import json, random, uuid, datetime, time, requests
from pathlib import Path
from tqdm import tqdm

random.seed(7)
API = "http://localhost:3000/api/analyze-checkin"
START = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5, minutes=30))).date() - datetime.timedelta(days=30)
HARD, PRE = set(range(8, 13)) | set(range(20, 25)), {5, 6, 7, 17, 18, 19}
GOOD = [("Walked on the terrace after work, called Amma.", ""),
        ("Finished the sprint ticket early, cricket in the evening.", ""),
        ("Dinner with Riya at the dosa place. Slept by 11.", ""),
        ("Made a to-do list and actually did it.", "Bit tired from meetings.")]
PRE_T = [("Work was okay I guess.", "Skipped dinner, just had chips. Stayed up till 2 on reels."),
         ("Nothing much.", "Didn't reply to Riya again."),
         ("Got the build to pass.", "Slept at 3, woke at 7. Ate only snacks.")]
HARD_T = [("", "Couldn't get out of bed till 11. Cancelled plans. Everything feels heavy."),
          ("", "Ignored everyone's messages. Felt useless at work."),
          ("Amma called.", "Didn't eat properly again. Just lay there scrolling.")]
signals = [{"id": "skipped_meals", "text": "skipping dinner", "source": "survey", "count": 0, "active": True},
           {"id": "late_nights", "text": "sleeping after 2am", "source": "survey", "count": 0, "active": True},
           {"id": "ignoring_riya", "text": "not replying to Riya", "source": "survey", "count": 0, "active": True}]

checkins, t0 = [], time.time()
for d in tqdm(range(30), desc="Seeding Ananya (fictional)", unit="day"):
    if d in (15, 26):
        continue  # silent days
    kind = "hard" if d in HARD else "pre" if d in PRE else "good"
    good, hard = random.choice({"hard": HARD_T, "pre": PRE_T, "good": GOOD}[kind])
    sleep = {"hard": random.choice([4, 5, None]), "pre": random.choice([4, 5]), "good": random.choice([7, 8, None])}[kind]
    label = {"hard": "bad", "pre": None, "good": "good"}[kind] if random.random() < 0.6 else None
    try:
        r = requests.post(API, json={"goodNote": good, "hardNote": hard, "sleepHoursInput": sleep, "signals": signals}, timeout=60)
        r.raise_for_status()
        features = r.json()["features"]
        for evidence in features["evidence"]:
            assert evidence["quote"] in good or evidence["quote"] in hard
    except Exception as e:
        raise RuntimeError(f"day {d}: analyzer unavailable; start the local app and retry") from e
    checkins.append({"id": str(uuid.uuid5(uuid.NAMESPACE_DNS, f"mannsetu-fictional-ananya-{d}")), "date": str(START + datetime.timedelta(days=d)), "goodNote": good,
                     "hardNote": hard, "inputMode": "text", "userLabel": label, "sleepHoursInput": sleep,
                     "features": features, "modelP": None, "driftFeedback": None})

profile = {"name": "Ananya (fictional demo user)", "who5Raw": 13,
           "badDayDescription": "I stop eating properly, stay up late and go quiet",
           "helpfulActions": ["walk on the terrace", "call Amma", "make a simple to-do list"],
           "trustedPerson": {"name": "Riya", "relation": "friend"}, "signals": signals,
           "prefs": {"languages": ["English", "Tamil"], "budgetPerSession": 1500, "mode": "either",
                     "providerGender": "any", "readiness": "talk_to_someone", "city": "Chennai", "location": None},
           "createdAt": str(START)}
output = Path(__file__).resolve().parents[1] / "public" / "demo-user.json"
output.parent.mkdir(parents=True, exist_ok=True)
with output.open("w", encoding="utf-8") as handle:
    json.dump({"profile": profile, "model": None, "checkins": checkins, "consentAt": str(START)}, handle, indent=2, ensure_ascii=False)
print(f"Wrote {len(checkins)} check-ins in {time.time() - t0:.1f}s -> public/demo-user.json")

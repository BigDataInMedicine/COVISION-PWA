import { Database } from "../src/db/Database";
import { version } from "../src/context/version";

const sessionKeys = [
  "sessionType",
  "activities",
  "durationInMinutes",
  "endReason",
  "fatigue1",
  "fatigue2",
  "last_survey_opinion",
  "mood",
  "performance1",
  "performance2",
  "recovery",
  "remainingTimeInSeconds",
  "substances",
  "symptomsMental",
  "symptomsPhysical",
  "matching",
  "stroopAudio",
  "stroopWordCount",
  "stroopWords",
  "stroopTrialStartMs",
  "stroopTrialStart",
  "memoryAudio",
  "memoryWords",
  "testDoneAt",
  "no_test_previous",
  "noTestNow",
  "sleep",
  "device_informations",
  "device_id",
  "testNumber",
  "workHoursTotal",
  "workHoursHome",
  "illnessOverall",
  "illnesssesWhich",
  "illnessesDays",
  "mensOverall",
  "mensDays",
  "symptomsAll",
  "symptomsAsk",
  "error"
];

/**
 * Collects all relevant sessionStorage data into an object.
 */
function collectSessionData(): Record<string, any> {
  const obj: Record<string, any> = {};
  sessionKeys.forEach((key) => {
    const value = sessionStorage.getItem(key);
    if (value !== null) {
      try {
        obj[key] = JSON.parse(value);
      } catch {
        obj[key] = value;
      }
    }
  });

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith("time_")) {
      if (!(key in obj)) {
        // verhindert doppelte Einträge
        const value = sessionStorage.getItem(key);
        if (value !== null) {
          try {
            obj[key] = JSON.parse(value);
          } catch {
            obj[key] = value;
          }
        }
      }
    }
  }

  return obj;
}

/**
 * Saves to IndexedDB, overwriting the same record for the same session
 * if called multiple times during the test. The 'isComplete' flag
 * indicates whether this is a final or partial save.
 */
export async function saveSession(isComplete: boolean = false) {
  const obj = collectSessionData();

  if (Object.keys(obj).length > 0) {
    const db = Database.getInstance();

    // Use persistent ID for the current test session, so we overwrite it
    let sessionId = localStorage.getItem("currentSessionId");

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("currentSessionId", sessionId);
    }

    await db.update("tests", {
      id: sessionId, // MUST match keyPath "id" for overwriting
      ...obj,
      isComplete,
      savedAt: new Date().toLocaleString(),
      appVersion: version,
    });
  }
}

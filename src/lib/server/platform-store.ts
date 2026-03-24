import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  applyRollingScores,
  defaultPlatformState,
  sortScores,
  updateExistingScore,
  type PaymentStatus,
  type PlatformState,
  type ProofStatus,
  type SubscriptionStatus,
} from "@/lib/platform-data";

const storePath = path.join(process.cwd(), "data", "platform-state.json");

export async function readPlatformState(): Promise<PlatformState> {
  try {
    const raw = await readFile(storePath, "utf8");
    return JSON.parse(raw) as PlatformState;
  } catch {
    await writePlatformState(defaultPlatformState);
    return structuredClone(defaultPlatformState);
  }
}

export async function writePlatformState(state: PlatformState) {
  await writeFile(storePath, JSON.stringify(state, null, 2), "utf8");
}

type ActionPayload =
  | { type: "renew_subscription"; subscriberId: number }
  | { type: "cancel_subscription"; subscriberId: number }
  | { type: "save_score"; subscriberId: number; points: number; date: string; scoreId?: number | null }
  | { type: "update_charity_preference"; subscriberId: number; charityId: number; charityPercent: number }
  | { type: "submit_proof"; subscriberId: number; proofNote: string }
  | { type: "set_subscription_status"; subscriberId: number; status: SubscriptionStatus }
  | { type: "nudge_score"; subscriberId: number; delta: number }
  | { type: "winner_action"; subscriberId: number; proofStatus: ProofStatus; paymentStatus: PaymentStatus }
  | { type: "add_charity"; name: string; focus: string }
  | { type: "delete_charity"; charityId: number }
  | { type: "toggle_featured_charity"; charityId: number };

export async function applyPlatformAction(action: ActionPayload) {
  const state = await readPlatformState();

  switch (action.type) {
    case "renew_subscription":
    case "cancel_subscription":
    case "set_subscription_status":
    case "save_score":
    case "update_charity_preference":
    case "submit_proof":
    case "nudge_score":
    case "winner_action": {
      state.subscribers = state.subscribers.map((subscriber) => {
        if (subscriber.id !== action.subscriberId) {
          return subscriber;
        }

        switch (action.type) {
          case "renew_subscription":
            return { ...subscriber, subscriptionStatus: "Active", upcomingDraws: 1 };
          case "cancel_subscription":
            return { ...subscriber, subscriptionStatus: "Cancelled", upcomingDraws: 0 };
          case "set_subscription_status":
            return {
              ...subscriber,
              subscriptionStatus: action.status,
              upcomingDraws: action.status === "Active" ? 1 : 0,
            };
          case "save_score": {
            if (action.scoreId) {
              return {
                ...subscriber,
                scores: updateExistingScore(subscriber.scores, action.scoreId, action.points, action.date),
              };
            }

            return {
              ...subscriber,
              scores: applyRollingScores(subscriber.scores, {
                id: Date.now(),
                points: action.points,
                date: action.date,
              }),
            };
          }
          case "update_charity_preference":
            return {
              ...subscriber,
              charityId: action.charityId,
              charityPercent: Math.max(10, action.charityPercent),
            };
          case "submit_proof":
            return {
              ...subscriber,
              proofStatus: "Submitted",
              proofNote: action.proofNote,
            };
          case "nudge_score": {
            if (subscriber.scores.length === 0) {
              return subscriber;
            }
            const latestScores = sortScores(subscriber.scores);
            const [latest, ...rest] = latestScores;
            const nextPoints = Math.min(45, Math.max(1, latest.points + action.delta));
            return {
              ...subscriber,
              scores: [{ ...latest, points: nextPoints }, ...rest],
            };
          }
          case "winner_action":
            return {
              ...subscriber,
              proofStatus: action.proofStatus,
              paymentStatus: action.paymentStatus,
            };
        }
      });
      break;
    }
    case "add_charity": {
      state.charities.push({
        id: Date.now(),
        name: action.name,
        focus: action.focus,
        description: "New charity listing added from the admin workspace.",
        image: "Awaiting uploaded media",
        featured: false,
        events: ["Admin-created event"],
      });
      break;
    }
    case "delete_charity":
      state.charities = state.charities.filter((charity) => charity.id !== action.charityId);
      break;
    case "toggle_featured_charity":
      state.charities = state.charities.map((charity) =>
        charity.id === action.charityId ? { ...charity, featured: !charity.featured } : charity,
      );
      break;
  }

  await writePlatformState(state);
  return state;
}

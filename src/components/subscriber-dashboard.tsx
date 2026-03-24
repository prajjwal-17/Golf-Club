"use client";

import { useEffect, useMemo, useState } from "react";
import {
  defaultPlatformState,
  formatCurrency,
  formatDate,
  getSubscriberDonation,
  plans,
  sortScores,
  type PlatformState,
} from "@/lib/platform-data";

const PRIMARY_SUBSCRIBER_ID = 101;

export function SubscriberDashboard() {
  const [platformState, setPlatformState] = useState<PlatformState>(defaultPlatformState);
  const [points, setPoints] = useState(32);
  const [date, setDate] = useState("2026-03-24");
  const [editingScoreId, setEditingScoreId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("Member dashboard is ready for scoring, charity updates, and proof handling.");
  const [proofNote, setProofNote] = useState(defaultPlatformState.subscribers[0]?.proofNote ?? "");

  async function refreshState() {
    const response = await fetch("/api/platform-state");
    const state = (await response.json()) as PlatformState;
    setPlatformState(state);
    const subscriber = state.subscribers.find((entry) => entry.id === PRIMARY_SUBSCRIBER_ID) ?? state.subscribers[0];
    if (subscriber) {
      setProofNote(subscriber.proofNote);
    }
  }

  async function applyAction(action: Record<string, unknown>, successMessage: string) {
    const response = await fetch("/api/platform-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action),
    });
    const state = (await response.json()) as PlatformState;
    setPlatformState(state);
    const subscriber = state.subscribers.find((entry) => entry.id === PRIMARY_SUBSCRIBER_ID) ?? state.subscribers[0];
    if (subscriber) {
      setProofNote(subscriber.proofNote);
    }
    setStatusMessage(successMessage);
  }

  useEffect(() => {
    void refreshState();
  }, []);

  const subscriber = platformState.subscribers.find((entry) => entry.id === PRIMARY_SUBSCRIBER_ID) ?? platformState.subscribers[0];
  const sortedScores = useMemo(() => (subscriber ? sortScores(subscriber.scores) : []), [subscriber]);

  if (!subscriber) {
    return null;
  }

  const selectedCharity = platformState.charities.find((charity) => charity.id === subscriber.charityId) ?? platformState.charities[0];
  const monthlyContribution = getSubscriberDonation(subscriber);
  const plan = plans[subscriber.plan];

  function resetScoreForm() {
    setPoints(32);
    setDate("2026-03-24");
    setEditingScoreId(null);
  }

  async function handleSaveScore(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await applyAction(
      {
        type: "save_score",
        subscriberId: subscriber.id,
        points,
        date,
        scoreId: editingScoreId,
      },
      editingScoreId ? "Existing score updated and re-sorted into reverse chronological order." : "New score added. Only the latest five scores are retained.",
    );
    resetScoreForm();
  }

  function handleEditScore(scoreId: number) {
    const score = sortedScores.find((entry) => entry.id === scoreId);
    if (!score) return;
    setEditingScoreId(score.id);
    setPoints(score.points);
    setDate(score.date);
    setStatusMessage("Editing mode enabled for the selected Stableford score.");
  }

  async function handleCharityUpdate(nextCharityId: number, nextPercent: number) {
    await applyAction(
      {
        type: "update_charity_preference",
        subscriberId: subscriber.id,
        charityId: nextCharityId,
        charityPercent: nextPercent,
      },
      "Charity recipient and contribution percentage updated successfully.",
    );
  }

  async function handleSubscriptionAction(action: "renew" | "cancel") {
    await applyAction(
      { type: action === "renew" ? "renew_subscription" : "cancel_subscription", subscriberId: subscriber.id },
      action === "renew" ? "Subscription renewed and draw eligibility restored." : "Subscription cancelled. Restricted-access state would apply in production.",
    );
  }

  async function handleProofSubmit() {
    await applyAction(
      {
        type: "submit_proof",
        subscriberId: subscriber.id,
        proofNote,
      },
      "Winner proof uploaded for admin review.",
    );
  }

  return (
    <div className="dashboard-grid spread-grid">
      <section className="panel highlight-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Subscriber command center</p>
            <h1>{subscriber.name}</h1>
            <p className="lead">
              {subscriber.subscriptionStatus} on the {subscriber.plan.toLowerCase()} plan. Renewal date is {formatDate(subscriber.renewalDate)} and every authenticated request would validate this state.
            </p>
          </div>
          <div className="hero-actions">
            <button type="button" onClick={() => void handleSubscriptionAction("renew")}>
              Renew access
            </button>
            <button type="button" className="ghost-button" onClick={() => void handleSubscriptionAction("cancel")}>
              Cancel plan
            </button>
          </div>
        </div>
        <div className="stats-row">
          <div>
            <span>Status</span>
            <strong>{subscriber.subscriptionStatus}</strong>
          </div>
          <div>
            <span>Draws entered</span>
            <strong>{subscriber.enteredDraws}</strong>
          </div>
          <div>
            <span>Upcoming draws</span>
            <strong>{subscriber.upcomingDraws}</strong>
          </div>
          <div>
            <span>Total won</span>
            <strong>{formatCurrency(subscriber.winnings)}</strong>
          </div>
          <div>
            <span>Payout state</span>
            <strong>{subscriber.paymentStatus}</strong>
          </div>
        </div>
        <p className="light-muted">{statusMessage}</p>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Score management</p>
            <h2>Enter and edit your five latest scores</h2>
          </div>
          <span className="tag">Range 1 to 45</span>
        </div>
        <form className="score-form" onSubmit={handleSaveScore}>
          <label className="field">
            Stableford score
            <input type="number" min="1" max="45" value={points} onChange={(event) => setPoints(Number(event.target.value))} required />
          </label>
          <label className="field">
            Played on
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
          </label>
          <div className="stack-actions">
            <button type="submit">{editingScoreId ? "Update score" : "Save score"}</button>
            {editingScoreId ? (
              <button type="button" className="ghost-button" onClick={resetScoreForm}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
        <div className="score-list expanded-scores">
          {sortedScores.map((score) => (
            <article key={score.id}>
              <strong>{score.points} pts</strong>
              <span>{formatDate(score.date)}</span>
              <button type="button" className="mini-button" onClick={() => handleEditScore(score.id)}>
                Edit
              </button>
            </article>
          ))}
        </div>
        <p className="muted">The sixth score pushes out the oldest score automatically, keeping the dataset compliant with the PRD.</p>
      </section>

      <section className="panel">
        <p className="eyebrow">Charity preferences</p>
        <h2>Update your recipient and contribution rate</h2>
        <div className="control-grid">
          <label className="field">
            Selected charity
            <select value={subscriber.charityId} onChange={(event) => void handleCharityUpdate(Number(event.target.value), subscriber.charityPercent)}>
              {platformState.charities.map((charity) => (
                <option key={charity.id} value={charity.id}>
                  {charity.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Contribution %
            <input
              type="number"
              min={plan.charityMinimum}
              max="80"
              value={subscriber.charityPercent}
              onChange={(event) => void handleCharityUpdate(subscriber.charityId, Number(event.target.value))}
            />
          </label>
        </div>
        <div className="charity-metrics">
          <div>
            <span>Current cause</span>
            <strong>{selectedCharity?.name}</strong>
          </div>
          <div>
            <span>Monthly donation</span>
            <strong>{formatCurrency(monthlyContribution)}</strong>
          </div>
          <div>
            <span>Impact focus</span>
            <strong>{selectedCharity?.focus}</strong>
          </div>
        </div>
        <p className="lead">{selectedCharity?.description}</p>
        <ul className="bullet-list">
          {selectedCharity?.events.map((eventName) => (
            <li key={eventName}>{eventName}</li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <p className="eyebrow">Verification and settings</p>
        <h2>Submit proof and review profile access</h2>
        <div className="stats-row">
          <div>
            <span>Email</span>
            <strong>{subscriber.email}</strong>
          </div>
          <div>
            <span>Country</span>
            <strong>{subscriber.country}</strong>
          </div>
          <div>
            <span>Proof status</span>
            <strong>{subscriber.proofStatus}</strong>
          </div>
          <div>
            <span>Payment status</span>
            <strong>{subscriber.paymentStatus}</strong>
          </div>
        </div>
        <label className="field">
          Proof note or screenshot reference
          <textarea value={proofNote} onChange={(event) => setProofNote(event.target.value)} rows={4} />
        </label>
        <div className="hero-actions">
          <button type="button" onClick={() => void handleProofSubmit()}>
            Upload winner proof
          </button>
        </div>
      </section>
    </div>
  );
}

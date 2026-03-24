"use client";

import { useMemo, useState } from "react";
import {
  buildDrawSummary,
  charities as seededCharities,
  formatCurrency,
  formatDate,
  sampleSubscribers,
  type Charity,
  type DrawMode,
  type PaymentStatus,
  type ProofStatus,
  type Subscriber,
} from "@/lib/platform-data";

const modeLabels: Record<DrawMode, string> = {
  random: "Random",
  "weighted-high": "Weighted high",
  "weighted-low": "Weighted low",
};

export function AdminControlCenter() {
  const [drawMode, setDrawMode] = useState<DrawMode>("random");
  const [seed, setSeed] = useState(0);
  const [published, setPublished] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(sampleSubscribers);
  const [charities, setCharities] = useState<Charity[]>(seededCharities);
  const [selectedSubscriberId, setSelectedSubscriberId] = useState(sampleSubscribers[0].id);
  const [newCharityName, setNewCharityName] = useState("");
  const [newCharityFocus, setNewCharityFocus] = useState("");
  const [adminMessage, setAdminMessage] = useState("Ready for draw operations, membership management, and payout review.");

  const selectedSubscriber = subscribers.find((subscriber) => subscriber.id === selectedSubscriberId) ?? subscribers[0];
  const summary = useMemo(() => buildDrawSummary(subscribers, drawMode, 1800 + seed * 25, published, 20260324 + seed), [drawMode, published, seed, subscribers]);

  function updateSubscriber(nextSubscriber: Subscriber) {
    setSubscribers((current) => current.map((subscriber) => (subscriber.id === nextSubscriber.id ? nextSubscriber : subscriber)));
  }

  function handleSubscriptionStatusChange(nextStatus: Subscriber["subscriptionStatus"]) {
    if (!selectedSubscriber) return;
    updateSubscriber({ ...selectedSubscriber, subscriptionStatus: nextStatus, upcomingDraws: nextStatus === "Active" ? 1 : 0 });
    setAdminMessage(`${selectedSubscriber.name} is now ${nextStatus.toLowerCase()}.`);
  }

  function handleScoreNudge(delta: number) {
    if (!selectedSubscriber || selectedSubscriber.scores.length === 0) return;
    const currentScore = selectedSubscriber.scores[0];
    const nextPoints = Math.min(45, Math.max(1, currentScore.points + delta));
    updateSubscriber({
      ...selectedSubscriber,
      scores: [{ ...currentScore, points: nextPoints }, ...selectedSubscriber.scores.slice(1)],
    });
    setAdminMessage(`Latest score for ${selectedSubscriber.name} adjusted to ${nextPoints}.`);
  }

  function handleWinnerAction(subscriberId: number, proofStatus: ProofStatus, paymentStatus: PaymentStatus) {
    const subscriber = subscribers.find((entry) => entry.id === subscriberId);
    if (!subscriber) return;
    updateSubscriber({ ...subscriber, proofStatus, paymentStatus });
    setAdminMessage(`${subscriber.name}: proof ${proofStatus.toLowerCase()}, payment ${paymentStatus.toLowerCase()}.`);
  }

  function handleAddCharity() {
    if (!newCharityName.trim() || !newCharityFocus.trim()) {
      setAdminMessage("Add both a charity name and focus.");
      return;
    }

    const nextCharity: Charity = {
      id: Date.now(),
      name: newCharityName,
      focus: newCharityFocus,
      description: "New charity listing added from the admin workspace.",
      image: "Awaiting uploaded media",
      featured: false,
      events: ["Admin-created event"],
    };

    setCharities((current) => [...current, nextCharity]);
    setNewCharityFocus("");
    setNewCharityName("");
    setAdminMessage(`${nextCharity.name} added to the directory.`);
  }

  function handleDeleteCharity(charityId: number) {
    const charity = charities.find((entry) => entry.id === charityId);
    setCharities((current) => current.filter((entry) => entry.id !== charityId));
    if (charity) {
      setAdminMessage(`${charity.name} removed from the directory.`);
    }
  }

  return (
    <main className="admin-workspace">
      <section className="admin-topline">
        <div>
          <p className="eyebrow">Admin workspace</p>
          <h1>Operations, draw logic, subscriptions, charities, and payouts.</h1>
        </div>
        <div className="admin-toolbar">
          <button type="button" className="admin-button" onClick={() => setSeed((value) => value + 1)}>
            Run simulation
          </button>
          <button type="button" className={published ? "admin-button active" : "admin-button muted"} onClick={() => setPublished((value) => !value)}>
            {published ? "Unpublish" : "Publish"}
          </button>
        </div>
      </section>

      <section className="admin-metric-row">
        <article>
          <span>Users</span>
          <strong>{subscribers.length}</strong>
        </article>
        <article>
          <span>Active subscribers</span>
          <strong>{summary.activeSubscribers}</strong>
        </article>
        <article>
          <span>Prize pool</span>
          <strong>{formatCurrency(summary.prizePool)}</strong>
        </article>
        <article>
          <span>Charity pool</span>
          <strong>{formatCurrency(summary.charityPool)}</strong>
        </article>
        <article>
          <span>Cycle</span>
          <strong>{formatDate("2026-03-31")}</strong>
        </article>
      </section>

      <p className="admin-status-line">{adminMessage}</p>

      <section className="admin-grid">
        <section className="admin-panel admin-draw-panel">
          <div className="admin-panel-head">
            <div>
              <span className="admin-label">Draw management</span>
              <h2>Publish-ready monthly draw</h2>
            </div>
            <div className="admin-pill-row">
              {(["random", "weighted-high", "weighted-low"] as DrawMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={drawMode === mode ? "admin-pill active" : "admin-pill"}
                  onClick={() => setDrawMode(mode)}
                >
                  {modeLabels[mode]}
                </button>
              ))}
            </div>
          </div>
          <div className="admin-draw-numbers">
            {summary.drawNumbers.map((value) => (
              <div key={value}>{value}</div>
            ))}
          </div>
          <div className="admin-tier-list">
            {summary.tiers.map((tier) => (
              <article key={tier.label}>
                <strong>{tier.label}</strong>
                <span>{Math.round(tier.share * 100)}%</span>
                <span>{formatCurrency(tier.pool)}</span>
                <span>{tier.winners.length} winners</span>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel admin-member-panel">
          <div className="admin-panel-head">
            <div>
              <span className="admin-label">Membership controls</span>
              <h2>Subscriber management</h2>
            </div>
            <select value={selectedSubscriberId} onChange={(event) => setSelectedSubscriberId(Number(event.target.value))}>
              {subscribers.map((subscriber) => (
                <option key={subscriber.id} value={subscriber.id}>
                  {subscriber.name}
                </option>
              ))}
            </select>
          </div>
          {selectedSubscriber ? (
            <>
              <div className="admin-data-list">
                <div>
                  <span>Email</span>
                  <strong>{selectedSubscriber.email}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{selectedSubscriber.subscriptionStatus}</strong>
                </div>
                <div>
                  <span>Renewal</span>
                  <strong>{formatDate(selectedSubscriber.renewalDate)}</strong>
                </div>
                <div>
                  <span>Charity %</span>
                  <strong>{selectedSubscriber.charityPercent}%</strong>
                </div>
              </div>
              <div className="admin-action-row">
                <button type="button" className="admin-button" onClick={() => handleSubscriptionStatusChange("Active")}>
                  Mark active
                </button>
                <button type="button" className="admin-button muted" onClick={() => handleSubscriptionStatusChange("Lapsed")}>
                  Mark lapsed
                </button>
                <button type="button" className="admin-button muted" onClick={() => handleScoreNudge(1)}>
                  Score +1
                </button>
                <button type="button" className="admin-button muted" onClick={() => handleScoreNudge(-1)}>
                  Score -1
                </button>
              </div>
            </>
          ) : null}
        </section>

        <section className="admin-panel admin-winner-panel">
          <div className="admin-panel-head">
            <div>
              <span className="admin-label">Winner verification</span>
              <h2>Payout queue</h2>
            </div>
          </div>
          <div className="admin-table">
            <div className="admin-table-head">
              <span>Name</span>
              <span>Tier</span>
              <span>Proof</span>
              <span>Payment</span>
              <span>Action</span>
            </div>
            {summary.winners.length ? (
              summary.winners.map((winner) => (
                <div key={winner.subscriberId} className="admin-table-row">
                  <span>{winner.name}</span>
                  <span>{winner.tier}</span>
                  <span>{winner.proofStatus}</span>
                  <span>{winner.paymentStatus}</span>
                  <div className="admin-inline-actions">
                    <button type="button" className="admin-link-button" onClick={() => handleWinnerAction(winner.subscriberId, "Approved", "Pending")}>
                      Approve
                    </button>
                    <button type="button" className="admin-link-button" onClick={() => handleWinnerAction(winner.subscriberId, "Rejected", "Rejected")}>
                      Reject
                    </button>
                    <button type="button" className="admin-link-button" onClick={() => handleWinnerAction(winner.subscriberId, "Approved", "Paid")}>
                      Pay
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="admin-empty">No winners in this run. Jackpot remains in rollover state.</p>
            )}
          </div>
        </section>

        <section className="admin-panel admin-charity-panel">
          <div className="admin-panel-head">
            <div>
              <span className="admin-label">Charity management</span>
              <h2>Directory and media placeholders</h2>
            </div>
          </div>
          <div className="admin-form-grid">
            <input placeholder="Charity name" value={newCharityName} onChange={(event) => setNewCharityName(event.target.value)} />
            <input placeholder="Focus area" value={newCharityFocus} onChange={(event) => setNewCharityFocus(event.target.value)} />
            <button type="button" className="admin-button" onClick={handleAddCharity}>
              Add listing
            </button>
          </div>
          <div className="admin-charity-list">
            {charities.map((charity) => (
              <article key={charity.id}>
                <div>
                  <strong>{charity.name}</strong>
                  <span>{charity.focus}</span>
                </div>
                <div className="admin-inline-actions">
                  <button
                    type="button"
                    className="admin-link-button"
                    onClick={() => {
                      setCharities((current) => current.map((entry) => (entry.id === charity.id ? { ...entry, featured: !entry.featured } : entry)));
                      setAdminMessage(`${charity.name} spotlight status updated.`);
                    }}
                  >
                    {charity.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button type="button" className="admin-link-button danger" onClick={() => handleDeleteCharity(charity.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

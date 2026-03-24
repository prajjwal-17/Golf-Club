"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatedCounter } from "@/components/animated-counter";
import {
  buildDrawSummary,
  defaultPlatformState,
  formatCurrency,
  formatDate,
  getPlanPrice,
  plans,
  type PlatformState,
  type PlanType,
} from "@/lib/platform-data";

const journeySteps = [
  { id: 1, label: "Choose access", caption: "Monthly or yearly membership with built-in charity minimums." },
  { id: 2, label: "Back a cause", caption: "Select the charity story you want your subscription to support." },
  { id: 3, label: "Enter the draw", caption: "Save five scores and join the monthly prize pool automatically." },
];

export function LandingExperience() {
  const [platformState, setPlatformState] = useState<PlatformState>(defaultPlatformState);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("Yearly");
  const [selectedCharityId, setSelectedCharityId] = useState(2);
  const [charityPercent, setCharityPercent] = useState(18);
  const [journeyStep, setJourneyStep] = useState(1);
  const [donationAmount, setDonationAmount] = useState(120);
  const [query, setQuery] = useState("");
  const [selectedFocus, setSelectedFocus] = useState("All");
  const [subscriptionMessage, setSubscriptionMessage] = useState("Begin with a plan, pick a cause, and move into member access.");
  const [donationMessage, setDonationMessage] = useState("Independent giving stays available for supporters who are not playing the monthly draw.");

  useEffect(() => {
    void fetch("/api/platform-state")
      .then((response) => response.json())
      .then((state: PlatformState) => {
        setPlatformState(state);
        if (state.charities[0]) {
          setSelectedCharityId((current) => (state.charities.some((charity) => charity.id === current) ? current : state.charities[0].id));
        }
      });
  }, []);

  const summary = useMemo(() => buildDrawSummary(platformState.subscribers, "weighted-high", 1800, true, 20260324), [platformState.subscribers]);
  const selectedCharity = platformState.charities.find((charity) => charity.id === selectedCharityId) ?? platformState.charities[0];
  const focusOptions = ["All", ...new Set(platformState.charities.map((charity) => charity.focus))];
  const filteredCharities = platformState.charities.filter((charity) => {
    const matchesSearch = `${charity.name} ${charity.description} ${charity.focus}`.toLowerCase().includes(query.toLowerCase());
    const matchesFocus = selectedFocus === "All" || charity.focus === selectedFocus;
    return matchesSearch && matchesFocus;
  });

  const estimatedMonthlyImpact = Math.round((getPlanPrice(selectedPlan) * charityPercent) / 100);
  const supportedLives = Math.max(24, Math.round(summary.charityPool * 1.6));

  function advanceStep(nextStep: number) {
    setJourneyStep(nextStep);
  }

  function handleSubscribe() {
    const minimum = plans[selectedPlan].charityMinimum;
    if (charityPercent < minimum) {
      setSubscriptionMessage(`Charity contribution must stay at or above ${minimum}% for the ${selectedPlan.toLowerCase()} plan.`);
      setJourneyStep(2);
      return;
    }

    setSubscriptionMessage(
      `${selectedPlan} access reserved. ${charityPercent}% of the subscription now routes toward ${selectedCharity?.name ?? "the selected charity"}, and the member enters the next published draw cycle.`,
    );
    setJourneyStep(3);
  }

  function handleDonation() {
    setDonationMessage(`Independent donation of ${formatCurrency(donationAmount)} prepared for ${selectedCharity?.name ?? "the selected charity"}. Receipt and impact email would be issued after payment.`);
  }

  if (!selectedCharity) {
    return null;
  }

  return (
    <main className="brand-page">
      <section className="impact-hero">
        <div className="impact-copy">
          <p className="eyebrow">Golf Charity Club</p>
          <h1>Each round can fund someone else's next chance.</h1>
          <p className="lead">
            This platform turns golf participation into recurring charitable support. Members subscribe, keep their five latest Stableford scores current, and enter a monthly prize system that is led by impact before reward.
          </p>
          <div className="hero-cta-row">
            <a href="#journey" className="impact-cta">
              Start the guided journey
            </a>
            <a href="#charities" className="quiet-cta">
              Meet the charities
            </a>
          </div>
        </div>

        <div className="impact-storyboard">
          <div className="story-frame story-primary">
            <span className="eyebrow">This month's impact</span>
            <AnimatedCounter value={Math.round(summary.charityPool * 100)} prefix="$" />
            <p>Projected charity funding from active memberships this cycle.</p>
          </div>
          <div className="story-frame story-secondary">
            <span>People directly supported</span>
            <AnimatedCounter value={supportedLives} suffix="+" />
          </div>
          <div className="story-frame story-tertiary">
            <span>Next draw publication</span>
            <strong>{formatDate("2026-03-31")}</strong>
          </div>
          <div className="story-portrait" aria-hidden="true">
            <div className="portrait-caption">From member play to visible impact</div>
          </div>
        </div>
      </section>

      <section className="impact-ribbon">
        <div>
          <span>Charity contribution pool</span>
          <AnimatedCounter value={Math.round(summary.charityPool * 100)} prefix="$" />
        </div>
        <div>
          <span>Projected prize pool</span>
          <AnimatedCounter value={Math.round(summary.prizePool * 100)} prefix="$" />
        </div>
        <div>
          <span>Active subscribers</span>
          <AnimatedCounter value={summary.activeSubscribers} />
        </div>
        <div>
          <span>Jackpot state</span>
          <strong>{summary.rolloverApplied ? "Rolling forward" : "Claimed"}</strong>
        </div>
      </section>

      <section className="mechanics-stage">
        <div className="mechanics-lead">
          <p className="eyebrow">How it works</p>
          <h2>Impact first. Participation second. Reward third.</h2>
          <p className="lead">
            The product hierarchy is intentional: charity contribution leads the story, the subscription and scoring loop keeps people engaged, and the draw mechanics provide momentum without becoming the entire brand.
          </p>
        </div>
        <div className="mechanics-grid">
          <article className="mechanic-block offset-block">
            <span className="step-index">01</span>
            <h3>Subscription engine</h3>
            <p>Monthly and yearly access, renewal states, and real-time access validation on authenticated requests.</p>
          </article>
          <article className="mechanic-block">
            <span className="step-index">02</span>
            <h3>Rolling score memory</h3>
            <p>Exactly five Stableford scores are retained. The oldest score is replaced automatically when a new one arrives.</p>
          </article>
          <article className="mechanic-block dark-mechanic">
            <span className="step-index">03</span>
            <h3>Monthly draw engine</h3>
            <p>Random or algorithmic modes support simulation before publish, with 5-match, 4-match, and 3-match tiers and jackpot rollover.</p>
            <div className="draw-inline">
              {summary.drawNumbers.map((value) => (
                <div key={value}>{value}</div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="charities" className="charity-stage">
        <div className="charity-stage-head">
          <div>
            <p className="eyebrow">Charity spotlight</p>
            <h2>The most important part of the product is not the draw.</h2>
          </div>
          <div className="charity-filter-bar">
            <input placeholder="Search by story or focus" value={query} onChange={(event) => setQuery(event.target.value)} />
            <select value={selectedFocus} onChange={(event) => setSelectedFocus(event.target.value)}>
              {focusOptions.map((focus) => (
                <option key={focus} value={focus}>
                  {focus}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="charity-feature">
          <div className="charity-visual">
            <div className="charity-image-slab">
              <div className="charity-image-caption">{selectedCharity.image}</div>
            </div>
          </div>
          <div className="charity-story">
            <span className="feature-kicker">Featured cause</span>
            <h3>{selectedCharity.name}</h3>
            <p>{selectedCharity.description}</p>
            <div className="impact-metric-strip">
              <article>
                <span>Estimated monthly support</span>
                <AnimatedCounter value={estimatedMonthlyImpact} prefix="$" />
              </article>
              <article>
                <span>Contribution rate</span>
                <AnimatedCounter value={charityPercent} suffix="%" />
              </article>
              <article>
                <span>Upcoming events</span>
                <AnimatedCounter value={selectedCharity.events.length} />
              </article>
            </div>
            <ul className="bullet-list">
              {selectedCharity.events.map((eventName) => (
                <li key={eventName}>{eventName}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="charity-mosaic">
          {filteredCharities.map((charity, index) => (
            <article
              key={charity.id}
              className={index === 1 ? "charity-tile wide-tile" : "charity-tile"}
              onMouseEnter={() => setSelectedCharityId(charity.id)}
            >
              <span className="tile-focus">{charity.focus}</span>
              <h3>{charity.name}</h3>
              <p>{charity.description}</p>
              <small>{charity.image}</small>
            </article>
          ))}
        </div>
      </section>

      <section id="journey" className="journey-stage">
        <div className="journey-copy">
          <p className="eyebrow">Guided subscription flow</p>
          <h2>Move through a three-step journey instead of a cold form.</h2>
        </div>

        <div className="journey-shell">
          <aside className="journey-rail">
            {journeySteps.map((step) => (
              <button
                key={step.id}
                type="button"
                className={journeyStep === step.id ? "journey-step active" : "journey-step"}
                onClick={() => advanceStep(step.id)}
              >
                <span>{String(step.id).padStart(2, "0")}</span>
                <div>
                  <strong>{step.label}</strong>
                  <small>{step.caption}</small>
                </div>
              </button>
            ))}
          </aside>

          <div className="journey-panel">
            {journeyStep === 1 ? (
              <div className="step-panel">
                <h3>Select access</h3>
                <p>Choose how the member enters the platform. Yearly access creates a stronger long-term contribution signal.</p>
                <div className="plan-choices">
                  {(["Monthly", "Yearly"] as PlanType[]).map((plan) => (
                    <button
                      key={plan}
                      type="button"
                      className={selectedPlan === plan ? "plan-choice active" : "plan-choice"}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <span>{plan}</span>
                      <strong>{formatCurrency(getPlanPrice(plan))}</strong>
                      <small>{plans[plan].cadence}</small>
                    </button>
                  ))}
                </div>
                <button type="button" className="impact-cta" onClick={() => advanceStep(2)}>
                  Continue to charity selection
                </button>
              </div>
            ) : null}

            {journeyStep === 2 ? (
              <div className="step-panel">
                <h3>Choose the cause and contribution</h3>
                <div className="journey-controls">
                  <label className="field">
                    Charity
                    <select value={selectedCharityId} onChange={(event) => setSelectedCharityId(Number(event.target.value))}>
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
                      min={plans[selectedPlan].charityMinimum}
                      max="80"
                      value={charityPercent}
                      onChange={(event) => setCharityPercent(Number(event.target.value))}
                    />
                  </label>
                </div>
                <p className="journey-note">
                  Estimated donation from this subscription: <strong>{formatCurrency(estimatedMonthlyImpact)}</strong>.
                </p>
                <div className="journey-actions">
                  <button type="button" className="quiet-cta" onClick={() => advanceStep(1)}>
                    Back
                  </button>
                  <button type="button" className="impact-cta" onClick={() => advanceStep(3)}>
                    Continue to confirmation
                  </button>
                </div>
              </div>
            ) : null}

            {journeyStep === 3 ? (
              <div className="step-panel">
                <h3>Confirm member access</h3>
                <div className="confirmation-sheet">
                  <div>
                    <span>Plan</span>
                    <strong>{selectedPlan}</strong>
                  </div>
                  <div>
                    <span>Subscription</span>
                    <strong>{formatCurrency(getPlanPrice(selectedPlan))}</strong>
                  </div>
                  <div>
                    <span>Chosen charity</span>
                    <strong>{selectedCharity.name}</strong>
                  </div>
                  <div>
                    <span>Contribution rate</span>
                    <strong>{charityPercent}%</strong>
                  </div>
                </div>
                <div className="journey-actions">
                  <button type="button" className="quiet-cta" onClick={() => advanceStep(2)}>
                    Adjust details
                  </button>
                  <button type="button" className="impact-cta" onClick={handleSubscribe}>
                    Confirm subscription
                  </button>
                </div>
                <p className="journey-note">{subscriptionMessage}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="donation-stage">
        <div className="donation-copy">
          <p className="eyebrow">Independent donation</p>
          <h2>Support the mission without entering the gameplay loop.</h2>
        </div>
        <div className="donation-actions">
          <label className="field">
            Donation amount
            <input type="number" min="10" value={donationAmount} onChange={(event) => setDonationAmount(Number(event.target.value))} />
          </label>
          <button type="button" className="impact-cta" onClick={handleDonation}>
            Process donation
          </button>
          <p>{donationMessage}</p>
        </div>
      </section>

      <section className="footer-callout">
        <div>
          <p className="eyebrow">Member and admin experiences</p>
          <h2>See the working product views behind the charity-first story.</h2>
        </div>
        <div className="hero-cta-row">
          <Link href="/dashboard" className="impact-cta">
            Open subscriber dashboard
          </Link>
          <Link href="/admin" className="quiet-cta">
            Open admin workspace
          </Link>
        </div>
      </section>
    </main>
  );
}

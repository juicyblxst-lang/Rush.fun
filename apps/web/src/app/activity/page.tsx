"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Profile } from "@rush/types";
import { api } from "../../lib/api";

type Item = {
  id: string;
  eventType: string;
  createdAt: string;
  text: string;
  marketId?: string;
  targetId?: string;
  targetType?: string;
  actor?: Profile;
};

export default function Activity() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .communityActivity()
      .then((x) => setItems(x.items))
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Could not load activity."),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page">
      <div className="eyebrow">Activity</div>
      <h2>Community activity</h2>

      {loading ? (
        <p className="muted">Loading activity…</p>
      ) : error ? (
        <div className="empty">{error}</div>
      ) : items.length === 0 ? (
        <div className="empty">No community activity yet.</div>
      ) : (
        <div className="feed">
          {items.map((item) => (
            <article key={item.id}>
              <p>{item.text}</p>
              <div className="muted">
                {item.actor && (
                  <Link href={"/profile/" + item.actor.username}>
                    @{item.actor.username}
                  </Link>
                )}
                {" · "}
                {new Date(item.createdAt).toLocaleString()}
                {item.marketId && (
                  <>
                    {" · "}
                    <Link href={"/markets/" + encodeURIComponent(item.marketId)}>
                      market
                    </Link>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

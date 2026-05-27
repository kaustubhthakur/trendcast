"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import styles from "./CommunityPage.module.css";

/* ── Types ─────────────────────────────────────────────── */
interface Post {
  id: string;
  user_id: string;
  username: string;
  content: string;
  image_url?: string;
  video_url?: string;
  match_id?: string;
  player_prediction?: string;
  player_probability?: number;
  likes_count: number;      // integer in DB
  comment_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  user_id: string;
  username: string;
  comment: string;
  created_at: string;
}

const API = "http://localhost:8081";

/* ── Helpers ───────────────────────────────────────────── */
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

/* ── Avatar ────────────────────────────────────────────── */
function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const colors = ["#1a7a3c", "#267a47", "#1d6e35", "#145e2b", "#0f4f24"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className={styles.avatar}
      style={{ width: size, height: size, background: color, fontSize: size * 0.34 }}
    >
      {initials(name)}
    </div>
  );
}

/* ── Prediction badge ──────────────────────────────────── */
function PredictionBadge({ player, probability }: { player: string; probability: number }) {
  return (
    <div className={styles.predBadge}>
      <span className={styles.predIcon}>⚡</span>
      <span className={styles.predPlayer}>{player}</span>
      <span className={styles.predProb}>{Math.round(probability * 100)}%</span>
    </div>
  );
}

/* ── Comment thread ────────────────────────────────────── */
function CommentThread({
  postId,
  isLoggedIn,
  onCommentAdded,
}: {
  postId: string;
  isLoggedIn: boolean;
  onCommentAdded: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/community/posts/${postId}/comments`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .finally(() => setLoading(false));
  }, [postId]);

  const submit = async () => {
    if (!text.trim() || !isLoggedIn) return;
    const res = await fetch(`${API}/community/posts/${postId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ comment: text }),
    });
    const data = await res.json();
    if (data.comment) {
      setComments((prev) => [...prev, data.comment]);
      setText("");
      onCommentAdded();
    }
  };

  return (
    <div className={styles.commentThread}>
      {loading ? (
        <p className={styles.loadingText}>Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className={styles.emptyText}>No comments yet. Be first!</p>
      ) : (
        comments.map((c) => (
          <div key={c.id} className={styles.comment}>
            <Avatar name={c.username} size={28} />
            <div className={styles.commentBody}>
              <span className={styles.commentUser}>{c.username}</span>
              <span className={styles.commentText}>{c.comment}</span>
              <span className={styles.commentTime}>{timeAgo(c.created_at)}</span>
            </div>
          </div>
        ))
      )}
      {isLoggedIn && (
        <div className={styles.commentInput}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <button onClick={submit} disabled={!text.trim()} className={styles.sendBtn}>
            Send
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Post card ─────────────────────────────────────────── */
function PostCard({
  post,
  isLoggedIn,
  currentUserId,
  onDelete,
}: {
  post: Post;
  isLoggedIn: boolean;
  currentUserId?: string;
  onDelete: (id: string) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comment_count ?? 0);

  const handleLike = async () => {
    if (!isLoggedIn) return;
    const res = await fetch(`${API}/community/posts/${post.id}/like`, {
      method: "PUT",
      credentials: "include",
    });
    const data = await res.json();
    if (data.alreadyLiked) return; 
    if (res.ok) {
      setLiked(true);
      setLikeCount((n) => n + 1);
    }
  };

  const handleDelete = async () => {
    if (!isLoggedIn) return;
    const res = await fetch(`${API}/community/posts/${post.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) onDelete(post.id);
  };

  return (
    <article className={styles.postCard}>
      <div className={styles.postHeader}>
        <Avatar name={post.username} size={38} />
        <div className={styles.postMeta}>
          <span className={styles.postAuthor}>{post.username}</span>
          <span className={styles.postTime}>{timeAgo(post.created_at)}</span>
          {post.match_id && (
            <span className={styles.matchTag}>Match #{post.match_id}</span>
          )}
        </div>
        {currentUserId === post.user_id?.toString() && (
          <button onClick={handleDelete} className={styles.deleteBtn} aria-label="Delete post">
            ✕
          </button>
        )}
      </div>

      <p className={styles.postContent}>{post.content}</p>

      {post.player_prediction && post.player_probability !== undefined && (
        <PredictionBadge player={post.player_prediction} probability={post.player_probability} />
      )}

      {post.image_url && (
        <img src={post.image_url} alt="" className={styles.postMedia} />
      )}

      <div className={styles.postActions}>
        <button
          className={`${styles.actionBtn} ${liked ? styles.liked : ""}`}
          onClick={handleLike}
          disabled={!isLoggedIn || liked}
        >
          <span className={styles.actionIcon}>♥</span>
          <span>{likeCount}</span>
        </button>
        <button
          className={`${styles.actionBtn} ${showComments ? styles.active : ""}`}
          onClick={() => setShowComments((v) => !v)}
        >
          <span className={styles.actionIcon}>💬</span>
          <span>{commentCount}</span>
        </button>
      </div>

      {showComments && (
        <CommentThread
          postId={post.id}
          isLoggedIn={isLoggedIn}
          onCommentAdded={() => setCommentCount((n) => n + 1)}
        />
      )}
    </article>
  );
}

function CreatePost({
  username,
  onCreated,
}: {
  username: string;
  onCreated: (post: Post) => void;
}) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [matchId, setMatchId] = useState("");
  const [playerPrediction, setPlayerPrediction] = useState("");
  const [playerProbability, setPlayerProbability] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [posting, setPosting] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const submit = async () => {
    if (!content.trim()) return;
    setPosting(true);
    const body: Record<string, unknown> = { content };
    if (imageUrl) body.imageUrl = imageUrl;
    if (matchId) body.matchId = matchId;
    if (playerPrediction) body.playerPrediction = playerPrediction;
    if (playerProbability) body.playerProbability = parseFloat(playerProbability);

    const res = await fetch(`${API}/community/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.post) {
      onCreated(data.post);
      setContent("");
      setImageUrl("");
      setMatchId("");
      setPlayerPrediction("");
      setPlayerProbability("");
      setExpanded(false);
    }
    setPosting(false);
  };

  return (
    <div className={styles.createPost}>
      <div className={styles.createRow}>
        <Avatar name={username} size={38} />
        <textarea
          ref={textRef}
          className={styles.createTextarea}
          placeholder="Share a thought, prediction, or match update…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setExpanded(true)}
          rows={expanded ? 3 : 1}
        />
      </div>
      {expanded && (
        <div className={styles.createExtras}>
          <div className={styles.extraRow}>
            <input
              placeholder="Image URL (optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={styles.extraInput}
            />
            <input
              placeholder="Match ID (optional)"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              className={styles.extraInput}
            />
          </div>
          <div className={styles.extraRow}>
            <input
              placeholder="Player prediction"
              value={playerPrediction}
              onChange={(e) => setPlayerPrediction(e.target.value)}
              className={styles.extraInput}
            />
            <input
              placeholder="Probability 0–1 (e.g. 0.78)"
              value={playerProbability}
              onChange={(e) => setPlayerProbability(e.target.value)}
              className={styles.extraInput}
              type="number"
              min="0"
              max="1"
              step="0.01"
            />
          </div>
          <div className={styles.createFooter}>
            <button className={styles.cancelBtn} onClick={() => setExpanded(false)}>
              Cancel
            </button>
            <button
              className={styles.postBtn}
              onClick={submit}
              disabled={!content.trim() || posting}
            >
              {posting ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TrendingSidebar() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/community/trending`)
      .then((r) => r.json())
      .then((d) => setPosts((d.posts ?? []).slice(0, 5)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span className={styles.trendingDot} />
        Trending Now
      </div>
      {loading ? (
        <div className={styles.sidebarSkeleton}>
          {[1, 2, 3].map((i) => <div key={i} className={styles.skeletonItem} />)}
        </div>
      ) : posts.length === 0 ? (
        <p className={styles.emptyText}>No trending posts yet.</p>
      ) : (
        <div className={styles.trendingList}>
          {posts.map((p, i) => (
            <div key={p.id} className={styles.trendingItem}>
              <span className={styles.trendingRank}>{i + 1}</span>
              <div className={styles.trendingContent}>
                <span className={styles.trendingUser}>{p.username}</span>
                <p className={styles.trendingSnippet}>
                  {p.content.slice(0, 72)}{p.content.length > 72 ? "…" : ""}
                </p>
                <span className={styles.trendingLikes}>♥ {p.likes_count ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

type FeedView = "all" | "match" | "trending";

export default function CommunityPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<FeedView>("all");
  const [matchFilter, setMatchFilter] = useState("");

  const fetchPosts = async (v: FeedView, mid?: string) => {
    setLoading(true);
    let url = `${API}/community/posts`;
    if (v === "trending") url = `${API}/community/trending`;
    if (v === "match" && mid) url = `${API}/community/match/${mid}`;
    const res = await fetch(url);
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts("all"); }, []);

  const handleTabChange = (v: FeedView) => {
    setView(v);
    if (v !== "match") {
      setMatchFilter("");
      fetchPosts(v);
    } else {
      setPosts([]);
      setLoading(false);
    }
  };

  const handleMatchSearch = () => {
    if (matchFilter.trim()) fetchPosts("match", matchFilter.trim());
  };

  return (
    <main className={styles.page}>
      <div className={styles.pageHead}>
        <div className={styles.pageTitleRow}>
          <div>
            <h1 className={styles.pageTitle}>Community</h1>
            <p className={styles.pageSubtitle}>
              Predictions, reactions, and live talk from the FootBuzz fanbase
            </p>
          </div>
          <Link href="/" className={styles.redirectBtn}>
            ← Back to Matches
          </Link>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.feed}>
          <div className={styles.tabs}>
            {(["all", "trending", "match"] as FeedView[]).map((t) => (
              <button
                key={t}
                className={`${styles.tab} ${view === t ? styles.tabActive : ""}`}
                onClick={() => handleTabChange(t)}
              >
                {t === "all" ? "All Posts" : t === "trending" ? "🔥 Trending" : "By Match"}
              </button>
            ))}
          </div>

          {view === "match" && (
            <div className={styles.matchSearch}>
              <input
                placeholder="Enter Match ID…"
                value={matchFilter}
                onChange={(e) => setMatchFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleMatchSearch()}
                className={styles.matchInput}
              />
              <button onClick={handleMatchSearch} className={styles.searchBtn}>
                Search
              </button>
            </div>
          )}

          {user && (
            <CreatePost
              username={user.username}
              onCreated={(post) => setPosts((prev) => [post, ...prev])}
            />
          )}

          {loading ? (
            <div className={styles.feedSkeleton}>
              {[1, 2, 3].map((i) => <div key={i} className={styles.postSkeleton} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.emptyFeed}>
              <span className={styles.emptyIcon}>⚽</span>
              <p>{view === "match" ? "Enter a match ID to see posts." : "No posts yet. Kick things off!"}</p>
            </div>
          ) : (
            posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                isLoggedIn={isLoggedIn}
                currentUserId={user?.id?.toString()}
                onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
              />
            ))
          )}
        </div>

        <TrendingSidebar />
      </div>
    </main>
  );
}
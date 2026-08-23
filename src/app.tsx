import { useEffect, useState } from "react";
import { marked } from "marked";

import {
  Heart,
  MessageCircle,
  Repeat2,
  Search,
  Home,
  Compass,
  Bookmark,
  Github,
  MoreHorizontal
} from "lucide-react";

interface Post {
  id: string;
  author: string;
  body: string;
  embed?: string;
  createdAt?: string;
}

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  type: string;
}

const API = "https://api.github.com";

function githubAvatar(username: string) {
  return `https://github.com/${username}.png?size=128`;
}

async function getGitHubUser(
  username: string
): Promise<GitHubUser | null> {
  try {
    const response = await fetch(
      `${API}/users/${encodeURIComponent(username)}`
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

function formatDate(date?: string) {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function markdown(body: string) {
  return {
    __html: marked.parse(body) as string
  };
}

function VerifiedBadge() {
  return (
    <span
      className="verified"
      title="Verified through GitHub"
      aria-label="Verified through GitHub"
    >
      ✓
    </span>
  );
}

function PostCard({ post }: { post: Post }) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    getGitHubUser(post.author).then(setUser);
  }, [post.author]);

  function toggleLike() {
    setLiked(value => {
      setLikes(count => value ? count - 1 : count + 1);
      return !value;
    });
  }

  return (
    <article className="post">
      <div className="post-avatar">
        <img
          src={
            user?.avatar_url ??
            githubAvatar(post.author)
          }
          alt={`${post.author} avatar`}
        />
      </div>

      <div className="post-content">
        <header className="post-header">
          <div>
            <a
              className="display-name"
              href={`https://github.com/${post.author}`}
              target="_blank"
              rel="noreferrer"
            >
              {user?.name || post.author}

              <VerifiedBadge />
            </a>

            <span className="username">
              @{post.author}
            </span>

            {post.createdAt && (
              <>
                <span className="dot">·</span>
                <span className="date">
                  {formatDate(post.createdAt)}
                </span>
              </>
            )}
          </div>

          <button className="icon-button">
            <MoreHorizontal size={19} />
          </button>
        </header>

        <div
          className="post-body markdown"
          dangerouslySetInnerHTML={markdown(post.body)}
        />

        {post.embed && (
          <div className="post-image">
            <img
              src={post.embed}
              alt=""
              loading="lazy"
            />
          </div>
        )}

        <div className="post-actions">
          <button className="post-action">
            <MessageCircle size={18} />
            <span>0</span>
          </button>

          <button className="post-action">
            <Repeat2 size={18} />
            <span>0</span>
          </button>

          <button
            className={`post-action ${liked ? "liked" : ""}`}
            onClick={toggleLike}
          >
            <Heart
              size={18}
              fill={liked ? "currentColor" : "none"}
            />

            <span>{likes}</span>
          </button>

          <button className="post-action">
            <Bookmark size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        Forums
      </div>

      <nav>
        <a className="nav-item active">
          <Home size={21} />
          Home
        </a>

        <a className="nav-item">
          <Compass size={21} />
          Explore
        </a>

        <a className="nav-item">
          <Bookmark size={21} />
          Bookmarks
        </a>
      </nav>

      <a
        className="github-link"
        href="https://github.com"
        target="_blank"
        rel="noreferrer"
      >
        <Github size={19} />
        GitHub
      </a>
    </aside>
  );
}

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("./posts.json")
      .then(response => {
        if (!response.ok) {
          throw new Error("Could not load posts.json");
        }

        return response.json();
      })
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const filteredPosts = posts.filter(post => {
    const query = search.toLowerCase();

    return (
      post.body.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query)
    );
  });

  return (
    <div className="app">
      <Sidebar />

      <main className="feed">
        <div className="feed-header">
          <div>
            <h1>Home</h1>
            <span>Latest posts</span>
          </div>

          <div className="search">
            <Search size={18} />

            <input
              value={search}
              onChange={event =>
                setSearch(event.target.value)
              }
              placeholder="Search Forums"
            />
          </div>
        </div>

        {loading && (
          <div className="state">
            Loading posts...
          </div>
        )}

        {error && (
          <div className="state error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          filteredPosts.length === 0 && (
            <div className="state">
              No posts found.
            </div>
          )}

        {!loading &&
          !error &&
          filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
            />
          ))}
      </main>

      <aside className="right-sidebar">
        <section className="card">
          <h2>About Forums</h2>

          <p>
            An open social platform powered by
            GitHub.
          </p>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub
          </a>
        </section>

        <section className="card">
          <h2>Trending</h2>

          <div className="trend">
            <span>#Minecraft</span>
            <small>Trending</small>
          </div>

          <div className="trend">
            <span>#Godot</span>
            <small>Trending</small>
          </div>

          <div className="trend">
            <span>#OpenSource</span>
            <small>Trending</small>
          </div>
        </section>
      </aside>
    </div>
  );
}

export default App;

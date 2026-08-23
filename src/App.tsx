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

const GITHUB_API = "https://api.github.com";

function githubAvatar(username: string) {
  return `https://github.com/${encodeURIComponent(username)}.png?size=128`;
}

async function getGitHubUser(
  username: string
): Promise<GitHubUser | null> {
  try {
    const response = await fetch(
      `${GITHUB_API}/users/${encodeURIComponent(username)}`
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
  if (!date) {
    return "";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function PostCard({
  post,
  verifiedUsers
}: {
  post: Post;
  verifiedUsers: string[];
}) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  const verified = verifiedUsers.some(
    username =>
      username.toLowerCase() === post.author.toLowerCase()
  );

  useEffect(() => {
    getGitHubUser(post.author).then(setUser);
  }, [post.author]);

  function toggleLike() {
    setLiked(value => {
      setLikes(count => (value ? count - 1 : count + 1));
      return !value;
    });
  }

  return (
    <article className="border-b border-base-300 p-5 transition-colors hover:bg-base-200/50">
      <div className="flex gap-3">
        <div className="shrink-0">
          <a
            href={`https://github.com/${encodeURIComponent(post.author)}`}
            target="_blank"
            rel="noreferrer"
          >
            <img
              className="size-11 rounded-full"
              src={
                user?.avatar_url ??
                githubAvatar(post.author)
              }
              alt={`${post.author} avatar`}
            />
          </a>
        </div>

        <div className="min-w-0 flex-1">
          <header className="flex items-start justify-between">
            <div className="min-w-0">
              <a
                className="font-bold hover:underline"
                href={`https://github.com/${encodeURIComponent(post.author)}`}
                target="_blank"
                rel="noreferrer"
              >
                {user?.name || post.author}

                {verified && (
                  <span
                    className="ml-1.5 inline-flex size-[17px] items-center justify-center rounded-full bg-primary text-[11px] font-black text-primary-content"
                    title="Verified on Forums"
                  >
                    ✓
                  </span>
                )}
              </a>

              <span className="ml-1.5 text-sm text-base-content/50">
                @{post.author}
              </span>

              {post.createdAt && (
                <>
                  <span className="mx-1.5 text-base-content/40">
                    ·
                  </span>

                  <span className="text-sm text-base-content/50">
                    {formatDate(post.createdAt)}
                  </span>
                </>
              )}
            </div>

            <button
              className="btn btn-ghost btn-sm btn-circle text-base-content/50"
              aria-label="More options"
            >
              <MoreHorizontal size={19} />
            </button>
          </header>

          <div
            className="markdown mt-2"
            dangerouslySetInnerHTML={{
              __html: marked.parse(post.body) as string
            }}
          />

          {post.embed && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-base-300">
              <img
                className="block max-h-[600px] w-full object-cover"
                src={post.embed}
                alt=""
                loading="lazy"
              />
            </div>
          )}

          <div className="mt-3 flex max-w-[480px] justify-between">
            <button className="btn btn-ghost btn-sm gap-2 text-base-content/50">
              <MessageCircle size={18} />
              0
            </button>

            <button className="btn btn-ghost btn-sm gap-2 text-base-content/50">
              <Repeat2 size={18} />
              0
            </button>

            <button
              className={`btn btn-ghost btn-sm gap-2 ${
                liked ? "text-error" : "text-base-content/50"
              }`}
              onClick={toggleLike}
            >
              <Heart
                size={18}
                fill={liked ? "currentColor" : "none"}
              />
              {likes}
            </button>

            <button className="btn btn-ghost btn-sm btn-circle text-base-content/50">
              <Bookmark size={18} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen border-r border-base-300 p-4 md:block">
      <div className="mb-8 px-3 text-2xl font-black tracking-tight">
        Forums
      </div>

      <nav className="flex flex-col gap-1">
        <a className="btn btn-ghost justify-start gap-4">
          <Home size={21} />
          Home
        </a>

        <a className="btn btn-ghost justify-start gap-4">
          <Compass size={21} />
          Explore
        </a>

        <a className="btn btn-ghost justify-start gap-4">
          <Bookmark size={21} />
          Bookmarks
        </a>
      </nav>

      <a
        className="btn btn-ghost mt-6 justify-start gap-4"
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
  const [verifiedUsers, setVerifiedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("./posts.json").then(response => {
        if (!response.ok) {
          throw new Error("Could not load posts.json");
        }

        return response.json();
      }),

      fetch("./verified.json").then(response => {
        if (!response.ok) {
          throw new Error("Could not load verified.json");
        }

        return response.json();
      })
    ])
      .then(([postsData, verifiedData]) => {
        setPosts(postsData);
        setVerifiedUsers(verifiedData);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const filteredPosts = posts.filter(post => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      post.body.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-base-100">
      <div className="mx-auto grid min-h-screen max-w-[1280px] grid-cols-1 md:grid-cols-[80px_minmax(0,680px)] lg:grid-cols-[220px_minmax(0,680px)_300px]">
        <Sidebar />

        <main className="min-w-0 border-base-300 md:border-r">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-base-300 bg-base-100/90 px-4 py-3 backdrop-blur-xl">
            <div>
              <h1 className="text-xl font-bold">
                Home
              </h1>

              <span className="text-xs text-base-content/50">
                Latest posts
              </span>
            </div>

            <label className="input input-sm hidden w-48 items-center gap-2 sm:flex">
              <Search size={17} />

              <input
                type="search"
                placeholder="Search Forums"
                value={search}
                onChange={event =>
                  setSearch(event.target.value)
                }
              />
            </label>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <span className="loading loading-spinner loading-md" />
            </div>
          )}

          {error && (
            <div className="alert alert-error m-4">
              <span>{error}</span>
            </div>
          )}

          {!loading &&
            !error &&
            filteredPosts.length === 0 && (
              <div className="py-20 text-center text-base-content/50">
                No posts found.
              </div>
            )}

          {!loading &&
            !error &&
            filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                verifiedUsers={verifiedUsers}
              />
            ))}
        </main>

        <aside className="hidden p-5 lg:block">
          <div className="card mb-4 border border-base-300 bg-base-200">
            <div className="card-body">
              <h2 className="card-title">
                About Forums
              </h2>

              <p className="text-sm text-base-content/60">
                An open social platform powered by
                GitHub.
              </p>

              <div className="card-actions">
                <a
                  className="btn btn-primary btn-sm"
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github size={16} />
                  GitHub
                </a>
              </div>
            </div>
          </div>

          <div className="card border border-base-300 bg-base-200">
            <div className="card-body">
              <h2 className="card-title">
                Trending
              </h2>

              <div className="py-2">
                <div className="font-bold">
                  #Minecraft
                </div>

                <div className="text-xs text-base-content/50">
                  Trending
                </div>
              </div>

              <div className="py-2">
                <div className="font-bold">
                  #Godot
                </div>

                <div className="text-xs text-base-content/50">
                  Trending
                </div>
              </div>

              <div className="py-2">
                <div className="font-bold">
                  #OpenSource
                </div>

                <div className="text-xs text-base-content/50">
                  Trending
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;

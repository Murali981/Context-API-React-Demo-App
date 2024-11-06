import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { faker } from "@faker-js/faker";

function createRandomPost() {
  return {
    title: `${faker.hacker.adjective()} ${faker.hacker.noun()}`,
    body: faker.hacker.phrase(),
  };
}

function App() {
  const [posts, setPosts] = useState(() =>
    Array.from({ length: 30 }, () => createRandomPost())
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isFakeDark, setIsFakeDark] = useState(false);

  // Derived state. These are the posts that will actually be displayed
  const searchedPosts =
    searchQuery.length > 0
      ? posts.filter((post) =>
          `${post.title} ${post.body}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
      : posts;

  const handleAddPost = useCallback(function handleAddPost(post) {
    // Here the useCallback hook will not immediately call the above handleAddPost() function but this will simply
    // memoize this function. useMemo() hook will store the result as a value after calling the callback function but in this
    // useCallback() hook only the function itself is memoized now.
    setPosts((posts) => [post, ...posts]);
  }, []);

  function handleClearPosts() {
    setPosts([]);
  }

  // Whenever `isFakeDark` changes, we toggle the `fake-dark-mode` class on the HTML element (see in "Elements" dev tool).
  useEffect(
    function () {
      document.documentElement.classList.toggle("fake-dark-mode");
    },
    [isFakeDark]
  );

  // The below archiveOptions object is recreated over and over again each time the app component re-renders And so basically
  // the prop the below Archive component receives is recreated over and over again each time the app component re-renders because
  // the archiveOptions object prop is treated as different everytime when the app component re-renders because in react
  // two objects are always treated as differently everytime when the app component re-renders event both objects that we
  // have passed into the Archive component are treated as different everytime when the app component re-renders. To solve this
  // issue as to make this archiveOptions object stable and here where the useMemo() hook comes in play.
  const archiveOptions = useMemo(() => {
    // This callback function will only run on the initial render and the result will be stored in the cache which is nothing
    // but a memory where the React will remember across re-renders.
    return {
      show: false,
      title: `Post archive in addition to ${posts.length} main posts`,
    };
  }, [posts.length]); // This useMemo() hook will return an object but there could be some intensive calculation going on which is the reason
  // useMemo() hook will take in a function but not just a value. Again whatever we return from the useMemo() hook will be
  // stored in the cache which is nothing but a memory where the React will remember across re-renders. To this useMemo() hook
  // we will pass a dependency array where based on this it will decide when to recalculate the value again. By specifying an
  // empty dependency array here which means this value will only be computed in the beginning and then it will never change,
  // and it will never be recomputed again.

  return (
    <section>
      <button
        onClick={() => setIsFakeDark((isFakeDark) => !isFakeDark)}
        className="btn-fake-dark-mode"
      >
        {isFakeDark ? "☀️" : "🌙"}
      </button>

      <Header
        posts={searchedPosts}
        onClearPosts={handleClearPosts}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <Main posts={searchedPosts} onAddPost={handleAddPost} />
      <Archive
        archiveOptions={archiveOptions}
        onAddPost={handleAddPost}
        setIsFakeDark={setIsFakeDark}
      />
      <Footer />
    </section>
  );
}

function Header({ posts, onClearPosts, searchQuery, setSearchQuery }) {
  return (
    <header>
      <h1>
        <span>⚛️</span>The Atomic Blog
      </h1>
      <div>
        <Results posts={posts} />
        <SearchPosts
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <button onClick={onClearPosts}>Clear posts</button>
      </div>
    </header>
  );
}

function SearchPosts({ searchQuery, setSearchQuery }) {
  return (
    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search posts..."
    />
  );
}

function Results({ posts }) {
  return <p>🚀 {posts.length} atomic posts found</p>;
}

function Main({ posts, onAddPost }) {
  return (
    <main>
      <FormAddPost onAddPost={onAddPost} />
      <Posts posts={posts} />
    </main>
  );
}

function Posts({ posts }) {
  return (
    <section>
      <List posts={posts} />
    </section>
  );
}

function FormAddPost({ onAddPost }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = function (e) {
    e.preventDefault();
    if (!body || !title) return;
    onAddPost({ title, body });
    setTitle("");
    setBody("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Post body"
      />
      <button>Add post</button>
    </form>
  );
}

function List({ posts }) {
  return (
    <ul>
      {posts.map((post, i) => (
        <li key={i}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </li>
      ))}
    </ul>
  );
}

// We will wrap the below Archive component into a React's memo function. In the below memo() function , We are passing
// the Archive component as argument and then this memo() function is memoizing the Archive component and it will return
// a brand new component and we have to store this brand new component somewhere and for this we are creating a new variable
// Archive and storing the brand new component in this variable. And now this Archive as the memoized version of the
// original component Archive. And please remember this Archive component is a great candidate for memoization because this
// Archive component is very heavy as it re-renders very often and it does so with the same props and the only prop that this
// Archive component has the show prop which is always false.
const Archive = memo(function Archive({ archiveOptions, onAddPost }) {
  // Here we don't need the setter function. We're only using state to store these posts because the callback function passed into useState (which generates the posts) is only called once, on the initial render. So we use this trick as an optimization technique, because if we just used a regular variable, these posts would be re-created on every render. We could also move the posts outside the components, but I wanted to show you this trick 😉
  const [posts] = useState(
    () =>
      // 💥 WARNING: This might make your computer slow! Try a smaller `length` first
      Array.from({ length: 10000 }, () => createRandomPost()) // This basically creates 10000 random posts in the very beginning
    // and store the 10000 posts in the `posts`  state
  );

  const [showArchive, setShowArchive] = useState(archiveOptions.show); // By default all these 10000 posts are not actually shown because we
  // have the showArchive state set to false.

  return (
    <aside>
      <h2>{archiveOptions.title}</h2>
      <button onClick={() => setShowArchive((s) => !s)}>
        {showArchive ? "Hide archive posts" : "Show archive posts"}
      </button>

      {showArchive && (
        <ul>
          {posts.map((post, i) => (
            <li key={i}>
              <p>
                <strong>{post.title}:</strong> {post.body}
              </p>
              <button onClick={() => onAddPost(post)}>Add as new post</button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
});

function Footer() {
  return <footer>&copy; by The Atomic Blog ✌️</footer>;
}

export default App;

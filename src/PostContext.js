import { createContext, useContext, useState } from "react";
import { faker } from "@faker-js/faker";

function createRandomPost() {
  return {
    title: `${faker.hacker.adjective()} ${faker.hacker.noun()}`,
    body: faker.hacker.phrase(),
  };
}

const PostContext = createContext(); // To this createContext() function we can pass a default value into it but we will never do that because this value cannot
// change over time. So we will either pass "null" (or) simply leave an empty string here. Calling the createContext() function will return
// a context. Now after creating this context we can pass the value into the context provider

function PostProvider({ children }) {
  const [posts, setPosts] = useState(() =>
    Array.from({ length: 30 }, () => createRandomPost())
  ); // Rememeber the callback function which is inside the useState hook will only run on the initial render

  const [searchQuery, setSearchQuery] = useState("");

  // Derived state. These are the posts that will actually be displayed
  const searchedPosts =
    searchQuery.length > 0
      ? posts.filter((post) =>
          `${post.title} ${post.body}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
      : posts;

  function handleAddPost(post) {
    setPosts((posts) => [post, ...posts]);
  }

  function handleClearPosts() {
    setPosts([]);
  }

  return (
    // In the below we are wrapping up the entire <section> component into a <PostContext.Provider> where the provider is getting access from the
    // PostContext. We have to pass a value into the below <PostContext.Provider> which is basically the second step
    // 2) PROVIDE VALUE TO THE CHILD COMPONENTS.
    // The value={{}} that we are passing here is making accessible to all the child components
    <PostContext.Provider
      value={{
        posts: searchedPosts,
        onAddPost: handleAddPost,
        onClearPosts: handleClearPosts,
        searchQuery,
        setSearchQuery,
      }}
      // The value that we are passing above is the derived state "searchedPosts" and two event handler functions which are "handleAddPost"
      // and "handleClearPosts"  and we all put them into an object and passing them as different properties
    >
      {children}
    </PostContext.Provider>
  );
}

function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("PostContext was used outside of the PostProvider");
  }
  return context;
}

export { PostProvider, usePosts };

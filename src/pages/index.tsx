import { SignInButton, useSession, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Loading from "~/components/Loading";
import { useState } from "react";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    }
  });

  if(!user) return null;
  console.log(user.id);
  return (
    <div className="flex gap-3 w-full">
      <Image 
        src={user.profileImageUrl} 
        alt={`@profile picture`}  
        className="w-14 h-14 rounded-full" 
        width={56}
        height={56}
      />
      <input
        placeholder="Type some emoji's!"
        className="bg-transparent grow outline-none"
        value={input}
        type="text"
        onChange={(event) => setInput(event.target.value)}
      />
      <button
        onClick={() => mutate({ content: input })}
        className=""
        disabled={isPosting}
      >
        Post
      </button>
    </div>
  );
}

type PostWithUser = RouterOutputs['posts']['getAll'][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="p-4 border-b border-slate-400 flex flex-row gap-3">
      <Image 
        src={author.profilePictureURL}
        alt={`@${author.username} profile picture`}
        className="w-14 h-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300 gap-1">
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{` • ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span className="text-xl">{post.content}</span>
      </div>
    </div>
  );
}

const Feed = () => {

  const { data, isLoading: postLoading } = api.posts.getAll.useQuery();

  if(postLoading) return <Loading />

  if(!data) return <div>Something went wrong</div>
  
  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );

}

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.posts.getAll.useQuery();

  if(!userLoaded) return <div />
  
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
        <div className="w-full md:max-w-2xl border-x border-slate-400 h-full">
          <div className="border-b border-slate-200 p-4">
            {!isSignedIn && 
              <div className="flex justify-center">
                <SignInButton />
              </div>
            }
            {isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;

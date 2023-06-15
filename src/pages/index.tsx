import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Loading from "~/components/Loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/Layout";
import PostView from "~/components/PostView";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) toast.error(errorMessage[0]);
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
        disabled={isPosting}
        onKeyDown={(e) => {
          if(e.key === "Enter") {
            e.preventDefault();
            if(input !== "") {
              mutate({ content: input });
            }
          }
        }}
      />
      <div className="flex justify-center items-center">
      { input !== "" && !isPosting && (
        <button
          onClick={() => mutate({ content: input })}
          className=""
          >
          Post
        </button>
      )} 
      {isPosting && <Loading />}
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
    <PageLayout>
      <div className="flex border-b border-slate-400 p-4">
        {!isSignedIn && 
          <div className="flex justify-center">
            <SignInButton />
          </div>
        }
        {isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
    </PageLayout>
  );
};

export default Home;

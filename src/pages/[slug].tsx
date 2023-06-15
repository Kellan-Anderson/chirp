import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/Layout";
import Image from "next/image";

const ProfileFeed = (props: {userID: string}) => {
  const { data, isLoading } = api.posts.getPostsByUserID.useQuery({ userID: props.userID });

  if(isLoading) return <Loading />
  if(!data || data.length === 0) return <div>User has not posted</div>

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
}

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {

  const { data } = api.profile.getUserByUsername.useQuery({ username })

  if(!data) return <div>404</div>
  
  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="h-36 border-slate-400 bg-slate-600 relative">
          <Image 
            src={data.profilePictureURL}
            alt={`${data.username ?? ""}'s profile pic`}
            width={128}
            height={128}
            className="-mb-[64px] absolute bottom-0 left-0 rounded-full border-4 border-black ml-4 bg-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${data.username ?? ""}`}</div>
        <div className="border-b border-slate-400 w-full"></div>
        <ProfileFeed userID={data.id} />
      </PageLayout>
    </>
  );
};

export default ProfilePage;

import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import Loading from "~/components/Loading";
import PostView from "~/components/PostView";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson
  });

  const slug = context.params?.slug;

  if(typeof slug !== "string") throw new Error('No Slug');
  
  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username })

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username
    }
  }
}

export const getStaticPaths: GetStaticPaths =  () => {
  return {
    paths: [],
    fallback: "blocking"
  }
}

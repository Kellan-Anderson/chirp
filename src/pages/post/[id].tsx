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

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {

  const { data } = api.posts.getById.useQuery({ id })

  if(!data) return <div>404</div>
  
  return (
    <>
      <Head>
        <title>{`${data.post.content} - ${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

export default SinglePostPage;

import Loading from "~/components/Loading";
import PostView from "~/components/PostView";
import { generateSSGHelper } from "~/server/helper/ssgHelper";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if(typeof id !== "string") throw new Error('No Slug');

  await ssg.posts.getById.prefetch({ id })

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id
    }
  }
}

export const getStaticPaths: GetStaticPaths =  () => {
  return {
    paths: [],
    fallback: "blocking"
  }
}

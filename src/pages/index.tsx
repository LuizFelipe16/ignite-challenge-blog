import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FiUser, FiCalendar } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview?: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);

  async function handleLoadMorePostsNext() {
    fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(data => {
        console.log(data);

        const next_posts: Post[] = data?.results?.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            }
          }
        });

        postsPagination.next_page = data.next_page;

        setPosts([...posts, ...next_posts]);
      });
  }

  return (
    <>
      <Head><title>Posts | SpaceTraveling</title></Head>

      <main className={commonStyles.container}>
        <Header />

        <div className={styles.posts}>
          {posts?.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`} passHref>
              <div className={styles.post}>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <footer>
                  <div>
                    <FiCalendar />
                    <time>
                      {format(
                        new Date(post.first_publication_date),
                        "d MMM yyyy",
                        { locale: ptBR }
                      )}
                    </time>
                  </div>
                  <div>
                    <FiUser />
                    <span>{post.data.author}</span>
                  </div>
                </footer>
              </div>
            </Link>
          ))}

          {postsPagination?.next_page !== null ? (
            <button onClick={handleLoadMorePostsNext} type="button">Carregar mais posts</button>
          ) : null}

          {preview && (
            <aside>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData
}) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    pageSize: 1,
    ref: previewData?.ref ?? null,
  });

  const posts = postsResponse?.results?.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      },
      preview
    }
  }
};
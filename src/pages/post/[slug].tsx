import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import Header from '../../components/Header';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

// interface Post {
//   first_publication_date: string | null;
//   data: {
//     title: string;
//     banner: {
//       url: string;
//     };
//     author: string;
//     content: {
//       heading: string;
//       body: string;
//     }[];
//   };
// }

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: Record<string, unknown>[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  function calculate() {
    function text(value) {
      value.replace(/(\r\n|\n|\r)/g, " ").trim();

      var cont = value.split(/\s+/g).length;

      return cont;
    }

    const length = post.data.content.map((value) => {
      const bodyText = text(RichText.asText(value.body));
      const headingText = text(value.heading);

      const length = bodyText + headingText;

      return length
    });

    const total_length = length.reduce((acc: 0, value) => {
      return acc + value
    });

    const minutes = Math.ceil(total_length / 200);

    return minutes;
  }

  const HtmlSerializer = (type: string, text: string) => {
    if (type === 'paragraph') {
      return (
        <p key={text} className="paragraph">{text}</p>
      );
    }

    if (type === 'list-item') {
      return (
        <li key={text} className="list-item">{text}</li>
      );
    }

    return null;
  }

  if (router.isFallback) {
    return <h1>Carregando...</h1>
  }

  return (
    <>
      <Head><title>{post.data.title} | SpaceTraveling</title></Head>
      <main className={`${commonStyles.container} ${styles.main}`}>
        <Header />

        <img className={styles.banner} src={`${post.data.banner.url}`} alt="Banner" />

        <article className={styles.post}>
          <h1>{post.data.title}</h1>

          <div className={styles.info}>
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
            <div>
              <FiClock size={20} />
              <span>{calculate()} min</span>
            </div>
          </div>

          {post.data.content.map(content => {
            // console.log(content);
            return (
              <div key={content.heading} className={styles.content}>
                <h1>{content.heading}</h1>
                {/* <div
                  className={styles.postContent}
                dangerouslySetInnerHTML={{ __html: content.body }}
                /> */}
                {content.body.map((element: any) => HtmlSerializer(element.type, element.text))}
              </div>
            )
          })}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    pageSize: 1
  });

  const paths = postsResponse?.results?.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const { slug } = params;

  const response = await prismic.getByUID('posts', String(slug), {});

  // console.log(response.data);

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: content.body
      }))
    }
  }

  return {
    props: {
      post
    }
  }
};
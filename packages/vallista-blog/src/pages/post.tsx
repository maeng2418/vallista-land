import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { graphql } from 'gatsby'
import { useCallback, VFC } from 'react'
import { PageProps, PostQuery } from 'types/type'

import { Layout } from '../components/Layout'
import { Markdown } from '../components/Markdown'
import { PostHeader } from '../components/PostHeader'
import { Series } from '../components/Series'
import { useConfig } from '../hooks/useConfig'

const Post: VFC<PageProps<PostQuery>> = (props) => {
  const { author } = useConfig()
  const { allMarkdownRemark, seriesGroup } = props.data
  const { edges } = allMarkdownRemark
  const { timeToRead, excerpt, html } = props.data.markdownRemark
  const { title, date, image, tags, series } = props.data.markdownRemark.frontmatter

  const cachedFilterSeries = useCallback(getFilteredSeries, [props.data])

  return (
    <Layout seo={{ title: title, description: excerpt, article: html }} edges={edges}>
      <Main>
        <article>
          <PostHeader
            title={title}
            date={date}
            image={image?.publicURL}
            tags={tags}
            timeToRead={timeToRead}
            author={author}
          >
            {series && seriesGroup && <Series name={series} posts={cachedFilterSeries()} />}
          </PostHeader>
          <Markdown html={html} />
        </article>
        <section id='comments'></section>
      </Main>
    </Layout>
  )

  function getFilteredSeries(): { name: string; timeToRead: number }[] {
    return allMarkdownRemark.edges
      .filter((it) => it.node.frontmatter.series)
      .filter((it) => it.node.frontmatter.series === series)
      .map((it) => ({ name: it.node.frontmatter.title, timeToRead: it.node.timeToRead }))
  }
}

export default Post

export const pageQuery = graphql`
  query BlogPostQuery($id: String) {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { draft: { eq: false } } }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          timeToRead
          frontmatter {
            title
            date
            tags
            image {
              relativePath
              relativeDirectory
              root
              sourceInstanceName
              publicURL
            }
            series
            seriesPriority
          }
          html
        }
      }
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }
    seriesGroup: allMarkdownRemark {
      group(field: frontmatter___series) {
        fieldValue
        totalCount
      }
    }
    markdownRemark(id: { eq: $id }) {
      id
      html
      excerpt
      fields {
        slug
      }
      headings {
        value
        depth
      }
      timeToRead
      frontmatter {
        title
        tags
        date
        image {
          relativePath
          relativeDirectory
          root
          sourceInstanceName
          publicURL
        }
        series
      }
    }
  }
`

const Main = styled.main`
  ${({ theme }) => css`
    margin-left: 400px;

    @media screen and (max-width: 1000px) {
      margin-left: 0;
    }

    /* a */
    a {
      cursor: pointer;
      border-bottom: 2px solid ${theme.colors.HIGHLIGHT.PINK};
      font-weight: 600;
      text-decoration: none;
      color: ${theme.colors.PRIMARY.FOREGROUND};
      transition: all 0.1s ease-out;

      &:hover {
        background: ${theme.colors.HIGHLIGHT.PINK};
        border-top: 2px solid ${theme.colors.HIGHLIGHT.PINK};
        color: ${theme.colors.PRIMARY.BACKGROUND};
      }
    }
  `}
`

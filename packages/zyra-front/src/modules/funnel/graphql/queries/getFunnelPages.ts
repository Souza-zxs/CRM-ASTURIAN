import { gql } from '@apollo/client';

export const GET_FUNNEL_PAGES = gql`
  query FunnelPages {
    funnelPages {
      id
      type
      slug
      status
      content
      seoTitle
      seoDescription
      createdAt
      updatedAt
    }
  }
`;

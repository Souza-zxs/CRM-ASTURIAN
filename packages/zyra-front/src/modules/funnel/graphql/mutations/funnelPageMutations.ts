import { gql } from '@apollo/client';

const FUNNEL_PAGE_FIELDS = `
  id
  type
  slug
  status
  content
  seoTitle
  seoDescription
  createdAt
  updatedAt
`;

export const CREATE_FUNNEL_PAGE = gql`
  mutation CreateFunnelPage($input: CreateFunnelPageInput!) {
    createFunnelPage(input: $input) {
      ${FUNNEL_PAGE_FIELDS}
    }
  }
`;

export const UPDATE_FUNNEL_PAGE = gql`
  mutation UpdateFunnelPage($input: UpdateFunnelPageInput!) {
    updateFunnelPage(input: $input) {
      ${FUNNEL_PAGE_FIELDS}
    }
  }
`;

export const PUBLISH_FUNNEL_PAGE = gql`
  mutation PublishFunnelPage($id: UUID!) {
    publishFunnelPage(id: $id) {
      ${FUNNEL_PAGE_FIELDS}
    }
  }
`;

export const UNPUBLISH_FUNNEL_PAGE = gql`
  mutation UnpublishFunnelPage($id: UUID!) {
    unpublishFunnelPage(id: $id) {
      ${FUNNEL_PAGE_FIELDS}
    }
  }
`;

export const DELETE_FUNNEL_PAGE = gql`
  mutation DeleteFunnelPage($id: UUID!) {
    deleteFunnelPage(id: $id)
  }
`;

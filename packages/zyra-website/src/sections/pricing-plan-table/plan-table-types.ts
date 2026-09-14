import { type MessageDescriptor } from '@lingui/core';

export type PlanTableTierId = 'organization' | 'pro';

export type PlanTableCellType =
  | { kind: 'dash' }
  | { kind: 'text'; text: MessageDescriptor }
  | { kind: 'yes'; label?: MessageDescriptor };

export type PlanTableTierColumnType = {
  id: PlanTableTierId;
  label: MessageDescriptor;
};

export type PlanTableCategoryRowDataType = {
  title: MessageDescriptor;
  type: 'category';
};

export type PlanTableFeatureRowDataType = {
  featureLabel: MessageDescriptor;
  tiers: Record<PlanTableTierId, PlanTableCellType>;
  type: 'row';
};

export type PlanTableBodyRowDataType =
  | PlanTableCategoryRowDataType
  | PlanTableFeatureRowDataType;

export type PlanTableDataType = {
  featureColumnLabel: MessageDescriptor;
  initialVisibleRowCount: number;
  rows: PlanTableBodyRowDataType[];
  seeMoreFeaturesCta: {
    collapseLabel: MessageDescriptor;
    expandLabel: MessageDescriptor;
  };
  tierColumns: PlanTableTierColumnType[];
};

import { GridRowParams, GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { Instance, Organization } from '@theniledev/js';

export interface InstanceListProps {
  entity: string;
  org: string;
  handleRowClick?: (params: GridRowParams) => void;
  additionalColumns?: GridColDef[];
  columns?: Array<string>;
  showExpandedView?: boolean;
  actionButtons?: React.ReactNode[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  processColumns?: (header: string, flatSchema: any) => GridColDef;
  expandedView?: ({ instances }: { instances: Instance[] }) => React.ReactNode;
  useQuery?: typeof useQuery;
  emptyState?: ({
    entity,
    organization,
  }: {
    entity: string;
    organization: Organization;
  }) => React.ReactNode;
}

export type ComponentProps = React.FunctionComponent<
  Omit<InstanceListProps, 'entity' | 'org'>
>;

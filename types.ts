import { RotaSearchParamsFilter } from '../../hooks/rotaSearchParams/types';

export type OperatorsType = {
  [key: string]: 'or' | 'and';
};
export type ConditionType = {
  [key: string]:
    | 'exclude'
    | 'include'
    | 'contains'
    | 'between'
    | 'eq'
    | 'ne'
    | 'ge'
    | 'le';
};
export interface FilterBuilderProps<TRowData> {
  settings: any;
  availableFilters: Array<{
    key: string;
    label: string;
    jsxElement?: React.ReactNode;
  }>;
  defaultConditions: ConditionType;
  filters: string[];
  setFilters: (FilterOption) => void;
  listId: string;
  operator: OperatorsType;
  setOperator: (OperatorsType) => void;
  condition: ConditionType;
  setCondition: (ConditionType) => void;
  methods: any;
  defaultSearchParams?: RotaSearchParamsFilter<Partial<TRowData>>;
}

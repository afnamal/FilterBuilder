import { Add, FilterList, FilterListOff } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';
import { Controller, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
// TODO: Consider implementing your own search params hook for better control and customization
import FilterAutocomplete from './components/FilterAutocomplete';
import FilterDatePicker from './components/FilterDatePicker';
import { MAX_DATE, MIN_DATE } from './dateConstants';
import { ConditionType, FilterBuilderProps, OperatorsType } from './types';

const FilterBuilder = <TRowData,>({
  settings,
  availableFilters,
  defaultConditions,
  setFilters,
  listId,
  operator,
  setOperator,
  methods,
  condition,
  setCondition,
  defaultSearchParams,
  filters,
}: FilterBuilderProps<TRowData>) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const [groups, setGroups] = React.useState<Array<Array<string>>>([[]]);

  // TODO: Consider implementing your own search params hook for better control and customization
  // This hook manages URL search parameters for filtering. You can create your own version
  // that better fits your specific needs and requirements.
  useSearchParams<any>({
    id: listId,
    methods,
    settings,
    defaultSearchParams,
  });

  // TODO: Consider implementing your own search params hook for better control and customization
  // This hook provides resetFilter and setFilter functions for managing filter state in URL
  const { resetFilter, setFilter } = useSearchParams<any>({
    id: listId,
    methods,
    settings,
    defaultSearchParams,
  });

  React.useEffect(() => {
    if (defaultSearchParams && Object.keys(defaultSearchParams).length > 0) {
      const defaultFilterKeys = Object.keys(defaultSearchParams);
      const updatedGroups: Array<Array<string>> = [];
      const newOperator: OperatorsType = { ...operator };
      const newCondition: ConditionType = { ...condition };

      defaultFilterKeys.forEach((filterKey) => {
        const filter = filterKey as string;
        const filterData = defaultSearchParams[filter];

        if (filterData) {
          newOperator[filter] = filterData.operator || 'and';
          newCondition[filter] =
            filterData.condition || defaultConditions[filter];

          if (settings[filter]?.type === 'date') {
            if (
              filterData.condition === 'between' &&
              Array.isArray(filterData.value)
            ) {
              const fromKey = settings[filter]?.inputFields
                ? settings[filter].inputFields[0]
                : `${filter}From`;
              const toKey = settings[filter]?.inputFields
                ? settings[filter].inputFields[1]
                : `${filter}To`;
              methods.setValue(fromKey, filterData.value[0]);
              methods.setValue(toKey, filterData.value[1]);
            } else {
              methods.setValue(filter, filterData.value);
            }
          } else if (
            settings[filter]?.type === 'number' &&
            filterData.condition === 'between' &&
            Array.isArray(filterData.value)
          ) {
            methods.setValue(`${filter}From`, filterData.value[0]);
            methods.setValue(`${filter}To`, filterData.value[1]);
          } else {
            methods.setValue(filter, filterData.value);
          }

          if (filterData.operator === 'or') {
            updatedGroups.push([filter]);
          } else {
            if (
              updatedGroups.length === 0 ||
              updatedGroups[updatedGroups.length - 1].length === 0
            ) {
              updatedGroups.push([filter]);
            } else {
              updatedGroups[updatedGroups.length - 1].push(filter);
            }
          }
        }
      });

      const filteredGroups = updatedGroups.filter((group) => group.length > 0);

      setOperator(newOperator);
      setCondition(newCondition);
      setGroups(filteredGroups.length > 0 ? filteredGroups : [[]]);
      setFilters(defaultFilterKeys);
    }
  }, []);

  React.useEffect(() => {
    const searchParam = searchParams.get('Search');
    if (searchParam) {
      try {
        const searchObject = JSON.parse(decodeURIComponent(searchParam));
        const Datagrid = searchObject?.[listId]?.filter || {};
        const updatedGroups: Array<Array<string>> = [];
        const newOperator: OperatorsType = { ...operator };
        const newCondition: ConditionType = { ...condition };

        Object.keys(Datagrid).forEach((filterKey) => {
          const filter = filterKey as string;
          const {
            operator: filterOperator,
            value,
            condition: filterCondition,
          } = Datagrid[filter] || {};

          newOperator[filter] = filterOperator || 'and';
          newCondition[filter] = filterCondition || condition[filter];

          if (filterOperator === 'or') {
            updatedGroups.push([filter]);
          } else {
            if (
              updatedGroups.length === 0 ||
              updatedGroups[updatedGroups.length - 1].length === 0
            ) {
              updatedGroups.push([filter]);
            } else {
              updatedGroups[updatedGroups.length - 1].push(filter);
            }
          }

          methods.setValue(filter, value || null);
        });

        const filteredGroups = updatedGroups.filter(
          (group) => group.length > 0
        );

        setOperator(newOperator);
        setCondition(newCondition);
        setGroups(filteredGroups.length > 0 ? filteredGroups : [[]]);
        setFilters(Object.keys(Datagrid) as string[]);
      } catch (error) {
        console.error('Error parsing filters from URL:', error);
      }
    }
  }, [searchParams, methods, listId]);

  const getConditionOptions = (type: string): any => {
    switch (type) {
      case 'string':
        return [
          { value: 'eq', label: 'Equal' },
          { value: 'ne', label: 'Not Equal' },
          { value: 'contains', label: 'Contains' },
        ];
      case 'number':
        return [
          { value: 'eq', label: 'Equal' },
          { value: 'ne', label: 'Not Equal' },
          { value: 'ge', label: 'Greater or Equal' },
          { value: 'le', label: 'Lesser or Equal' },
          { value: 'between', label: 'Between' },
        ];
      case 'date':
        return [
          { value: 'between', label: 'Between' },
          { value: 'ge', label: 'Greater or Equal' },
          { value: 'le', label: 'Lesser or Equal' },
        ];

      case 'boolean':
        return [
          { value: 'eq', label: 'Equal' },
          { value: 'ne', label: 'Not Equal' },
        ];
      default:
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'eq', label: 'Equal' },
          { value: 'ne', label: 'Not Equal' },
        ];
    }
  };

  const addFilterToGroup = (filter: string, operator: 'and' | 'or') => {
    setGroups((prevGroups) => {
      let updatedGroups = [...prevGroups];

      updatedGroups = updatedGroups.map((group) =>
        group.includes(filter) ? group.filter((item) => item !== filter) : group
      );

      if (operator === 'and') {
        const lastGroup = updatedGroups[updatedGroups.length - 1];
        if (lastGroup) {
          lastGroup.push(filter);
        } else {
          updatedGroups.push([filter]);
        }
      } else if (operator === 'or') {
        updatedGroups.push([filter]);
      }

      updatedGroups = updatedGroups.filter((group) => group.length > 0);

      return updatedGroups;
    });
  };

  const removeFilter = (filter: string) => {
    setGroups((prevGroups) => {
      const updatedGroups = prevGroups
        .map((group) => group.filter((item) => item !== filter))
        .filter((group) => group.length > 0);

      return updatedGroups;
    });

    setFilters((prevFilters) => prevFilters.filter((f) => f !== filter));

    setOperator((prev) => ({
      ...prev,
      [filter]: 'and',
    }));

    setCondition((prev) => ({
      ...prev,
      [filter]: defaultConditions[filter],
    }));

    methods.setValue(filter, undefined);
  };

  const addFilter = (filter) => {
    if (!filters.includes(filter)) {
      setFilters([...filters, filter]);
    }
  };

  const handleReset = () => {
    setGroups([[]]);
    setFilters([]);
    resetFilter();

    setOperator(
      availableFilters.reduce((acc, filter) => {
        acc[filter.key] = 'and';
        return acc;
      }, {} as OperatorsType)
    );
    setCondition(defaultConditions);
  };
  const onSubmit: SubmitHandler<any> = (data) => {
    const orderedFilters = groups.flat();
    const orderedData: Record<string, any> = {};

    orderedFilters.forEach((filter) => {
      const filterCondition = condition[filter];
      const filterSetting = settings[filter];

      if (filterSetting?.type === 'date') {
        let fromKey: string;
        let toKey: string;

        if (filterSetting?.inputFields) {
          fromKey = filterSetting.inputFields[0];
          toKey = filterSetting.inputFields[1];
        } else {
          fromKey = `${filter}From`;
          toKey = `${filter}To`;
        }

        if (filterCondition === 'between') {
          orderedData[filter] = [
            new Date(data[fromKey] ?? MIN_DATE),
            new Date(data[toKey] ?? MAX_DATE),
          ];
        } else {
          orderedData[filter] = [new Date(data[filter]).toISOString()];
        }
      } else if (
        filterSetting?.type === 'number' &&
        filterCondition === 'between'
      ) {
        const fromKey = `${filter}From`;
        const toKey = `${filter}To`;

        orderedData[filter] = [
          data[fromKey] ?? Number.MIN_SAFE_INTEGER,
          data[toKey] ?? Number.MAX_SAFE_INTEGER,
        ];
      } else {
        orderedData[filter] = data[filter];
      }
    });

    setFilter(orderedData);
  };

  return (
    <form
      onSubmit={methods.handleSubmit(onSubmit)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {availableFilters.map((filter) => (
              <Box
                key={filter.key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  border: '1px solid',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  backgroundColor: filters.includes(filter.key)
                    ? theme.palette.info.main
                    : theme.palette['modeColor'],
                }}
                onClick={() => {
                  filters.includes(filter.key)
                    ? removeFilter(filter.key)
                    : (addFilter(filter.key),
                      addFilterToGroup(filter.key, operator[filter.key]));
                }}
              >
                {filters.includes(filter.key) ? (
                  <DeleteIcon fontSize="small" sx={{ marginLeft: 'auto' }} />
                ) : (
                  <Add fontSize="small" />
                )}
                <Typography key={filter.key}>
                  {t(filter.label as string, { defaultValue: filter.label })}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Box>
          {groups.map((group, groupIndex) => (
            <>
              {filters.length > 0 && (
                <Box
                  key={`group-${groupIndex}`}
                  sx={{
                    borderRadius: '8px',
                    padding: '10px',
                    paddingTop: '20px',
                    marginBottom: '16px',
                    position: 'relative',
                  }}
                >
                  {groups.length >= 2 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '-12px',
                        left: '16px',
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        padding: '2px 8px',
                      }}
                    >
                      {t('Group')} {groupIndex + 1}
                    </Box>
                  )}

                  {group.map((filter, index) => (
                    <>
                      {availableFilters.map((avFilter) =>
                        filter === avFilter.key ? (
                          <Box
                            key={filter}
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              gap: 2,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                flexGrow: 6,
                                width: '100%',
                              }}
                            >
                              {avFilter.jsxElement === 'textField' &&
                              condition[filter] !== 'between' ? (
                                <Controller
                                  name={filter}
                                  control={methods.control}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      type={settings[filter].type}
                                      label={t(avFilter.label as string, {
                                        defaultValue: avFilter.label as string,
                                      })}
                                      fullWidth
                                      size="small"
                                      sx={{ mb: 2 }}
                                    />
                                  )}
                                />
                              ) : avFilter.jsxElement === 'textField' &&
                                condition[filter] === 'between' ? (
                                <Box
                                  sx={{
                                    gap: 2,
                                    display: 'flex',
                                    flexDirection: 'row',
                                  }}
                                >
                                  <Controller
                                    name={`${filter}From`}
                                    control={methods.control}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        type={settings[filter].type}
                                        label={`From ${t(
                                          avFilter.label as string,
                                          {
                                            defaultValue:
                                              avFilter.label as string,
                                          }
                                        )}`}
                                        fullWidth
                                        size="small"
                                        sx={{ mb: 2 }}
                                      />
                                    )}
                                  />
                                  <Controller
                                    name={`${filter}To`}
                                    control={methods.control}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        type={settings[filter].type}
                                        label={`To ${t(
                                          avFilter.label as string,
                                          {
                                            defaultValue:
                                              avFilter.label as string,
                                          }
                                        )}`}
                                        fullWidth
                                        size="small"
                                        sx={{ mb: 2 }}
                                      />
                                    )}
                                  />
                                </Box>
                              ) : null}
                              {avFilter.jsxElement === 'boolField' && (
                                <FilterAutocomplete
                                  name={filter}
                                  label={t(avFilter.label as string, {
                                    defaultValue: avFilter.label as string,
                                  })}
                                  control={methods.control}
                                  getOptions={() => ['true', 'false']}
                                />
                              )}
                              {avFilter.jsxElement === 'datePicker' &&
                              condition[filter] === 'between' ? (
                                <Box
                                  sx={{
                                    gap: 2,
                                    display: 'flex',
                                    flexDirection: 'row',
                                  }}
                                >
                                  <FilterDatePicker
                                    name={`${filter}From`}
                                    label={`From ${filter
                                      .replace(/([A-Z])/g, ' $1')
                                      .trim()}`}
                                    control={methods.control}
                                  />
                                  <FilterDatePicker
                                    name={`${filter}To`}
                                    label={`To ${filter
                                      .replace(/([A-Z])/g, ' $1')
                                      .trim()}`}
                                    control={methods.control}
                                  />
                                </Box>
                              ) : avFilter.jsxElement === 'datePicker' &&
                                condition[filter] !== 'between' ? (
                                <FilterDatePicker
                                  name={filter}
                                  label={`${filter
                                    .replace(/([A-Z])/g, ' $1')
                                    .trim()}`}
                                  control={methods.control}
                                  sx={{ minWidth: '85px' }}
                                />
                              ) : null}

                              {avFilter.jsxElement !== 'textField' &&
                                avFilter.jsxElement !== 'datePicker' &&
                                avFilter.jsxElement !== 'boolField' &&
                                avFilter.jsxElement}
                            </Box>
                            <Box sx={{ display: 'flex', flexGrow: 2, gap: 2 }}>
                              {' '}
                              <Select
                                value={condition[filter] ?? ''}
                                onChange={(e) => {
                                  const newValue = e.target.value as
                                    | 'contains'
                                    | 'exclude'
                                    | 'include'
                                    | 'between'
                                    | 'eq'
                                    | 'ne'
                                    | 'ge'
                                    | 'le';
                                  setCondition((prevcon) => ({
                                    ...prevcon,
                                    [filter]: newValue,
                                  }));
                                }}
                                sx={{
                                  maxHeight: 40,
                                  width:
                                    index === 0
                                      ? { xs: 112, sm: 186 }
                                      : { xs: 76, sm: 101 },
                                }}
                              >
                                {settings[filter]?.type &&
                                  getConditionOptions(
                                    settings[filter].type || 'string'
                                  ).map((option) => (
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {t(option.label)}
                                    </MenuItem>
                                  ))}
                              </Select>
                              {index !== 0 && (
                                <Box sx={{ display: 'flex', flexGrow: 1 }}>
                                  <ToggleButtonGroup
                                    value={operator[filter]}
                                    exclusive
                                    onChange={(event, newOperator) => {
                                      if (newOperator) {
                                        setOperator((prev) => ({
                                          ...prev,
                                          [filter]: newOperator,
                                        }));

                                        addFilterToGroup(filter, newOperator);
                                      }
                                    }}
                                    sx={{
                                      maxHeight: 40,
                                      '& .MuiToggleButton-root': {
                                        flex: 1,
                                        maxWidth: 35,
                                      },
                                    }}
                                    aria-label="Operator Selection"
                                  >
                                    <ToggleButton value="or" aria-label="OR">
                                      OR
                                    </ToggleButton>
                                    <ToggleButton value="and" aria-label="AND">
                                      AND
                                    </ToggleButton>
                                  </ToggleButtonGroup>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        ) : null
                      )}
                    </>
                  ))}
                </Box>
              )}

              {groupIndex !== groups.length - 1 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    my: 2,
                  }}
                >
                  <Divider sx={{ flex: 1, borderColor: 'primary.main' }} />
                  <Typography
                    variant="h6"
                    sx={{
                      mx: 2,
                      padding: '4px 8px',
                      borderRadius: '8px',
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                    }}
                  >
                    OR
                  </Typography>
                  <Divider sx={{ flex: 1, borderColor: 'primary.main' }} />
                </Box>
              )}
            </>
          ))}
        </Box>
        {filters.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
            }}
          >
            <Button
              type="submit"
              startIcon={<FilterList />}
              variant="contained"
              sx={{ flexGrow: 1 }}
            >
              APPLY
            </Button>
            <Button
              onClick={() => handleReset()}
              startIcon={<FilterListOff />}
              variant="outlined"
              color="error"
              sx={{ flexGrow: 1 }}
            >
              Reset
            </Button>
          </Box>
        )}
      </Box>
    </form>
  );
};

export default FilterBuilder;

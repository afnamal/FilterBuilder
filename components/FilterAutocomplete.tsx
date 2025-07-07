import {
  Autocomplete,
  CircularProgress,
  SxProps,
  TextField,
  Theme,
} from '@mui/material';
import React from 'react';
import { Control, Controller, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface RotaAutocompleteNewProps<T = Record<string, unknown>> {
  name: string;
  label?: string;
  control: Control<T>;
  getOptions: () => string[] | Promise<string[]>;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
  disabled?: boolean;
}

const FilterAutocomplete = <T extends Record<string, unknown>>({
  name,
  label,
  control,
  getOptions,
  size = 'small',
  sx = { mb: 2 },
  disabled = false,
}: RotaAutocompleteNewProps<T>) => {
  const { t } = useTranslation();
  const [options, setOptions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      try {
        const optionsData = await getOptions();
        setOptions(optionsData);
      } catch (error) {
        console.error('Error loading options:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [getOptions]);

  return (
    <Controller
      name={name as Path<T>}
      control={control}
      render={({ field }) => (
        <Autocomplete
          options={options}
          loading={loading}
          disabled={disabled}
          value={(field.value as string) || null}
          onChange={(event, newValue) => {
            field.onChange(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label ? t(label, { defaultValue: label }) : name}
              size={size}
              sx={sx}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      )}
    />
  );
};

export default FilterAutocomplete;

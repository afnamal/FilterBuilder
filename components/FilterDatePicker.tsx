import { SxProps, Theme } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Control, Controller, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface RotaDatePickerNewProps<T = Record<string, unknown>> {
  name: string;
  label?: string;
  control: Control<T>;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}

const FilterDatePicker = <T extends Record<string, unknown>>({
  name,
  label,
  control,
  size = 'small',
  sx = { mb: 2 },
}: RotaDatePickerNewProps<T>) => {
  const { t } = useTranslation();

  return (
    <Controller
      name={name as Path<T>}
      control={control}
      render={({ field }) => (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label={label ? t(label, { defaultValue: label }) : name}
            value={field.value ? new Date(field.value as string) : null}
            onChange={(newValue) => {
              field.onChange(newValue);
            }}
            slotProps={{
              textField: {
                size,
                sx,
              },
            }}
          />
        </LocalizationProvider>
      )}
    />
  );
};

export default FilterDatePicker;

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FormFieldWrapperProps {
  control: any;
  name: string;
  label: string;
  description?: string;
  type?: string;
  placeholder?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export function FormFieldWrapper({
  control,
  name,
  label,
  description,
  type = "text",
  placeholder,
  inputProps = {},
}: FormFieldWrapperProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="space-y-2">
          <FormLabel className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
            {label}
          </FormLabel>

          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              {...inputProps}
              className={`w-full rounded-xl px-4 py-2 text-sm transition-all duration-200 border focus:ring-2 focus:outline-none focus:ring-indigo-500 dark:bg-gray-800 dark:text-white ${
                fieldState.error
                  ? "border-red-500 bg-red-50 dark:bg-red-950"
                  : "border-gray-300 dark:border-gray-700"
              }`}
            />
          </FormControl>

          {description && (
            <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </FormDescription>
          )}

          <FormMessage className="text-sm text-red-600 dark:text-red-400 font-medium" />
        </FormItem>
      )}
    />
  );
}

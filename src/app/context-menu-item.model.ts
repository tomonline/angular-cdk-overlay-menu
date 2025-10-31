export interface MenuItem {
  label: string;
  icon?: string;
  disabled?: boolean;
  action?: () => void;
  divider?: boolean;
}
import { IconHome, IconClipboardList, IconCreditCard, IconBarChart2, IconAccounting } from '../components/icons';

export const TABS = [
  { id: 'overview', label: 'ภาพรวม', mobileLabel: 'สรุป', icon: IconHome },
  { id: 'dailyOps', label: 'Daily Ops', mobileLabel: 'Ops', icon: IconClipboardList },
  { id: 'paymentDue', label: 'Payment Due', mobileLabel: 'Pay', icon: IconCreditCard },
  { id: 'yearlyReport', label: 'Yearly Report', mobileLabel: 'Year', icon: IconBarChart2 },
  { id: 'accounting', label: 'Accounting', mobileLabel: 'Acct', icon: IconAccounting },
];

export const TAB_TITLES = {
  overview: 'ภาพรวม',
  dailyOps: 'Daily Ops',
  paymentDue: 'Payment Due',
  yearlyReport: 'Yearly Report',
  accounting: 'Accounting',
};

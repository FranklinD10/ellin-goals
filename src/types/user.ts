export type ThemeColorType = 
  | 'red' 
  | 'pink' 
  | 'purple' 
  | 'blue' 
  | 'green' 
  | 'yellow'
  | 'cyan'
  | 'teal'
  | 'indigo'
  | 'orange'
  | 'deepPurple'
  | 'blueGrey';

export interface UserSettings {
  theme: 'light' | 'dark';
  themeColor: ThemeColorType;
  notifications: boolean;
}

export interface UserData {
  displayName: string;
  email: string;
  uid: string;
  settings?: UserSettings;
  createdAt: any;
  lastLogin: any;
}

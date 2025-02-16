# ElLin Goals v2.0.0 Release Notes

## 🚀 Major Version Update

### New Features
- Added RadarChart and AreaChart to the Analytics page for better data visualization.
- Improved layout and padding for charts on the Analytics page.
- Centered the spin loader on the Analytics page.
- Reordered navigation links to have Habits before Stats.

### Bug Fixes
- Fixed overlapping text issue in the category field on the Manage Habits page.

### Performance Improvements
- Optimized chart rendering and layout for better performance.

### Technical Improvements
- Updated Firebase configuration to use `FirestoreSettings.cache` instead of `enableIndexedDbPersistence`.
- Improved TypeScript type definitions and code structure.
- Migrated from Mantine to MUI for a more consistent and modern UI experience.

# ElLin Goals v1.0.1 Release Notes

## 🐛 Bug Fixes

- Fixed theme color persistence across sessions
- Fixed race conditions in habit state updates
- Enhanced error handling throughout the application
- Improved offline support for PWA functionality

## 🚀 Performance Improvements

- Optimized habit list rendering for better performance
- Reduced unnecessary re-renders in dashboard
- Improved loading states and user feedback
- Added request caching for better offline experience

## 💪 Reliability Improvements

- Added Firebase connection retry logic
- Improved error boundaries for better error recovery
- Enhanced notification permission handling
- Added data validation for habit logging

## 🔧 Technical Improvements

- Added date-fns for consistent date handling
- Implemented axios-retry for network resilience
- Updated dependencies to latest stable versions
- Improved TypeScript type definitions

## 📱 PWA Improvements

- Enhanced offline capability
- Improved app installation experience
- Better cache management
- Added background sync for offline changes

## Known Issues

- Occasional delay in habit completion animation
- Theme switcher may require refresh on some devices
- Notification permissions may need manual reset on iOS

## Upcoming Features

- Weekly habit insights
- Custom habit categories
- Habit sharing between users
- Enhanced analytics dashboard

For detailed technical changes, please refer to our GitHub repository.

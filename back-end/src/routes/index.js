const router = require('express').Router();

// Auth & Users
router.use('/auth', require('./authRoutes'));
router.use('/users', require('./usersRoutes'));
router.use('/roles', require('./rolesRoutes'));

// Members & Types
router.use('/members', require('./membersRoutes'));
router.use('/membership-types', require('./membershipTypesRoutes'));

// Books & Inventory (Added because these files exist in your folder!)
router.use('/books', require('./booksRoutes'));

// Borrowing & Damage Reports
router.use('/borrow-records', require('./borrowRoutes')); // Fixed path name
router.use('/damage-reports', require('./damageReportsRoutes')); // Added because it exists!

// Library Logistics & Metadata
router.use('/library-entries', require('./libraryEntriesRoutes')); // Fixed path name & added leading slash
router.use('/donations', require('./donationsRoutes'));
router.use('/events', require('./eventsRoutes'));
router.use('/feedback', require('./feedbackRoutes'));
router.use('/notifications', require('./notificationsRoutes')); // Fixed path name & added leading slash

// System Logs & Admin Dashboard
router.use('/system-logs', require('./systemLogsRoutes'));
router.use('/reports', require('./reportsRoutes')); // Fixed period typo (router.use) & plural 's'
router.use('/dashboard', require('./dashboardRoutes'));

// Library Settings
router.use('/library-config', require('./libraryConfigRoutes'));
//staff

module.exports = router;
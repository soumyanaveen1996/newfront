import {
    GoogleAnalytics as GA,
    GoogleAnalyticsEventsCategories,
    GoogleAnalyticsEventsActions
} from './GoogleAnalytics';

let GoogleAnalytics = new GA();

export {
    GoogleAnalytics,
    GoogleAnalyticsEventsActions,
    GoogleAnalyticsEventsCategories
};

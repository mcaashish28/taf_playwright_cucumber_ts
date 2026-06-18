@regression @module_4 @notification
Feature: Notification Messages

  Scenario: User triggers a notification message
    Given I open the Notification Message page
    When I trigger the notification
    Then the notification should contain test data "notificationKeyword"

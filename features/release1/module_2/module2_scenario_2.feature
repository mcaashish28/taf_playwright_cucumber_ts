@regression @module_2 @alerts
Feature: JavaScript Alerts

  Scenario: User handles JS alert, confirm and prompt dialogs
    Given I open the JavaScript Alerts page
    When I accept the JS alert
    Then the alert result should contain "You successfully clicked an alert"
    When I dismiss the JS confirm
    Then the alert result should contain "You clicked: Cancel"
    When I accept the JS prompt with "AutomationRocks"
    Then the alert result should contain "AutomationRocks"

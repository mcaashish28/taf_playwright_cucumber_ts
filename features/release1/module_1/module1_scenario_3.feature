@regression @module_1 @checkboxes
Feature: Checkboxes

  Scenario: User toggles checkboxes on the page
    Given I open the Checkboxes page
    When I check checkbox at index 0
    And I uncheck checkbox at index 1
    Then checkbox at index 0 should be checked
    And checkbox at index 1 should not be checked

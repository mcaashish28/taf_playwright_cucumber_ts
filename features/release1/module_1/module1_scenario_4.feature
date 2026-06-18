@regression @module_1 @dropdown
Feature: Dropdown Selection

  Scenario: User selects an option from the dropdown using test data
    Given I open the Dropdown page
    When I select dropdown option from test data "dropdownOption"
    Then the selected dropdown option should match test data "dropdownOption"

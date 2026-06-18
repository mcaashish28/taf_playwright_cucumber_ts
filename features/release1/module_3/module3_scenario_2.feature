@regression @module_3 @tables
Feature: Data Tables - Sorting

  Scenario: User sorts the data table by last name
    Given I open the Tables page
    When I sort the table by last name
    Then the last name column should be sorted ascending

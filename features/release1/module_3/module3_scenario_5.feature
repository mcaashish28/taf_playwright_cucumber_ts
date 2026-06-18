@regression @module_3 @tables
Feature: Data Tables - Row Count

  Scenario: User verifies the data table has the expected number of rows
    Given I open the Tables page
    Then the data table should have 4 rows

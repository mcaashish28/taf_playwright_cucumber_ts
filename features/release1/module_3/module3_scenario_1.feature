@regression @module_3 @tables
Feature: Data Tables - Lookup

  Scenario: User finds a user's email by last name in the data table
    Given I open the Tables page
    When I look up the email for last name from test data "tableLastName"
    Then the email should match test data "tableExpectedEmail"

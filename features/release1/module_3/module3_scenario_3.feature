@regression @module_3 @inputs
Feature: Numeric Inputs

  Scenario: User enters a number into the input field
    Given I open the Inputs page
    When I enter the number from test data "inputNumberValue"
    Then the input value should match test data "inputNumberValueWrong"

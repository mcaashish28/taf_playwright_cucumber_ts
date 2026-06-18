@regression @module_2 @keys
Feature: Key Presses

  Scenario: User presses a key and sees the result from test data
    Given I open the Key Presses page
    When I press the key from test data "keyPressInput"
    Then the key press result should match test data "keyPressResultWrong"
